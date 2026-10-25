package ri.hack.outthere;

import java.math.BigDecimal;
import java.util.List;
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
import ri.hack.outthere.course.repository.CourseGenerationRepository;
import ri.hack.outthere.course.service.*;
import ri.hack.outthere.learning.service.LearningService;
import ri.hack.outthere.wallet.service.WalletService;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.generation.worker-initial-delay-ms=3600000")
@AutoConfigureMockMvc
@Sql("/db/worldlearn-test-data.sql")
class CourseGenerationIntegrationTests extends PostgresTestSupport {
    static final UUID ME = UUID.fromString("00000000-0000-0000-0000-000000000001");
    static final UUID OTHER = UUID.fromString("00000000-0000-0000-0000-000000000002");
    @Autowired CourseGenerationService service;
    @Autowired CourseGenerationWorker worker;
    @Autowired CourseGenerationRepository jobs;
    @Autowired CourseService courses;
    @Autowired WalletService wallets;
    @Autowired LearningService learning;
    @Autowired JdbcClient jdbc;
    @Autowired MockMvc mvc;
    @MockitoBean CourseGenerationModel model;
    @MockitoBean PlaceGeocoder geocoder;

    @BeforeEach void providers() {
        when(model.available()).thenReturn(true);
        when(geocoder.available()).thenReturn(true);
        when(model.generate(anyString(), anyList())).thenReturn(GeneratedCourseFixtures.course());
        when(geocoder.resolve(anyList(), eq("ME"))).thenReturn(List.of(new PlaceGeocoder.Place("osm:relation:123", "Kotor",
                "Kotor, Montenegro", new BigDecimal("42.424662"), new BigDecimal("18.771234"), "© OpenStreetMap contributors")));
    }

    @Test void searchesTitleStemmedDescriptionAndSubjectAndKeepsOtherFilters() throws Exception {
        assertThat(courses.search(ME, null, null, null, null, "  PAID   course ")).hasSize(1);
        jdbc.sql("UPDATE course SET description='Traditional sailing techniques' WHERE title='Free course'").update();
        assertThat(courses.search(ME, null, null, null, null, "sail")).hasSize(1);
        assertThat(courses.search(ME, null, null, null, null, "History")).hasSize(1);
        assertThat(courses.search(ME, null, "HR", null, null, "History")).isEmpty();
        assertThat(courses.search(ME, null, null, null, null, "Draft")).isEmpty();
        assertThat(courses.search(ME, null, null, null, null, "%_'")).isEmpty();
        mvc.perform(get("/api/courses").param("query", "Paid").with(viewer(ME))).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/courses").param("query", "x".repeat(201)).with(viewer(ME))).andExpect(status().isBadRequest());
    }

