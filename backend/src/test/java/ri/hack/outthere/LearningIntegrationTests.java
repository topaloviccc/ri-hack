package ri.hack.outthere;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import ri.hack.outthere.learning.dto.LearningResponse;
import ri.hack.outthere.learning.service.LearningService;
import ri.hack.outthere.learning.service.QuizService;
import ri.hack.outthere.wallet.service.WalletService;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Sql({"/db/worldlearn-test-data.sql", "/db/learning-test-data.sql"})
class LearningIntegrationTests extends PostgresTestSupport {
    static final UUID ME=UUID.fromString("00000000-0000-0000-0000-000000000001");
    static final UUID COURSE=UUID.fromString("10000000-0000-0000-0000-000000000001");
    static final UUID FIRST=UUID.fromString("51000000-0000-0000-0000-000000000001");
    static final UUID SECOND=UUID.fromString("51000000-0000-0000-0000-000000000002");
    static final UUID Q1=UUID.fromString("60000000-0000-0000-0000-000000000001");
    static final UUID Q2=UUID.fromString("60000000-0000-0000-0000-000000000002");
    static final UUID FINAL=UUID.fromString("60000000-0000-0000-0000-000000000003");
    static final String BASE="/api/courses/"+COURSE+"/learning";
    @Autowired LearningService learning;
    @Autowired QuizService quizzes;
    @Autowired WalletService wallets;
    @Autowired JdbcClient jdbc;
    @Autowired MockMvc mvc;

    void start() {
        wallets.unlock(ME,COURSE,"purchase");
        learning.start(ME,COURSE);
    }
    LearningResponse.Submission answers(UUID quiz, boolean correct) {
        var questions=jdbc.sql("SELECT id FROM question WHERE quiz_id=:quiz ORDER BY position").param("quiz",quiz).query(UUID.class).list();
        return new LearningResponse.Submission(questions.stream().map(id -> new LearningResponse.Answer(id,
                jdbc.sql("SELECT id FROM answer_option WHERE question_id=:id AND is_correct=:correct ORDER BY id")
                  .param("id",id).param("correct",correct).query(UUID.class).list().stream()
                  .limit(correct ? Long.MAX_VALUE : 1).toList())).toList());
    }
    void throughLessonQuizzes(boolean firstCorrect, boolean secondCorrect) {
        learning.completeLesson(ME,COURSE,FIRST);
        quizzes.submit(ME,COURSE,Q1,"first",answers(Q1,firstCorrect));
        learning.completeLesson(ME,COURSE,SECOND);
        quizzes.submit(ME,COURSE,Q2,"second",answers(Q2,secondCorrect));
    }
    long count(String table) { return jdbc.sql("SELECT count(*) FROM "+table).query(Long.class).single(); }

