package ri.hack.outthere.learning.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.learning.model.LearningRows.*;

@Repository
public class LearningWriteRepository {
    private final JdbcClient jdbc;
    public LearningWriteRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public void start(UUID viewer, Ownership owner) {
        jdbc.sql("""
                INSERT INTO enrollment(entitlement_id,user_id,course_id,course_version_id,first_opened_at,status_id)
                VALUES (:owner,:viewer,:course,:version,now(),(SELECT id FROM enrollment_status WHERE label='IN_PROGRESS'))
                ON CONFLICT(entitlement_id,course_version_id) DO UPDATE SET
                  first_opened_at=coalesce(enrollment.first_opened_at,now()),
                  status_id=CASE WHEN enrollment.completed_at IS NULL THEN excluded.status_id ELSE enrollment.status_id END
                """).param("owner", owner.id()).param("viewer", viewer).param("course", owner.courseId())
                .param("version", owner.versionId()).update();
    }

    public void completeLesson(Enrollment enrollment, UUID lesson) {
        jdbc.sql("""
                INSERT INTO lesson_progress(enrollment_id,course_version_id,lesson_id,completed_at)
                VALUES (:enrollment,:version,:lesson,now()) ON CONFLICT(enrollment_id,lesson_id)
                DO UPDATE SET completed_at=coalesce(lesson_progress.completed_at,excluded.completed_at)
                """).param("enrollment", enrollment.id()).param("version", enrollment.courseVersionId())
                .param("lesson", lesson).update();
    }

    public int createAttempt(UUID id, Enrollment enrollment, UUID quiz) {
        return jdbc.sql("""
                INSERT INTO quiz_attempt(id,enrollment_id,course_version_id,quiz_id,attempt_number)
                SELECT :id,:enrollment,:version,:quiz,coalesce(max(attempt_number),0)+1
                FROM quiz_attempt WHERE enrollment_id=:enrollment AND quiz_id=:quiz RETURNING attempt_number
                """).param("id", id).param("enrollment", enrollment.id()).param("version", enrollment.courseVersionId())
                .param("quiz", quiz).query(Integer.class).single();
    }

    public void answer(UUID attempt, UUID quiz, Question question, List<UUID> options, boolean correct) {
        // Only UUIDs are interpolated into this JSON; all SQL values stay bound parameters.
        String json = "{\"optionIds\":[" + options.stream().map(id -> "\"" + id + "\"")
                .collect(java.util.stream.Collectors.joining(",")) + "]}";
        jdbc.sql("""
                INSERT INTO question_response(attempt_id,question_id,quiz_id,response_json,is_correct,possible_points,earned_points)
                VALUES (:attempt,:question,:quiz,CAST(:response AS jsonb),:correct,:points,:earned)
                """).param("attempt", attempt).param("question", question.id()).param("quiz", quiz).param("response", json)
                .param("correct", correct).param("points", question.points())
                .param("earned", correct ? question.points() : BigDecimal.ZERO).update();
    }

    public void submit(UUID attempt) {
        jdbc.sql("""
                UPDATE quiz_attempt SET submitted_at=now(),
                  earned_points=(SELECT sum(earned_points) FROM question_response WHERE attempt_id=:id),
                  possible_points=(SELECT sum(possible_points) FROM question_response WHERE attempt_id=:id)
                WHERE id=:id
                """).param("id", attempt).update();
    }
}
