package ri.hack.outthere.image.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.image.dto.CoverImageResponse;

@Repository
public class CoverImageRepository {
    public record Job(UUID id, UUID courseId, UUID placeId, int attempts, UUID leaseToken) { }
    public record Context(String title, String description, String country, String placeName) { }
    private final JdbcClient jdbc;
    private final JsonMapper json;
    public CoverImageRepository(JdbcClient jdbc, JsonMapper json) { this.jdbc = jdbc; this.json = json; }

    @Transactional
    public void discover() {
        jdbc.sql("""
                INSERT INTO cover_image_job(course_id)
                SELECT c.id FROM course c JOIN course_version v ON v.id=c.current_published_version_id
                JOIN publication_status ps ON ps.id=v.publication_status_id
                JOIN visibility vis ON vis.id=c.visibility_id
                WHERE c.cover_image IS NULL AND c.archived_at IS NULL AND ps.label='PUBLISHED' AND vis.label='PUBLIC'
                ON CONFLICT(course_id) DO NOTHING
                """).update();
        jdbc.sql("""
                INSERT INTO cover_image_job(place_id) SELECT id FROM place
                WHERE cover_image IS NULL AND archived_at IS NULL
                ON CONFLICT(place_id) DO NOTHING
                """).update();
    }

    @Transactional
    public Optional<Job> claim() {
        jdbc.sql("""
                UPDATE cover_image_job SET state='FAILED',message='Image lookup could not finish',updated_at=now()
                WHERE state='RUNNING' AND available_at<now() AND attempts>=3
                """).update();
        return jdbc.sql("""
                UPDATE cover_image_job SET state='RUNNING',attempts=attempts+1,lease_token=gen_random_uuid(),
                    available_at=now()+interval '3 minutes',updated_at=now()
                WHERE id=(SELECT id FROM cover_image_job WHERE state IN ('QUEUED','RUNNING')
                    AND available_at<=now() AND attempts<3 ORDER BY priority DESC,created_at,id FOR UPDATE SKIP LOCKED LIMIT 1)
                RETURNING id,course_id,place_id,attempts,lease_token
                """).query(Job.class).optional();
    }

    public Optional<Context> context(Job job) {
        if (job.courseId() != null) return jdbc.sql("""
                SELECT c.title,coalesce(c.description,'') AS description,coalesce(n.label,'') AS country,
                  coalesce((SELECT p.name FROM course_place cp JOIN place p ON p.id=cp.place_id
                    WHERE cp.course_id=c.id AND p.archived_at IS NULL ORDER BY p.name,p.id LIMIT 1),'') AS place_name
                FROM course c LEFT JOIN country n ON n.id=c.country_id
                JOIN course_version v ON v.id=c.current_published_version_id
                JOIN publication_status ps ON ps.id=v.publication_status_id JOIN visibility vis ON vis.id=c.visibility_id
                WHERE c.id=:id AND c.archived_at IS NULL AND c.cover_image IS NULL AND ps.label='PUBLISHED' AND vis.label='PUBLIC'
                """).param("id", job.courseId()).query(Context.class).optional();
        return jdbc.sql("""
                SELECT p.name AS title,coalesce(p.address,p.description,'') AS description,n.label AS country,p.name AS place_name
                FROM place p JOIN country n ON n.id=p.country_id
                WHERE p.id=:id AND p.archived_at IS NULL AND p.cover_image IS NULL
                """).param("id", job.placeId()).query(Context.class).optional();
    }

    @Transactional
    public void complete(Job job, CoverImageResponse image) {
        var token = jdbc.sql("SELECT lease_token FROM cover_image_job WHERE id=:id AND state='RUNNING' FOR UPDATE")
                .param("id", job.id()).query(UUID.class).optional();
        if (token.isEmpty() || !token.get().equals(job.leaseToken())) return;
        if (image != null) {
            String table = job.courseId() == null ? "place" : "course";
            UUID target = job.courseId() == null ? job.placeId() : job.courseId();
            jdbc.sql("UPDATE " + table + " SET cover_image=CAST(:image AS jsonb) WHERE id=:id AND cover_image IS NULL AND archived_at IS NULL")
                    .param("image", json.writeValueAsString(image)).param("id", target).update();
        }
        finish(job, image == null ? "NOT_FOUND" : "READY", null);
    }

    public void fail(Job job, boolean terminal) {
        if (terminal || job.attempts() >= 3) finish(job, "FAILED", "Image provider unavailable");
        // Otherwise the persisted lease backs off and recovers the job, including after restarts.
    }

    private void finish(Job job, String state, String message) {
        jdbc.sql("""
                UPDATE cover_image_job SET state=:state,message=:message,updated_at=now()
                WHERE id=:id AND state='RUNNING' AND lease_token=:token
                """).param("state", state).param("message", message).param("id", job.id()).param("token", job.leaseToken()).update();
    }
}
