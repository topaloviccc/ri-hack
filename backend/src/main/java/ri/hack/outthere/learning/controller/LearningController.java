package ri.hack.outthere.learning.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.learning.dto.LearningResponse;
import ri.hack.outthere.learning.service.LearningService;
import ri.hack.outthere.learning.service.QuizService;

@RestController
@RequestMapping("/api/courses/{course}/learning")
public class LearningController {
    private final LearningService learning;
    private final QuizService quizzes;
    public LearningController(LearningService learning, QuizService quizzes) { this.learning = learning; this.quizzes = quizzes; }

    @GetMapping
    public LearningResponse get(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID course) {
        return learning.get(viewer, course);
    }
    @PostMapping("/start")
    public LearningResponse start(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID course) {
        return learning.start(viewer, course);
    }
    @PostMapping("/lessons/{lesson}/complete")
    public LearningResponse complete(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID course, @PathVariable UUID lesson) {
        return learning.completeLesson(viewer, course, lesson);
    }
    @GetMapping("/quizzes/{quiz}")
    public LearningResponse.Quiz quiz(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID course, @PathVariable UUID quiz) {
        return quizzes.get(viewer, course, quiz);
    }
    @PostMapping("/quizzes/{quiz}/attempts")
    public LearningResponse.Result submit(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID course,
            @PathVariable UUID quiz, @RequestHeader("Idempotency-Key") String key, @RequestBody LearningResponse.Submission body) {
        return quizzes.submit(viewer, course, quiz, key, body);
    }
}
