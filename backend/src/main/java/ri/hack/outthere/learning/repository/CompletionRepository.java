package ri.hack.outthere.learning.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.learning.model.LearningRows.*;

@Repository
public class CompletionRepository {
    private final JdbcClient jdbc;
    public CompletionRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    /** Called under the learner's wallet lock, in the same transaction as answer submission. */
    public void complete(UUID viewer, UUID wallet, Ownership owner, Enrollment enrollment,
                         List<Quiz> quizzes, int correct, int total, BigDecimal percentage) {
        UUID completion = jdbc.sql("""
                INSERT INTO course_completion(enrollment_id,quiz_count,aggregate_percentage,score_sum_numerator,score_sum_denominator)
                VALUES (:enrollment,:quizzes,:percentage,:correct,:total) RETURNING id
                """).param("enrollment", enrollment.id()).param("quizzes", quizzes.size()).param("percentage", percentage)
                .param("correct", correct).param("total", total).query(UUID.class).single();
        for (var quiz : quizzes) {
            jdbc.sql("INSERT INTO course_completion_quiz_result(completion_id,quiz_id,attempt_id) VALUES (:completion,:quiz,:attempt)")
                    .param("completion", completion).param("quiz", quiz.id()).param("attempt", quiz.bestAttemptId()).update();
        }
        jdbc.sql("""
                UPDATE enrollment SET completed_at=(SELECT completed_at FROM course_completion WHERE id=:completion),
                  status_id=(SELECT id FROM enrollment_status WHERE label='COMPLETED') WHERE id=:enrollment
                """).param("completion", completion).param("enrollment", enrollment.id()).update();
        // A later version can be completed again, but the course reward is lifetime-once.
        boolean rewarded = jdbc.sql("SELECT EXISTS(SELECT 1 FROM course_completion_reward WHERE user_id=:viewer AND course_id=:course)")
                .param("viewer", viewer).param("course", owner.courseId()).query(Boolean.class).single();
        if (rewarded) return;
        UUID transaction = null;
        if (owner.rewardCoins() > 0) {
            transaction = jdbc.sql("""
                    INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,metadata_json)
                    VALUES (:wallet,(SELECT id FROM wallet_transaction_type WHERE label='COURSE_COMPLETION'),:amount,:key,
                      jsonb_build_object('course_id',CAST(:course AS text),'completion_id',CAST(:completion AS text))) RETURNING id
                    """).param("wallet", wallet).param("amount", owner.rewardCoins())
                    .param("key", "course-completion:" + owner.courseId()).param("course", owner.courseId())
                    .param("completion", completion).query(UUID.class).single();
            jdbc.sql("UPDATE wallet SET balance=balance+:amount WHERE id=:wallet")
                    .param("amount", owner.rewardCoins()).param("wallet", wallet).update();
        }
        jdbc.sql("INSERT INTO course_completion_reward(user_id,course_id,completion_id,transaction_id,amount) VALUES (:viewer,:course,:completion,:transaction,:amount)")
                .param("viewer", viewer).param("course", owner.courseId()).param("completion", completion)
                .param("transaction", transaction).param("amount", owner.rewardCoins()).update();
    }
}
