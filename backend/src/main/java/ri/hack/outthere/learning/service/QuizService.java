package ri.hack.outthere.learning.service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.learning.dto.LearningResponse;
import ri.hack.outthere.learning.model.LearningRows.*;
import ri.hack.outthere.learning.repository.*;

@Service
@Transactional(readOnly = true)
public class QuizService {
    private final LearningService learning;
    private final LearningRepository repository;
    private final LearningWriteRepository writes;
    private final CompletionRepository completions;
    private final QuizGrader grader;

    public QuizService(LearningService learning, LearningRepository repository, LearningWriteRepository writes,
                       CompletionRepository completions, QuizGrader grader) {
        this.learning = learning; this.repository = repository; this.writes = writes;
        this.completions = completions; this.grader = grader;
    }

    public LearningResponse.Quiz get(UUID viewer, UUID course, UUID quizId) {
        var context = learning.context(viewer, course, false);
        var quiz = requireQuiz(context, quizId);
        var questions = repository.questions(quizId);
        var options = repository.options(quizId);
        questions.forEach(grader::requireSupported);
        return new LearningResponse.Quiz(quiz.id(), quiz.title(), quiz.lessonId() == null,
                questions.stream().map(q -> new LearningResponse.Question(q.id(), q.type(), q.prompt(), options.stream()
                    .filter(o -> o.questionId().equals(q.id())).map(o -> new LearningResponse.Option(o.id(), o.text())).toList())).toList());
    }

    @Transactional
    public LearningResponse.Result submit(UUID viewer, UUID course, UUID quizId, String key,
                                           LearningResponse.Submission submission) {
        if (key == null || key.isBlank()) throw ApiException.badRequest("Provide an Idempotency-Key");
        var context = learning.context(viewer, course, true);
        var enrollment = learning.requireStarted(context);
        requireQuiz(context, quizId);
        var questions = repository.questions(quizId);
        var options = repository.options(quizId);
        var selections = grader.selections(questions, options, submission);
        UUID attemptId = UUID.nameUUIDFromBytes((enrollment.id() + ":" + key).getBytes(StandardCharsets.UTF_8));
        var previous = repository.attempt(enrollment.id(), attemptId);
        if (previous.isPresent()) {
            if (!previous.get().quizId().equals(quizId) || repository.responses(attemptId).stream()
                    .anyMatch(r -> !r.selectedOptionIds().equals(selections.get(r.questionId()))))
                throw ApiException.conflict("Idempotency key already used for different answers or quiz");
        } else {
            writes.createAttempt(attemptId, enrollment, quizId);
            for (var question : questions) {
                var selected = selections.get(question.id());
                writes.answer(attemptId, quizId, question, selected,
                        selected.equals(grader.correctOptions(question.id(), options)));
            }
            writes.submit(attemptId);
            maybeComplete(context);
        }
        var attempt = repository.attempt(enrollment.id(), attemptId).orElseThrow();
        var feedback = questions.stream().map(q -> {
            var correct = grader.correctOptions(q.id(), options);
            var selected = selections.get(q.id());
            return new LearningResponse.Feedback(q.id(), selected.equals(correct), selected, correct, q.explanation());
        }).toList();
        return new LearningResponse.Result(attemptId, quizId, attempt.attemptNumber(), attempt.correctCount(),
                attempt.questionCount(), LearningService.percentage(attempt.correctCount(), attempt.questionCount()),
                feedback, learning.get(viewer, course));
    }

    private Quiz requireQuiz(LearningService.Context context, UUID quizId) {
        learning.requireStarted(context);
        var outline = learning.describe(context);
        var summaries = new java.util.ArrayList<>(outline.lessons().stream().map(LearningResponse.Lesson::quiz).toList());
        summaries.add(outline.finalQuiz());
        var summary = summaries.stream().filter(q -> q.id().equals(quizId)).findFirst()
                .orElseThrow(() -> ApiException.notFound("Quiz"));
        if (!summary.unlocked()) throw ApiException.conflict("Complete the preceding lesson and quiz first");
        return repository.quizzes(context.owner().versionId(), context.enrollment().id()).stream()
                .filter(q -> q.id().equals(quizId)).findFirst().orElseThrow();
    }

    private void maybeComplete(LearningService.Context context) {
        if (context.enrollment().completedAt() != null) return;
        var quizzes = repository.quizzes(context.owner().versionId(), context.enrollment().id());
        if (quizzes.stream().anyMatch(q -> q.attempts() == 0)) return;
        if (repository.lessons(context.owner().versionId(), context.enrollment().id()).stream().anyMatch(l -> !l.completed())) return;
        int correct = quizzes.stream().mapToInt(Quiz::bestCorrectCount).sum();
        int total = quizzes.stream().mapToInt(Quiz::questionCount).sum();
        // Compare integers before rounding: 79.999... must never count as 80%.
        if (total > 0 && (long) correct * 5 >= (long) total * 4)
            completions.complete(context.viewer(), context.walletId(), context.owner(), context.enrollment(), quizzes,
                    correct, total, LearningService.percentage(correct, total));
    }
}
