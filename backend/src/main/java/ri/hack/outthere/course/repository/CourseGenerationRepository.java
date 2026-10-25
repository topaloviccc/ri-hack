package ri.hack.outthere.course.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.course.dto.GeneratedCourse;
import ri.hack.outthere.course.dto.GenerationResponse;
import ri.hack.outthere.course.service.PlaceGeocoder.Place;

@Repository
public class CourseGenerationRepository {
    private static final long GENERATED_COURSE_PRICE_COINS = 100;
    public record Job(UUID id, UUID userId, String query, int attempts, String draftJson, UUID leaseToken) { }
    private final JdbcClient jdbc;
    private final JsonMapper json;

    public CourseGenerationRepository(JdbcClient jdbc, JsonMapper json) { this.jdbc = jdbc; this.json = json; }

    public void lockUser(UUID user) {
        jdbc.sql("SELECT id FROM app_user WHERE id=:id FOR UPDATE").param("id", user).query(UUID.class).single();
    }

    public Optional<GenerationResponse> forQuery(UUID user, String key) {
        return jdbc.sql("SELECT id,query,state,message,course_id FROM course_generation WHERE user_id=:user AND query_key=:key")
                .param("user", user).param("key", key).query(GenerationResponse.class).optional();
    }

    public Optional<GenerationResponse> get(UUID user, UUID id) {
        return jdbc.sql("SELECT id,query,state,message,course_id FROM course_generation WHERE user_id=:user AND id=:id")
                .param("user", user).param("id", id).query(GenerationResponse.class).optional();
    }

    public Optional<GenerationResponse> active(UUID user) {
        return jdbc.sql("SELECT id,query,state,message,course_id FROM course_generation WHERE user_id=:user AND state IN ('QUEUED','RUNNING')")
                .param("user", user).query(GenerationResponse.class).optional();
    }

    public GenerationResponse enqueue(UUID user, String query, String key) {
        return jdbc.sql("""
                INSERT INTO course_generation(user_id,query,query_key) VALUES (:user,:query,:key)
                ON CONFLICT(user_id,query_key) DO UPDATE SET state='QUEUED',attempts=0,repair_attempts=0,message=NULL,draft_json=NULL,lease_until=NULL,updated_at=now()
                RETURNING id,query,state,message,course_id
                """).param("user", user).param("query", query).param("key", key).query(GenerationResponse.class).single();
    }

    public List<String> subjects() { return jdbc.sql("SELECT label FROM field ORDER BY label").query(String.class).list(); }
    public List<String> countries() { return jdbc.sql("SELECT iso_code FROM country").query(String.class).list(); }

    @Transactional
    public Optional<Job> claim() {
        jdbc.sql("""
                UPDATE course_generation SET state='FAILED',message='Creation could not finish. Please try again.',updated_at=now()
                WHERE state='RUNNING' AND lease_until<now() AND attempts>=3
                """).update();
        return jdbc.sql("""
                UPDATE course_generation SET state='RUNNING',attempts=attempts+1,
                    lease_until=now()+interval '5 minutes',lease_token=gen_random_uuid(),updated_at=now()
                WHERE id=(SELECT id FROM course_generation WHERE
                    (state='QUEUED' OR (state='RUNNING' AND lease_until<now())) AND attempts<3
                    ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1)
                RETURNING id,user_id,query,attempts,draft_json::text,lease_token
                """).query(Job.class).optional();
    }

    public void saveDraft(Job job, GeneratedCourse draft) {
        jdbc.sql("UPDATE course_generation SET draft_json=CAST(:draft AS jsonb) WHERE id=:id AND state='RUNNING' AND lease_token=:token")
                .param("draft", json.writeValueAsString(draft)).param("id", job.id()).param("token", job.leaseToken()).update();
    }

    public boolean beginRepair(Job job, String feedback) {
        return jdbc.sql("""
                UPDATE course_generation SET repair_attempts=1,message=:feedback,
                    lease_until=now()+interval '8 minutes',updated_at=now()
                WHERE id=:id AND state='RUNNING' AND lease_token=:token AND repair_attempts=0
                """).param("feedback", feedback).param("id", job.id()).param("token", job.leaseToken()).update() == 1;
    }

    public void finish(Job job, String state, String message) {
        jdbc.sql("""
                UPDATE course_generation SET state=:state,message=:message,lease_until=NULL,updated_at=now()
                WHERE id=:id AND state='RUNNING' AND lease_token=:token
                """).param("state", state).param("message", message).param("id", job.id()).param("token", job.leaseToken()).update();
    }

    public void retry(Job job) {
        // Leave the lease in place to back off before another attempt; restart recovery uses the same path.
        if (job.attempts() >= 3) finish(job, "FAILED", "Creation could not finish. Please try again.");
    }