    @Test void requiresOwnershipStartAndOrderedContentAndDoesNotExposeAnswerKeys() throws Exception {
        mvc.perform(get(BASE).header("X-User-Id",ME)).andExpect(status().isConflict());
        wallets.unlock(ME,COURSE,"purchase");
        mvc.perform(get(BASE).header("X-User-Id",ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.started").value(false)).andExpect(jsonPath("$.lessons[0].text").doesNotExist());
        mvc.perform(get(BASE+"/quizzes/"+Q1).header("X-User-Id",ME)).andExpect(status().isConflict());
        var started=learning.start(ME,COURSE);
        assertThat(learning.start(ME,COURSE).enrollmentId()).isEqualTo(started.enrollmentId());
        assertThat(started.lessons().getFirst().text()).isEqualTo("First lesson text");
        assertThatThrownBy(() -> learning.completeLesson(ME,COURSE,SECOND)).hasMessageContaining("preceding quiz");
        learning.completeLesson(ME,COURSE,FIRST);
        mvc.perform(get(BASE+"/quizzes/"+Q1).header("X-User-Id",ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].options[0].correct").doesNotExist())
                .andExpect(jsonPath("$.questions[0].explanation").doesNotExist())
                .andExpect(jsonPath("$.questions[0].gradingJson").doesNotExist());
        mvc.perform(post(BASE+"/quizzes/"+Q1+"/attempts").header("X-User-Id",ME).header("Idempotency-Key","bad")
                        .contentType("application/json").content("{\"answers\":[]}"))
                .andExpect(status().isBadRequest());
        assertThat(count("quiz_attempt")).isZero();
        quizzes.submit(ME,COURSE,Q1,"first",answers(Q1,false));
        assertThat(learning.get(ME,COURSE).lessons().get(1).unlocked()).isTrue();
        assertThatThrownBy(() -> quizzes.get(ME,COURSE,FINAL)).hasMessageContaining("preceding");
    }

    @Test void passesAtEightyPercentOfQuestionsDespiteLowEqualQuizAverageAndPaysPromisedRewardOnce() {
        start();
        // Reward is frozen on acquisition, even if the course changes its advertised reward.
        jdbc.sql("UPDATE course SET reward_coins=999 WHERE id=:id").param("id",COURSE).update();
        throughLessonQuizzes(true,false);
        assertThat(learning.get(ME,COURSE).completed()).isFalse();
        var result=quizzes.submit(ME,COURSE,FINAL,"final",answers(FINAL,true));
        assertThat(result.learning().completed()).isTrue();
        assertThat(result.learning().percentage()).isEqualByComparingTo("80");
        assertThat(result.learning().correctCount()).isEqualTo(4);
        assertThat(result.learning().awardedCoins()).isEqualTo(10);
        assertThat(wallets.get(ME).balance()).isEqualTo(70);
        assertThat(jdbc.sql("SELECT count(*) FROM course_completion_quiz_result WHERE completion_id IN (SELECT id FROM course_completion WHERE enrollment_id=:id)")
                .param("id",result.learning().enrollmentId()).query(Long.class).single()).isEqualTo(3);
        var completedAt=result.learning().completedAt();
        var worse=quizzes.submit(ME,COURSE,Q1,"worse",answers(Q1,false));
        assertThat(worse.learning().percentage()).isEqualByComparingTo("80");
        assertThat(worse.learning().completedAt()).isEqualTo(completedAt);
        assertThat(wallets.get(ME).balance()).isEqualTo(70);
        assertThat(count("course_completion_reward")).isEqualTo(1);
    }

    @Test void failsBelowEightyThenRetakesImproveBestScoreAndMultipleChoiceRequiresTheExactSet() {
        start(); learning.completeLesson(ME,COURSE,FIRST);
        quizzes.submit(ME,COURSE,Q1,"first",answers(Q1,false));
        learning.completeLesson(ME,COURSE,SECOND);
        var all=answers(Q2,true).answers().getFirst();
        var partial=new LearningResponse.Submission(List.of(new LearningResponse.Answer(all.questionId(),List.of(all.optionIds().getFirst()))));
        var partialResult=quizzes.submit(ME,COURSE,Q2,"partial",partial);
        assertThat(partialResult.correctCount()).isZero();
        var result=quizzes.submit(ME,COURSE,FINAL,"final",answers(FINAL,true));
        assertThat(result.learning().percentage()).isEqualByComparingTo("60");
        assertThat(result.learning().completed()).isFalse();
        assertThat(wallets.get(ME).balance()).isEqualTo(60);
        assertThat(quizzes.submit(ME,COURSE,Q1,"retry",answers(Q1,true)).learning().completed()).isTrue();
        assertThat(wallets.get(ME).balance()).isEqualTo(70);
    }

    @Test void concurrentDuplicateSubmissionsCreateOneAttemptAndOneReward() throws Exception {
        start(); throughLessonQuizzes(true,true);
        var submission=answers(FINAL,true);
        Callable<UUID> submit=() -> quizzes.submit(ME,COURSE,FINAL,"same-key",submission).attemptId();
        try(var executor=Executors.newFixedThreadPool(2)) {
            var results=executor.invokeAll(List.of(submit,submit));
            assertThat(results.get(0).get()).isEqualTo(results.get(1).get());
        }
        assertThat(count("quiz_attempt")).isEqualTo(3);
        assertThat(count("course_completion_reward")).isEqualTo(1);
        assertThat(wallets.get(ME).balance()).isEqualTo(70);
        assertThatThrownBy(() -> quizzes.submit(ME,COURSE,FINAL,"same-key",answers(FINAL,false)))
                .hasMessageContaining("different answers");
    }

    @Test void rewardFailureRollsBackSubmissionCompletionAndWalletTogether() {
        start(); throughLessonQuizzes(true,true);
        jdbc.sql("ALTER TABLE course_completion_reward ADD CONSTRAINT fail_reward CHECK(amount=0)").update();
        try {
            assertThatThrownBy(() -> quizzes.submit(ME,COURSE,FINAL,"rollback",answers(FINAL,true)))
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            assertThat(count("quiz_attempt")).isEqualTo(2);
            assertThat(count("course_completion_reward")).isZero();
            assertThat(learning.get(ME,COURSE).completed()).isFalse();
            assertThat(wallets.get(ME).balance()).isEqualTo(60);
        } finally { jdbc.sql("ALTER TABLE course_completion_reward DROP CONSTRAINT fail_reward").update(); }
    }

    @Test void enrollmentKeepsItsVersionWhenThePublishedVersionChanges() {
        jdbc.sql("UPDATE course_version SET estimated_minutes=35 WHERE course_id=:course").param("course",COURSE).update();
        jdbc.sql("UPDATE lesson SET content_json=content_json || '{\"estimatedMinutes\":6}'::jsonb WHERE id=:lesson")
                .param("lesson",FIRST).update();
        start(); var original=learning.get(ME,COURSE);
        assertThat(original.estimatedMinutes()).isEqualTo(35);
        assertThat(original.lessons().getFirst().estimatedMinutes()).isEqualTo(6);
        UUID next=UUID.randomUUID();
        jdbc.sql("""
                INSERT INTO course_version(id,course_id,version_number,title,created_by,publication_status_id)
                SELECT :id,id,2,'New edition',creator_id,'aa7192b0-4b5d-5230-b311-25aa6b0e59ff'::uuid FROM course WHERE id=:course
                """).param("id",next).param("course",COURSE).update();
        jdbc.sql("UPDATE course SET current_published_version_id=:version WHERE id=:course").param("version",next).param("course",COURSE).update();
        assertThat(learning.start(ME,COURSE).versionId()).isEqualTo(original.versionId());
        assertThat(learning.get(ME,COURSE).estimatedMinutes()).isEqualTo(35);
        assertThat(learning.get(ME,COURSE).lessons()).hasSize(2);
    }

    @Test void servesMarkdownSourceAndRetainsLegacyTextCompatibility() throws Exception {
        start();
        jdbc.sql("UPDATE lesson SET content_json=content_json || jsonb_build_object('markdown',:markdown,'format','markdown') WHERE id=:id")
                .param("markdown","## Landscape\n\n**Observe** the rock.\n\n- [ ] Record a feature")
                .param("id",FIRST).update();
        mvc.perform(get(BASE).header("X-User-Id",ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.lessons[0].text").value("## Landscape\n\n**Observe** the rock.\n\n- [ ] Record a feature"));
        learning.completeLesson(ME,COURSE,FIRST);
        quizzes.submit(ME,COURSE,Q1,"first",answers(Q1,true));
        assertThat(learning.get(ME,COURSE).lessons().get(1).text()).isEqualTo("Second lesson text");
    }
}