    @Test void queuesIdempotentlyAndPublishesCompletePlayableCourseWithVerifiedPlaces() throws Exception {
        var job = service.create(ME, "Kotor maritime heritage");
        assertThat(service.create(ME, "  KOTOR   maritime heritage ").id()).isEqualTo(job.id());
        verify(model, never()).generate(anyString(), anyList());
        mvc.perform(get("/api/course-generations/" + job.id()).with(viewer(OTHER))).andExpect(status().isNotFound());
        worker.tick();
        var done = service.get(ME, job.id());
        assertThat(done.state()).isEqualTo("READY");
        UUID course = done.courseId();
        assertThat(courses.get(ME, course).locations()).singleElement().satisfies(place -> {
            assertThat(place.lat()).isEqualByComparingTo("42.424662");
            assertThat(place.geocoderAttribution()).contains("OpenStreetMap");
        });
        assertThat(jdbc.sql("SELECT count(*) FROM quiz WHERE course_version_id=(SELECT current_published_version_id FROM course WHERE id=:id)")
                .param("id", course).query(Integer.class).single()).isEqualTo(4);
        assertThat(jdbc.sql("SELECT count(*) FROM question WHERE quiz_id IN (SELECT id FROM quiz WHERE course_version_id=(SELECT current_published_version_id FROM course WHERE id=:id))")
                .param("id", course).query(Integer.class).single()).isEqualTo(11);
        assertThat(courses.get(ME, course).unlockCost()).isEqualTo(100);
        assertThat(courses.get(ME, course).isUnlocked()).isFalse();
        assertThat(wallets.get(ME).availableBalance()).isEqualTo(100);
        assertThatThrownBy(() -> wallets.unlock(OTHER, course, "generated-insufficient-coins"))
                .hasMessage("Not enough coins");
        assertThat(courses.get(OTHER, course).isUnlocked()).isFalse();
        assertThat(wallets.unlock(ME, course, "generated-course-purchase").availableBalance()).isZero();
        assertThat(wallets.unlock(ME, course, "generated-course-purchase").availableBalance()).isZero();
        assertThat(courses.get(ME, course).isUnlocked()).isTrue();
        assertThat(courses.search(ME, null, null, null, null, "Paid course").getFirst().unlockCost()).isEqualTo(40);
        var outline = learning.start(ME, course);
        assertThat(outline.lessons()).hasSize(3);
        assertThat(outline.lessons().getFirst().text()).startsWith("## ");
        assertThat(outline.lessons().getFirst().demo()).isFalse();
        assertThat(service.create(ME, "Kotor maritime heritage").courseId()).isEqualTo(course);
        worker.tick();
        verify(model, times(1)).generate(anyString(), anyList());
    }

    @Test void refusesGlobalTopicsWithoutGeocodingOrWritingAnyCourse() {
        when(model.generate(anyString(), anyList())).thenReturn(GeneratedCourseFixtures.refusal());
        var job = service.create(ME, "Global mathematics");
        worker.tick();
        assertThat(service.get(ME, job.id()).state()).isEqualTo("REFUSED");
        assertThat(service.get(ME, job.id()).message()).contains("dominant country");
        verify(geocoder, never()).resolve(anyList(), anyString());
        assertThat(countCourses()).isEqualTo(5);
    }

    @Test void rejectsUnresolvedPlacesAtomicallyAndAllowsExplicitRetry() {
        when(geocoder.resolve(anyList(), anyString())).thenThrow(new IllegalArgumentException("Ambiguous"));
        var job = service.create(ME, "Kotor maritime heritage");
        worker.tick();
        assertThat(service.get(ME, job.id()).state()).isEqualTo("FAILED");
        assertThat(countCourses()).isEqualTo(5);
        assertThat(service.create(ME, job.query()).id()).isEqualTo(job.id());
        assertThat(jdbc.sql("SELECT draft_json IS NULL FROM course_generation WHERE id=:id").param("id",job.id())
                .query(Boolean.class).single()).isTrue();
    }

    @Test void repairsInvalidModelContentUsingSpecificFeedbackBeforePublishing() {
        var valid = GeneratedCourseFixtures.course();
        var invalid = new ri.hack.outthere.course.dto.GeneratedCourse(null, valid.title(), valid.description(), valid.countryCode(),
                valid.countryReason(), valid.subject(), valid.difficulty(), valid.estimatedMinutes(), valid.objectives(), valid.places(), valid.lessons(), null);
        when(model.generate(anyString(), anyList())).thenReturn(invalid);
        when(model.repair(anyString(), anyList(), eq(invalid), contains("finalQuiz"))).thenReturn(valid);
        var job = service.create(ME, "Kotor maritime heritage");
        worker.tick();
        assertThat(service.get(ME, job.id()).state()).isEqualTo("READY");
        verify(model).repair(eq(job.query()), anyList(), eq(invalid), contains("finalQuiz"));
        assertThat(jdbc.sql("SELECT repair_attempts FROM course_generation WHERE id=:id").param("id",job.id()).query(Integer.class).single()).isEqualTo(1);
    }