    @Transactional
    public void publish(Job job, GeneratedCourse draft, List<Place> places) {
        var owned = jdbc.sql("SELECT lease_token FROM course_generation WHERE id=:id AND state='RUNNING' FOR UPDATE")
                .param("id", job.id()).query(UUID.class).optional();
        if (owned.isEmpty() || !owned.get().equals(job.leaseToken())) return;
        UUID country = jdbc.sql("SELECT id FROM country WHERE iso_code=:code").param("code", draft.countryCode()).query(UUID.class).single();
        UUID course = UUID.randomUUID(), version = UUID.randomUUID();
        jdbc.sql("""
                INSERT INTO course(id,creator_id,title,description,country_id,difficulty_id,estimated_minutes,price_coins)
                VALUES (:id,:user,:title,:description,:country,(SELECT id FROM difficulty WHERE label=:difficulty),:minutes,:price)
                """).param("id", course).param("user", job.userId()).param("title", draft.title())
                .param("description", draft.description()).param("country", country).param("difficulty", draft.difficulty())
                .param("minutes", draft.estimatedMinutes()).param("price", GENERATED_COURSE_PRICE_COINS).update();
        jdbc.sql("""
                INSERT INTO course_version(id,course_id,version_number,title,description,objectives_json,difficulty_id,
                    estimated_minutes,publication_status_id,human_verified,created_by,published_at)
                VALUES (:id,:course,1,:title,:description,CAST(:objectives AS jsonb),
                    (SELECT id FROM difficulty WHERE label=:difficulty),:minutes,
                    (SELECT id FROM publication_status WHERE label='PUBLISHED'),false,:user,now())
                """).param("id", version).param("course", course).param("title", draft.title()).param("description", draft.description())
                .param("objectives", json.writeValueAsString(draft.objectives())).param("difficulty", draft.difficulty())
                .param("minutes", draft.estimatedMinutes()).param("user", job.userId()).update();
        jdbc.sql("INSERT INTO course_field(course_id,field_id) SELECT :course,id FROM field WHERE label=:subject")
                .param("course", course).param("subject", draft.subject()).update();
        for (Place place : places) {
            UUID placeId = jdbc.sql("""
                    INSERT INTO place(name,country_id,address,latitude,longitude,geocoder_id,geocoder_attribution)
                    VALUES (:name,:country,:address,:lat,:lng,:identity,:attribution)
                    ON CONFLICT(geocoder_id) DO UPDATE SET geocoder_id=EXCLUDED.geocoder_id
                    WHERE place.country_id=EXCLUDED.country_id AND place.archived_at IS NULL
                    RETURNING id
                    """).param("name", place.name()).param("country", country).param("address", place.address())
                    .param("lat", place.lat()).param("lng", place.lng()).param("identity", place.identity())
                    .param("attribution", place.attribution()).query(UUID.class).single();
            jdbc.sql("INSERT INTO course_place(course_id,place_id) VALUES (:course,:place) ON CONFLICT DO NOTHING")
                    .param("course", course).param("place", placeId).update();
            jdbc.sql("INSERT INTO cover_image_job(place_id,priority) VALUES (:place,10) ON CONFLICT(place_id) DO UPDATE SET priority=10")
                    .param("place", placeId).update();
        }
        int position = 0;
        for (var lesson : draft.lessons()) {
            UUID id = UUID.randomUUID();
            jdbc.sql("""
                    INSERT INTO lesson(id,course_version_id,position,title,content_json)
                    VALUES (:id,:version,:position,:title,CAST(:content AS jsonb))
                    """).param("id", id).param("version", version).param("position", ++position).param("title", lesson.title())
                    .param("content", json.writeValueAsString(java.util.Map.of("format", "markdown", "markdown", lesson.markdown(),
                            "estimatedMinutes", lesson.estimatedMinutes()))).update();
            insertQuiz(version, id, lesson.quiz());
        }
        insertQuiz(version, null, draft.finalQuiz());
        jdbc.sql("UPDATE course SET current_published_version_id=:version WHERE id=:course")
                .param("version", version).param("course", course).update();
        jdbc.sql("INSERT INTO cover_image_job(course_id,priority) VALUES (:course,10) ON CONFLICT(course_id) DO NOTHING")
                .param("course", course).update();
        jdbc.sql("""
                UPDATE course_generation SET state='READY',course_id=:course,message=NULL,lease_until=NULL,updated_at=now()
                WHERE id=:id
                """).param("course", course).param("id", job.id()).update();
    }

    private void insertQuiz(UUID version, UUID lesson, GeneratedCourse.Quiz quiz) {
        UUID id = UUID.randomUUID();
        jdbc.sql("INSERT INTO quiz(id,course_version_id,lesson_id,title) VALUES (:id,:version,:lesson,:title)")
                .param("id", id).param("version", version).param("lesson", lesson).param("title", quiz.title()).update();
        int position = 0;
        for (var question : quiz.questions()) {
            UUID questionId = UUID.randomUUID();
            jdbc.sql("""
                    INSERT INTO question(id,quiz_id,question_type_id,prompt,explanation,position)
                    VALUES (:id,:quiz,(SELECT id FROM question_type WHERE label=:type),:prompt,:explanation,:position)
                    """).param("id", questionId).param("quiz", id).param("type", question.type()).param("prompt", question.prompt())
                    .param("explanation", question.explanation()).param("position", ++position).update();
            int optionPosition = 0;
            for (var option : question.options()) jdbc.sql("""
                    INSERT INTO answer_option(question_id,answer_text,is_correct,position) VALUES (:question,:text,:correct,:position)
                    """).param("question", questionId).param("text", option.text()).param("correct", option.correct())
                    .param("position", ++optionPosition).update();
        }
    }
}
