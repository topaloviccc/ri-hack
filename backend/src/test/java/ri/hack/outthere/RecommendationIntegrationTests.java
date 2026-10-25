package ri.hack.outthere;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import ri.hack.outthere.course.repository.RecommendationRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Sql("/db/worldlearn-test-data.sql")
class RecommendationIntegrationTests extends PostgresTestSupport {
    private static final String ME = "00000000-0000-0000-0000-000000000001";
    private static final String OTHER = "00000000-0000-0000-0000-000000000003";
    private static final String PAID = "10000000-0000-0000-0000-000000000001";
    private static final String FREE = "10000000-0000-0000-0000-000000000002";
    private static final String EXPENSIVE = "10000000-0000-0000-0000-000000000004";
    private static final String DRAFT = "10000000-0000-0000-0000-000000000005";
    private static final String HISTORY = "90000000-0000-0000-0000-000000000001";
    private static final String MODEL = "text-embedding-3-small";
    @Autowired MockMvc mvc;
    @Autowired JdbcClient jdbc;
    @Autowired RecommendationRepository recommendations;

    @Test
    void replacesInterestsAtomicallyAndKeepsThemPrivate() throws Exception {
        mvc.perform(get("/api/users/me/interests").with(viewer(ME)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.onboardingComplete").value(false));
        saveInterests(ME, "[\"" + HISTORY + "\",\"" + HISTORY + "\"]");
        mvc.perform(get("/api/users/me/interests").with(viewer(ME)))
                .andExpect(jsonPath("$.fieldIds.length()").value(1))
                .andExpect(jsonPath("$.fieldIds[0]").value(HISTORY));
        mvc.perform(get("/api/courses").with(viewer(ME)).param("collection", "feed"))
                .andExpect(jsonPath("$[0].id").value(PAID));
        mvc.perform(post("/api/users/me/interests").with(viewer(ME)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"fieldIds\":[\"" + UUID.randomUUID() + "\"]}"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/users/me/interests").with(viewer(ME)))
                .andExpect(jsonPath("$.fieldIds[0]").value(HISTORY));
        mvc.perform(get("/api/users/me/interests").with(viewer(OTHER)))
                .andExpect(jsonPath("$.fieldIds.length()").value(0))
                .andExpect(jsonPath("$.onboardingComplete").value(false));
        saveInterests(ME, "[]");
        mvc.perform(get("/api/users/me/interests").with(viewer(ME)))
                .andExpect(jsonPath("$.fieldIds.length()").value(0))
                .andExpect(jsonPath("$.onboardingComplete").value(true));
        mvc.perform(post("/api/users/me/interests").with(viewer(ME)).contentType(MediaType.APPLICATION_JSON)
                .content("{}" )).andExpect(status().isBadRequest());
        mvc.perform(get("/api/users/me/interests")).andExpect(status().isUnauthorized());
    }

    @Test
    void swipesChangeSemanticRankingAcrossCategoriesAndSurviveRetries() throws Exception {
        saveInterests(ME, "[]");
        var newcomer = UUID.fromString("00000000-0000-0000-0000-000000000004");
        jdbc.sql("""
                INSERT INTO app_user(id,first_name,last_name,username,email)
                VALUES (:id,'New','Learner','newcomer','newcomer@example.test')
                """).param("id", newcomer).update();
        // The unseen expensive course has no category, but shares the free course's meaning.
        embedCatalogue();
        var before = recommendations.signals(UUID.fromString(ME), MODEL);
        assertThat(before).allMatch(c -> c.vector() != null);
        mvc.perform(post("/api/courses/" + FREE + "/feedback").with(viewer(ME))
                .contentType(MediaType.APPLICATION_JSON).content("{\"action\":\"OPEN\",\"dwellMs\":12000}"))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/courses").with(viewer(ME)).param("collection", "feed").param("ids", EXPENSIVE + "," + PAID))
                .andExpect(jsonPath("$[0].id").value(EXPENSIVE));
        mvc.perform(get("/api/courses").with(viewer(newcomer)).param("collection", "feed").param("ids", EXPENSIVE + "," + PAID))
                .andExpect(jsonPath("$[0].id").value(PAID));
        for (int i = 0; i < 2; i++) mvc.perform(post("/api/courses/" + FREE + "/feedback").with(viewer(ME))
                .contentType(MediaType.APPLICATION_JSON).content("{\"action\":\"NEXT\",\"dwellMs\":100}"))
                .andExpect(status().isNoContent());
        assertThat(jdbc.sql("SELECT count(*) FROM course_feedback").query(Long.class).single()).isEqualTo(1);
        assertThat(jdbc.sql("SELECT opened FROM course_feedback").query(Boolean.class).single()).isTrue();
        assertThat(jdbc.sql("SELECT dwell_ms FROM course_feedback").query(Integer.class).single()).isEqualTo(12000);
        mvc.perform(post("/api/courses/" + FREE + "/dismiss").with(viewer(ME))).andExpect(status().isNoContent());
        mvc.perform(get("/api/courses").with(viewer(ME)).param("collection", "feed").param("ids", EXPENSIVE + "," + PAID))
                .andExpect(jsonPath("$[0].id").value(PAID));
        mvc.perform(get("/api/courses").with(viewer(ME)).param("collection", "recommended").param("ids", FREE))
                .andExpect(content().json("[]"));
    }

    @Test
    void rejectsInvalidOrInaccessibleFeedback() throws Exception {
        for (String body : List.of("{}", "{\"action\":\"LIKE\",\"dwellMs\":1}",
                "{\"action\":\"NEXT\",\"dwellMs\":-1}", "{\"action\":\"NEXT\",\"dwellMs\":120001}")) {
            mvc.perform(post("/api/courses/" + FREE + "/feedback").with(viewer(ME))
                    .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/courses/" + DRAFT + "/feedback").with(viewer(ME))
                .contentType(MediaType.APPLICATION_JSON).content("{\"action\":\"OPEN\",\"dwellMs\":1}"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/courses/" + DRAFT + "/dismiss").with(viewer(ME))).andExpect(status().isNotFound());
    }

    @Test
    void cachesEmbeddingsInvalidatesChangedContentAndBoundsRetries() {
        embedCatalogue();
        assertThat(recommendations.claim(MODEL)).isEmpty();
        jdbc.sql("UPDATE course SET description='Edited description' WHERE id=:id").param("id", UUID.fromString(FREE)).update();
        assertThat(recommendations.signals(UUID.fromString(ME), MODEL).stream()
                .filter(c -> c.id().toString().equals(FREE)).findFirst().orElseThrow().vector()).isNull();
        recommendations.discover(MODEL);
        var old = recommendations.claim(MODEL).orElseThrow();
        jdbc.sql("UPDATE course SET description='Edited again' WHERE id=:id").param("id", UUID.fromString(FREE)).update();
        recommendations.discover(MODEL);
        recommendations.complete(old, MODEL, new float[] {1, 0});
        assertThat(recommendations.signals(UUID.fromString(ME), MODEL).stream()
                .filter(c -> c.id().toString().equals(FREE)).findFirst().orElseThrow().vector()).isNull();
        for (int i = 1; i <= 5; i++) {
            assertThat(recommendations.claim(MODEL).orElseThrow().attempts()).isEqualTo(i);
            assertThat(recommendations.claim(MODEL)).isEmpty();
            jdbc.sql("UPDATE course_embedding SET next_attempt_at=now() WHERE course_id=:id")
                    .param("id", UUID.fromString(FREE)).update();
        }
        assertThat(recommendations.claim(MODEL)).isEmpty();
        recommendations.discover("another-model");
        assertThat(recommendations.claim("another-model").orElseThrow().attempts()).isEqualTo(1);
    }

    private void saveInterests(String viewer, String ids) throws Exception {
        mvc.perform(post("/api/users/me/interests").with(viewer(viewer)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"fieldIds\":" + ids + "}" )).andExpect(status().isOk());
    }

    private void embedCatalogue() {
        recommendations.discover(MODEL);
        for (int i = 0; i < 4; i++) {
            var job = recommendations.claim(MODEL).orElseThrow();
            float[] vector = switch (job.id().toString()) {
                case PAID -> new float[] {1, 0, 0};
                case FREE, EXPENSIVE -> new float[] {0, 1, 0};
                default -> new float[] {0, 0, 1};
            };
            recommendations.complete(job, MODEL, vector);
        }
    }
}
