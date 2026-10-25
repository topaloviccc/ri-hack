package ri.hack.outthere.learning.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Public learning contracts never expose grading_json or unsubmitted answer keys. */
public record LearningResponse(UUID courseId, UUID versionId, UUID enrollmentId, String title, Integer estimatedMinutes,
        boolean started, boolean completed, Instant completedAt, BigDecimal percentage,
        int correctCount, int questionCount, long rewardCoins, long awardedCoins,
        List<Lesson> lessons, QuizSummary finalQuiz) {
    public record Lesson(UUID id, String title, int position, String text, boolean demo,
                         boolean unlocked, boolean completed, QuizSummary quiz, Integer estimatedMinutes) { }
    public record QuizSummary(UUID id, String title, int questionCount, int attempts,
                              Integer bestCorrectCount, boolean unlocked) { }
    public record Quiz(UUID id, String title, boolean finalQuiz, List<Question> questions) { }
    public record Question(UUID id, String type, String prompt, List<Option> options) { }
    public record Option(UUID id, String text) { }
    public record Answer(UUID questionId, List<UUID> optionIds) { }
    public record Submission(List<Answer> answers) { }
    public record Feedback(UUID questionId, boolean correct, List<UUID> selectedOptionIds,
                           List<UUID> correctOptionIds, String explanation) { }
    public record Result(UUID attemptId, UUID quizId, int attemptNumber, int correctCount,
                         int questionCount, BigDecimal percentage, List<Feedback> feedback,
                         LearningResponse learning) { }
}
