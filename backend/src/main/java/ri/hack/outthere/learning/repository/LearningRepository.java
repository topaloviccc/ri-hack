package ri.hack.outthere.learning.repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.learning.model.LearningRows.*;

@Repository
public class LearningRepository {
    private final JdbcClient jdbc;
    public LearningRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Optional<Ownership> ownership(UUID viewer, UUID course) {
        return jdbc.sql("""
                SELECT ce.id, c.id AS course_id, ce.promised_reward_coins AS reward_coins,
                  coalesce((SELECT e.course_version_id FROM enrollment e
                    WHERE e.entitlement_id=ce.id ORDER BY e.enrolled_at DESC,e.id DESC LIMIT 1),
                    CASE WHEN ps.label='PUBLISHED' THEN v.id END) AS version_id
                FROM course_entitlement ce JOIN course c ON c.id=ce.course_id
                LEFT JOIN course_version v ON v.id=c.current_published_version_id
                LEFT JOIN publication_status ps ON ps.id=v.publication_status_id
                WHERE ce.user_id=:viewer AND c.id=:course
                """).param("viewer", viewer).param("course", course).query(Ownership.class).optional();
    }

    public Optional<Enrollment> enrollment(Ownership owner) {
        return jdbc.sql("""
                SELECT e.id,e.course_version_id,v.title,e.first_opened_at,e.completed_at
                FROM enrollment e JOIN course_version v ON v.id=e.course_version_id
                WHERE e.entitlement_id=:owner AND e.course_version_id=:version
                """).param("owner", owner.id()).param("version", owner.versionId()).query(Enrollment.class).optional();
    }

    public Version version(UUID version) {
        return jdbc.sql("SELECT title,estimated_minutes FROM course_version WHERE id=:id")
                .param("id", version).query(Version.class).single();
    }

    public List<Lesson> lessons(UUID version, UUID enrollment) {
        return jdbc.sql("""
                SELECT l.id,l.position,l.title,coalesce(l.content_json->>'markdown',l.content_json->>'text','') AS text,
                  coalesce(l.content_json->'demo'='true'::jsonb,false) AS demo,
                  (lp.completed_at IS NOT NULL) AS completed,
                  (l.content_json->>'estimatedMinutes')::integer AS estimated_minutes
                FROM lesson l LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.enrollment_id=:enrollment
                WHERE l.course_version_id=:version ORDER BY l.position,l.id
                """).param("version", version).param("enrollment", enrollment).query(Lesson.class).list();
    }

    public List<Quiz> quizzes(UUID version, UUID enrollment) {
        return jdbc.sql("""
                SELECT q.id,q.lesson_id,coalesce(q.title,'Quiz') AS title,
                  (SELECT count(*)::int FROM question WHERE quiz_id=q.id) AS question_count,
                  (SELECT count(*)::int FROM quiz_attempt WHERE quiz_id=q.id AND enrollment_id=:enrollment
                    AND submitted_at IS NOT NULL) AS attempts,
                  best.correct_count AS best_correct_count,best.id AS best_attempt_id
                FROM quiz q LEFT JOIN LATERAL (
                  SELECT a.id,count(*) FILTER (WHERE r.is_correct)::int AS correct_count
                  FROM quiz_attempt a JOIN question_response r ON r.attempt_id=a.id
                  WHERE a.quiz_id=q.id AND a.enrollment_id=:enrollment AND a.submitted_at IS NOT NULL
                  GROUP BY a.id ORDER BY correct_count DESC,a.submitted_at,a.id LIMIT 1
                ) best ON true WHERE q.course_version_id=:version ORDER BY q.id
                """).param("version", version).param("enrollment", enrollment).query(Quiz.class).list();
    }

    public List<Question> questions(UUID quiz) {
        return jdbc.sql("""
                SELECT q.id,t.label AS type,q.prompt,q.explanation,q.points FROM question q
                JOIN question_type t ON t.id=q.question_type_id WHERE q.quiz_id=:quiz ORDER BY q.position,q.id
                """).param("quiz", quiz).query(Question.class).list();
    }

    public List<Option> options(UUID quiz) {
        return jdbc.sql("""
                SELECT a.id,a.question_id,a.answer_text AS text,a.is_correct AS correct
                FROM answer_option a JOIN question q ON q.id=a.question_id
                WHERE q.quiz_id=:quiz ORDER BY q.position,a.position,a.id
                """).param("quiz", quiz).query(Option.class).list();
    }

    public Optional<Attempt> attempt(UUID enrollment, UUID id) {
        return jdbc.sql("""
                SELECT a.id,a.quiz_id,a.attempt_number,count(*) FILTER (WHERE r.is_correct)::int AS correct_count,
                  count(*)::int AS question_count FROM quiz_attempt a JOIN question_response r ON r.attempt_id=a.id
                WHERE a.id=:id AND a.enrollment_id=:enrollment AND a.submitted_at IS NOT NULL GROUP BY a.id
                """).param("id", id).param("enrollment", enrollment).query(Attempt.class).optional();
    }

    public List<Response> responses(UUID attempt) {
        return jdbc.sql("""
                SELECT question_id,is_correct,ARRAY(SELECT jsonb_array_elements_text(response_json->'optionIds')) AS ids
                FROM question_response WHERE attempt_id=:attempt ORDER BY question_id
                """).param("attempt", attempt).query((rs, row) -> new Response(rs.getObject("question_id", UUID.class),
                    Arrays.stream((String[]) rs.getArray("ids").getArray()).map(UUID::fromString).toList(),
                    rs.getBoolean("is_correct"))).list();
    }

    public long awarded(UUID viewer, UUID course) {
        return jdbc.sql("SELECT coalesce((SELECT amount FROM course_completion_reward WHERE user_id=:user AND course_id=:course),0)")
                .param("user", viewer).param("course", course).query(Long.class).single();
    }
}
