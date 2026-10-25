package ri.hack.outthere;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import ri.hack.outthere.image.dto.CoverImageResponse;
import ri.hack.outthere.image.model.ImageCandidate;
import ri.hack.outthere.image.repository.CoverImageRepository;
import ri.hack.outthere.image.service.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Sql("/db/worldlearn-test-data.sql")
class CoverImageIntegrationTests extends PostgresTestSupport {
    static final UUID ME = UUID.fromString("00000000-0000-0000-0000-000000000001");
    static final UUID COURSE = UUID.fromString("10000000-0000-0000-0000-000000000001");
    static final UUID PLACE = UUID.fromString("70000000-0000-0000-0000-000000000001");
    static final CoverImageResponse IMAGE = new CoverImageResponse("https://upload.wikimedia.org/castle.jpg",
            "https://commons.wikimedia.org/wiki/File:Castle.jpg", "Real author", "CC BY-SA 4.0",
            "https://creativecommons.org/licenses/by-sa/4.0/", "A castle photograph", 1280, 850);
    @Autowired CoverImageRepository jobs;
    @Autowired JdbcClient jdbc;
    @Autowired MockMvc mvc;
    @MockitoBean CommonsImageSearch search;
    @MockitoBean CoverImageSelector selector;
    CoverImageWorker worker;
    @BeforeEach void providers() {
        worker = new CoverImageWorker(jobs, search, selector, true);
        when(selector.available()).thenReturn(true);
        when(selector.queries(any())).thenReturn(List.of("Castle"));
        when(search.search(anyString())).thenReturn(List.of(new ImageCandidate("commons:42", "Castle", "A castle", IMAGE)));
        when(selector.select(any(), anyList())).thenReturn(Optional.of(IMAGE));
        when(search.reachable(IMAGE)).thenReturn(true);
    }

    @Test void fillsCourseAndPlaceCoversOnceAndReturnsCreditsEverywhere() throws Exception {
        jobs.discover();
        mvc.perform(get("/api/courses/" + COURSE).with(viewer(ME)))
                .andExpect(jsonPath("$.coverImagePending").value(true)).andExpect(jsonPath("$.coverImage").doesNotExist());
        for (int i = 0; i < 5; i++) worker.tick();
        mvc.perform(get("/api/courses/" + COURSE).with(viewer(ME)))
                .andExpect(jsonPath("$.coverImage.url").value(IMAGE.url()))
                .andExpect(jsonPath("$.coverImage.author").value("Real author"))
                .andExpect(jsonPath("$.coverImagePending").value(false))
                .andExpect(jsonPath("$.locations[0].coverImage.license").value("CC BY-SA 4.0"));
        mvc.perform(get("/api/locations/" + PLACE).with(viewer(ME)))
                .andExpect(jsonPath("$.coverImage.sourceUrl").value(IMAGE.sourceUrl()));
        worker.tick();
        verify(selector, times(5)).select(any(), anyList());
        assertThat(jdbc.sql("SELECT count(*) FROM cover_image_job").query(Integer.class).single()).isEqualTo(5);
    }

    @Test void noSuitableImageLeavesCourseUsableAndDoesNotRetryForever() throws Exception {
        when(selector.select(any(), anyList())).thenReturn(Optional.empty());
        for (int i = 0; i < 6; i++) worker.tick();
        assertThat(jdbc.sql("SELECT count(*) FROM cover_image_job WHERE state='NOT_FOUND'").query(Integer.class).single()).isEqualTo(5);
        mvc.perform(get("/api/courses/" + COURSE).with(viewer(ME))).andExpect(status().isOk())
                .andExpect(jsonPath("$.coverImagePending").value(false)).andExpect(jsonPath("$.coverImage").doesNotExist());
        verify(search, never()).reachable(any());
    }

    @Test void expiredLeasesRecoverButStaleWorkerCannotOverwriteCurrentImage() {
        jobs.discover();
        var stale = jobs.claim().orElseThrow();
        jdbc.sql("UPDATE cover_image_job SET available_at=now()-interval '1 second',created_at=now()-interval '1 day' WHERE id=:id")
                .param("id", stale.id()).update();
        var recovered = jobs.claim().orElseThrow();
        assertThat(recovered.id()).isEqualTo(stale.id());
        jobs.complete(stale, IMAGE);
        assertThat(jdbc.sql("SELECT state FROM cover_image_job WHERE id=:id").param("id", stale.id()).query(String.class).single()).isEqualTo("RUNNING");
        jobs.complete(recovered, IMAGE);
        assertThat(jdbc.sql("SELECT state FROM cover_image_job WHERE id=:id").param("id", stale.id()).query(String.class).single()).isEqualTo("READY");
    }

    @Test void providerFailureIsBoundedAndDoesNotOverwriteExistingCuratedCover() {
        when(search.reachable(any())).thenReturn(false);
        jobs.discover();
        var job = jobs.claim().orElseThrow();
        jobs.fail(job, true);
        assertThat(jdbc.sql("SELECT state FROM cover_image_job WHERE id=:id").param("id", job.id()).query(String.class).single()).isEqualTo("FAILED");
        var current = jobs.claim().orElseThrow();
        String table = current.courseId() == null ? "place" : "course";
        UUID target = current.courseId() == null ? current.placeId() : current.courseId();
        jdbc.sql("UPDATE " + table + " SET cover_image=CAST(:image AS jsonb) WHERE id=:id")
                .param("image", "{\"caption\":\"Curated image\"}").param("id", target).update();
        jobs.complete(current, IMAGE);
        assertThat(jdbc.sql("SELECT cover_image->>'caption' FROM " + table + " WHERE id=:id").param("id", target).query(String.class).single())
                .isEqualTo("Curated image");
    }
}
