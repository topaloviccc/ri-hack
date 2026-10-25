package ri.hack.outthere.learning.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class LearningRows {
    private LearningRows() { }
    public record Ownership(UUID id, UUID courseId, UUID versionId, long rewardCoins) { }
    public record Enrollment(UUID id, UUID courseVersionId, String title, Instant firstOpenedAt, Instant completedAt) { }
    public record Lesson(UUID id, int position, String title, String text, boolean demo, boolean completed,
                         Integer estimatedMinutes) { }
    public record Version(String title, Integer estimatedMinutes) { }
    public record Quiz(UUID id, UUID lessonId, String title, int questionCount, int attempts,
                       Integer bestCorrectCount, UUID bestAttemptId) { }
    public record Question(UUID id, String type, String prompt, String explanation, BigDecimal points) { }
    public record Option(UUID id, UUID questionId, String text, boolean correct) { }
    public record Attempt(UUID id, UUID quizId, int attemptNumber, int correctCount, int questionCount) { }
    public record Response(UUID questionId, List<UUID> selectedOptionIds, boolean correct) { }
}