    @Test void repairsUnmappablePlacesOnceAndDoesNotWeakenGeographicValidation() {
        var valid = GeneratedCourseFixtures.course();
        when(geocoder.resolve(anyList(), anyString()))
                .thenThrow(new GenerationValidationException("places[0]", "No map match for Kotor"))
                .thenReturn(List.of(new PlaceGeocoder.Place("osm:node:45", "Kotor", "Kotor, Montenegro", BigDecimal.ONE, BigDecimal.ONE, "OSM")));
        when(model.repair(anyString(), anyList(), any(), contains("No map match"))).thenReturn(valid);
        var job = service.create(ME, "Kotor maritime heritage");
        worker.tick();
        assertThat(service.get(ME, job.id()).state()).isEqualTo("READY");
        verify(model, times(1)).repair(anyString(), anyList(), any(), anyString());
        verify(geocoder, times(2)).resolve(anyList(), anyString());
    }

    @Test void persistsRejectedDraftAndSpecificFailureAndBoundsRepairAcrossRecovery() {
        var valid = GeneratedCourseFixtures.course();
        var invalid = new ri.hack.outthere.course.dto.GeneratedCourse(null, valid.title(), valid.description(), valid.countryCode(),
                valid.countryReason(), valid.subject(), valid.difficulty(), valid.estimatedMinutes(), valid.objectives(), valid.places(), valid.lessons(), null);
        when(model.generate(anyString(), anyList())).thenReturn(invalid);
        when(model.repair(anyString(), anyList(), any(), anyString())).thenThrow(new IllegalStateException("Provider offline"));
        var job = service.create(ME, "Kotor maritime heritage");
        worker.tick();
        jdbc.sql("UPDATE course_generation SET lease_until=now()-interval '1 second' WHERE id=:id").param("id",job.id()).update();
        worker.tick();
        var failed = service.get(ME, job.id());
        assertThat(failed.state()).isEqualTo("FAILED");
        assertThat(failed.message()).contains("finalQuiz", "Missing paired or final quiz");
        assertThat(jdbc.sql("SELECT draft_json IS NOT NULL FROM course_generation WHERE id=:id").param("id",job.id())
                .query(Boolean.class).single()).isTrue();
        verify(model, times(1)).generate(anyString(), anyList());
        verify(model, times(1)).repair(anyString(), anyList(), any(), anyString());
        verify(geocoder, never()).resolve(anyList(), anyString());
        assertThat(countCourses()).isEqualTo(5);
    }

    @Test void recoversExpiredLeaseReusesDraftAndBoundsRetries() {
        when(geocoder.resolve(anyList(), anyString())).thenThrow(new IllegalStateException("Provider offline"));
        var job = service.create(ME, "Kotor maritime heritage");
        for (int i = 0; i < 3; i++) {
            worker.tick();
            jdbc.sql("UPDATE course_generation SET lease_until=now()-interval '1 second' WHERE id=:id").param("id",job.id()).update();
        }
        assertThat(service.get(ME, job.id()).state()).isEqualTo("FAILED");
        verify(model, times(1)).generate(anyString(), anyList());
        assertThat(countCourses()).isEqualTo(5);
    }

    @Test void reportsGeocoderAuthorizationFailureImmediatelyWithoutExposingProviderBody() {
        when(geocoder.resolve(anyList(), anyString())).thenThrow(org.springframework.web.client.HttpClientErrorException.create(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized", org.springframework.http.HttpHeaders.EMPTY,
                "private-provider-response".getBytes(java.nio.charset.StandardCharsets.UTF_8), java.nio.charset.StandardCharsets.UTF_8));
        var job = service.create(ME, "Kotor maritime heritage");
        worker.tick();
        var failed = service.get(ME, job.id());
        assertThat(failed.state()).isEqualTo("FAILED");
        assertThat(failed.message()).contains("Place geocoder", "GEOCODER_API_KEY", "GEOCODER_AUTH_MODE")
                .doesNotContain("private-provider-response");
        worker.tick();
        verify(geocoder, times(1)).resolve(anyList(), anyString());
        assertThat(countCourses()).isEqualTo(5);
    }

