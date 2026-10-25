package ri.hack.outthere.course.repository;

import java.util.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class RecommendationRepository {
    // The exact same input/hash is used by the worker and by reads. Editing a
    // title, description or category immediately makes an old vector ineligible.
    private static final String CONTENT = """
            SELECT c.id, left(c.title || E'\\n' || coalesce(c.description,'') || E'\\n' ||
              coalesce((SELECT string_agg(f.label, ', ' ORDER BY f.id)
                FROM course_field cf JOIN field f ON f.id=cf.field_id WHERE cf.course_id=c.id),''),2000) AS text
            FROM course c JOIN visibility vis ON vis.id=c.visibility_id
            JOIN course_version v ON v.id=c.current_published_version_id
            JOIN publication_status ps ON ps.id=v.publication_status_id
            WHERE c.archived_at IS NULL AND vis.label='PUBLIC' AND ps.label='PUBLISHED'
            """;
    private final JdbcClient jdbc;
    public RecommendationRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public record SignalCourse(UUID id, Set<UUID> fields, float[] vector, double signal, boolean seen) { }
    public record EmbeddingJob(UUID id, String text, String hash, int attempts) { }

    public List<SignalCourse> signals(UUID viewer, String model) {
        return jdbc.sql("WITH content AS (" + CONTENT + """
                ) SELECT c.id,
                  ARRAY(SELECT field_id FROM course_field WHERE course_id=c.id) AS fields,
                  emb.embedding,
                  CASE WHEN coalesce(p.is_dismissed,false) THEN -1.25
                       WHEN EXISTS(SELECT 1 FROM enrollment e WHERE e.user_id=:viewer AND e.course_id=c.id
                            AND e.completed_at IS NOT NULL) THEN 1.0
                       WHEN coalesce(fb.opened,false) THEN 0.8
                       WHEN EXISTS(SELECT 1 FROM enrollment e WHERE e.user_id=:viewer AND e.course_id=c.id
                            AND e.first_opened_at IS NOT NULL) THEN 0.6
                       WHEN fb.dwell_ms>=10000 THEN 0.2
                       WHEN fb.dwell_ms BETWEEN 1 AND 2499 THEN -0.15 ELSE 0 END AS signal,
                  (fb.course_id IS NOT NULL) AS seen
                FROM content c
                LEFT JOIN course_embedding emb ON emb.course_id=c.id AND emb.model=:model
                  AND emb.content_hash=md5(c.text)
                LEFT JOIN user_course_preference p ON p.course_id=c.id AND p.user_id=:viewer
                LEFT JOIN course_feedback fb ON fb.course_id=c.id AND fb.user_id=:viewer
                """).param("viewer", viewer).param("model", model).query((rs, row) -> {
                    Set<UUID> fields = new HashSet<>();
                    for (Object id : (Object[]) rs.getArray("fields").getArray()) fields.add((UUID) id);
                    float[] vector = null;
                    if (rs.getArray("embedding") != null) {
                        var values = (Object[]) rs.getArray("embedding").getArray();
                        vector = new float[values.length];
                        for (int i = 0; i < values.length; i++) vector[i] = ((Number) values[i]).floatValue();
                    }
                    return new SignalCourse(rs.getObject("id", UUID.class), fields, vector,
                            rs.getDouble("signal"), rs.getBoolean("seen"));
                }).list();
    }

    public Set<UUID> interests(UUID viewer) {
        return new HashSet<>(jdbc.sql("SELECT field_id FROM user_interest WHERE user_id=:viewer")
                .param("viewer", viewer).query(UUID.class).list());
    }

    public void feedback(UUID viewer, UUID course, boolean opened, int dwellMs) {
        jdbc.sql("""
                INSERT INTO course_feedback(user_id,course_id,opened,dwell_ms) VALUES (:viewer,:course,:opened,:dwell)
                ON CONFLICT(user_id,course_id) DO UPDATE SET
                  opened=course_feedback.opened OR excluded.opened,
                  dwell_ms=greatest(course_feedback.dwell_ms,excluded.dwell_ms),updated_at=now()
                """).param("viewer", viewer).param("course", course).param("opened", opened).param("dwell", dwellMs).update();
    }

    public void discover(String model) {
        jdbc.sql("INSERT INTO course_embedding(course_id,model,content_hash) SELECT id,:model,md5(text) FROM ("
                + CONTENT + """
                ) content ON CONFLICT(course_id) DO UPDATE SET model=excluded.model,
                  content_hash=excluded.content_hash,embedding=NULL,attempts=0,next_attempt_at=now(),updated_at=now()
                WHERE course_embedding.model IS DISTINCT FROM excluded.model
                   OR course_embedding.content_hash IS DISTINCT FROM excluded.content_hash
                """).param("model", model).update();
    }

    // A short, atomic lease survives process restarts and permits multiple workers.
    // Provider calls happen after this statement has committed.
    public Optional<EmbeddingJob> claim(String model) {
        return jdbc.sql("WITH content AS (" + CONTENT + """
                ), picked AS (
                  SELECT emb.course_id FROM course_embedding emb JOIN content c ON c.id=emb.course_id
                  WHERE emb.model=:model AND emb.content_hash=md5(c.text) AND emb.embedding IS NULL
                    AND emb.attempts<5 AND emb.next_attempt_at<=now()
                  ORDER BY emb.next_attempt_at,emb.course_id LIMIT 1 FOR UPDATE OF emb SKIP LOCKED
                ), claimed AS (
                  UPDATE course_embedding emb SET attempts=attempts+1,
                    next_attempt_at=now()+interval '2 minutes',updated_at=now()
                  FROM picked WHERE emb.course_id=picked.course_id RETURNING emb.*
                ) SELECT claimed.course_id,c.text,claimed.content_hash,claimed.attempts
                  FROM claimed JOIN content c ON c.id=claimed.course_id
                """).param("model", model).query((rs, row) -> new EmbeddingJob(
                    rs.getObject("course_id", UUID.class),rs.getString("text"),rs.getString("content_hash"),
                    rs.getInt("attempts"))).optional();
    }

    public void complete(EmbeddingJob job, String model, float[] vector) {
        var values = new StringJoiner(",", "{", "}");
        for (float value : vector) values.add(Float.toString(value));
        jdbc.sql("""
                UPDATE course_embedding SET embedding=CAST(:vector AS real[]),updated_at=now()
                WHERE course_id=:id AND model=:model AND content_hash=:hash AND attempts=:attempts
                """).param("id", job.id()).param("model", model).param("hash", job.hash())
                .param("attempts", job.attempts()).param("vector", values.toString()).update();
    }
}
