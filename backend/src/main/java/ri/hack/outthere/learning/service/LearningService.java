package ri.hack.outthere.learning.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.learning.dto.LearningResponse;
import ri.hack.outthere.learning.model.LearningRows.*;
import ri.hack.outthere.learning.repository.LearningRepository;
import ri.hack.outthere.learning.repository.LearningWriteRepository;
import ri.hack.outthere.user.service.UserService;
import ri.hack.outthere.wallet.repository.WalletRepository;

@Service
@Transactional(readOnly = true)
public class LearningService {
    private final LearningRepository repository;
    private final LearningWriteRepository writes;
    private final UserService users;
    private final WalletRepository wallets;

    public LearningService(LearningRepository repository, LearningWriteRepository writes,
                           UserService users, WalletRepository wallets) {
        this.repository = repository; this.writes = writes; this.users = users; this.wallets = wallets;
    }

    public record Context(UUID viewer, UUID walletId, Ownership owner, Enrollment enrollment) { }

    public Context context(UUID viewer, UUID course, boolean writing) {
        users.requireUser(viewer);
        // Use the same first lock as purchases: submissions, starts and rewards serialize per wallet.
        UUID wallet = writing ? wallets.wallet(viewer, true).orElseThrow(() -> ApiException.notFound("Wallet")).id() : null;
        var owner = repository.ownership(viewer, course).orElseThrow(() -> ApiException.conflict("Unlock this course before learning"));
        if (owner.versionId() == null) throw ApiException.conflict("No published course content is available");
        return new Context(viewer, wallet, owner, repository.enrollment(owner).orElse(null));
    }

    public Enrollment requireStarted(Context context) {
        if (context.enrollment() == null || context.enrollment().firstOpenedAt() == null)
            throw ApiException.conflict("Start this course first");
        return context.enrollment();
    }

    public LearningResponse get(UUID viewer, UUID course) { return describe(context(viewer, course, false)); }

    @Transactional
    public LearningResponse start(UUID viewer, UUID course) {
        var context = context(viewer, course, true);
        describe(context); // Avoid creating enrollments for courses whose content has not been supplied yet.
        writes.start(viewer, context.owner());
        return describe(context(viewer, course, false));
    }

    @Transactional
    public LearningResponse completeLesson(UUID viewer, UUID course, UUID lessonId) {
        var context = context(viewer, course, true);
        var enrollment = requireStarted(context);
        var lesson = describe(context).lessons().stream().filter(row -> row.id().equals(lessonId)).findFirst()
                .orElseThrow(() -> ApiException.notFound("Lesson"));
        if (!lesson.unlocked()) throw ApiException.conflict("Submit the preceding quiz before this lesson");
        writes.completeLesson(enrollment, lessonId);
        return describe(context);
    }

    public LearningResponse describe(Context context) {
        var enrollment = context.enrollment();
        UUID enrollmentId = enrollment == null ? null : enrollment.id();
        var lessons = repository.lessons(context.owner().versionId(), enrollmentId);
        var quizzes = repository.quizzes(context.owner().versionId(), enrollmentId);
        var finalQuiz = quizzes.stream().filter(q -> q.lessonId() == null).findFirst().orElse(null);
        if (lessons.isEmpty() || finalQuiz == null || quizzes.size() != lessons.size() + 1
                || quizzes.stream().anyMatch(q -> q.questionCount() == 0))
            throw ApiException.conflict("Course lessons and quizzes are not available yet");
        boolean completed = enrollment != null && enrollment.completedAt() != null;
        boolean started = enrollment != null && enrollment.firstOpenedAt() != null;
        boolean previousSubmitted = true;
        var rows = new ArrayList<LearningResponse.Lesson>();
        for (var lesson : lessons) {
            var quiz = quizzes.stream().filter(q -> lesson.id().equals(q.lessonId())).findFirst()
                    .orElseThrow(() -> ApiException.conflict("A lesson quiz is missing"));
            boolean unlocked = completed || (started && previousSubmitted);
            rows.add(new LearningResponse.Lesson(lesson.id(), lesson.title(), lesson.position(),
                    unlocked ? lesson.text() : null, lesson.demo(), unlocked, lesson.completed(),
                    summary(quiz, completed || (unlocked && lesson.completed())), lesson.estimatedMinutes()));
            previousSubmitted = previousSubmitted && lesson.completed() && quiz.attempts() > 0;
        }
        int correct = quizzes.stream().mapToInt(q -> q.bestCorrectCount() == null ? 0 : q.bestCorrectCount()).sum();
        int total = quizzes.stream().mapToInt(Quiz::questionCount).sum();
        var version = repository.version(context.owner().versionId());
        return new LearningResponse(context.owner().courseId(), context.owner().versionId(), enrollmentId,
                version.title(), version.estimatedMinutes(), started, completed,
                enrollment == null ? null : enrollment.completedAt(), percentage(correct, total), correct, total,
                context.owner().rewardCoins(), repository.awarded(context.viewer(), context.owner().courseId()),
                rows, summary(finalQuiz, completed || (started && previousSubmitted)));
    }

    public static BigDecimal percentage(int correct, int total) {
        return total == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(correct).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 8, RoundingMode.HALF_UP);
    }

    private LearningResponse.QuizSummary summary(Quiz quiz, boolean unlocked) {
        return new LearningResponse.QuizSummary(quiz.id(), quiz.title(), quiz.questionCount(), quiz.attempts(),
                quiz.bestCorrectCount(), unlocked);
    }
}