    @Test void reportsWrappedModelAuthorizationFailureWithoutCallingGeocoder() {
        var denied = org.springframework.web.client.HttpClientErrorException.create(org.springframework.http.HttpStatus.FORBIDDEN,
                "Forbidden", org.springframework.http.HttpHeaders.EMPTY, new byte[0], java.nio.charset.StandardCharsets.UTF_8);
        when(model.generate(anyString(), anyList())).thenThrow(new IllegalStateException("Model transport failed", denied));
        var job = service.create(ME, "Kotor maritime heritage");
        worker.tick();
        assertThat(service.get(ME, job.id()).state()).isEqualTo("FAILED");
        assertThat(service.get(ME, job.id()).message()).contains("Course model", "OPENAI_API_KEY");
        verify(geocoder, never()).resolve(anyList(), anyString());
        assertThat(countCourses()).isEqualTo(5);
    }

    @Test void serializesActiveRequestsAndRejectsExistingMatchesAndUnavailableProviders() throws Exception {
        assertThatThrownBy(() -> service.create(ME, "Paid course")).hasMessageContaining("already available");
        assertThatThrownBy(() -> service.create(ME, " ")).hasMessageContaining("topic");
        when(model.available()).thenReturn(false);
        mvc.perform(post("/api/course-generations").with(viewer(ME)).contentType("application/json")
                .content("{\"query\":\"Kotor maritime heritage\"}")).andExpect(status().isConflict());
        when(model.available()).thenReturn(true);
        service.create(ME, "Kotor maritime heritage");
        assertThatThrownBy(() -> service.create(ME, "Cetinje heritage")).hasMessageContaining("previous course");
    }

    @Test void rollsBackAllContentIfPersistenceFails() {
        var queued = service.create(ME, "Kotor maritime heritage");
        var claimed = jobs.claim().orElseThrow();
        var draft = GeneratedCourseFixtures.course();
        // Validated providers cannot ordinarily cause this; exercise the publication transaction itself.
        assertThatThrownBy(() -> jobs.publish(claimed, draft, List.of(new PlaceGeocoder.Place("osm:node:1", "x".repeat(201),
                "Address", BigDecimal.ONE, BigDecimal.ONE, "Attribution")))).isInstanceOf(RuntimeException.class);
        assertThat(countCourses()).isEqualTo(5);
        assertThat(service.get(ME, queued.id()).courseId()).isNull();
    }

    @Test void staleWorkerCannotPublishOrFinishAfterRecoveryOrAnExplicitRetry() {
        var queued = service.create(ME, "Kotor maritime heritage");
        var stale = jobs.claim().orElseThrow();
        jobs.finish(stale, "FAILED", "Failure");
        service.create(ME, queued.query());
        var current = jobs.claim().orElseThrow();
        assertThat(current.attempts()).isEqualTo(stale.attempts());
        assertThat(current.leaseToken()).isNotEqualTo(stale.leaseToken());
        jobs.finish(stale, "REFUSED", "Old refusal");
        jobs.publish(stale, GeneratedCourseFixtures.course(), List.of());
        assertThat(service.get(ME, queued.id()).state()).isEqualTo("RUNNING");
        assertThat(countCourses()).isEqualTo(5);
        jdbc.sql("UPDATE course_generation SET lease_until=now()-interval '1 second' WHERE id=:id").param("id",queued.id()).update();
        var recovered = jobs.claim().orElseThrow();
        jobs.finish(current, "REFUSED", "Old refusal");
        assertThat(service.get(ME, queued.id()).state()).isEqualTo("RUNNING");
        assertThat(recovered.leaseToken()).isNotEqualTo(current.leaseToken());
    }

    int countCourses() { return jdbc.sql("SELECT count(*) FROM course").query(Integer.class).single(); }
}
