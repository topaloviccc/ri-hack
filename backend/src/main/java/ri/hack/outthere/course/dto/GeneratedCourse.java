package ri.hack.outthere.course.dto;

import java.util.List;

/** Model contract; no database IDs, coordinates, prices or rewards are model-controlled. */
public record GeneratedCourse(String refusalReason, String title, String description, String countryCode,
        String countryReason, String subject, String difficulty, Integer estimatedMinutes,
        List<String> objectives, List<String> places, List<Lesson> lessons, Quiz finalQuiz) {
    public record Lesson(String title, String markdown, Integer estimatedMinutes, Quiz quiz) { }
    public record Quiz(String title, List<Question> questions) { }
    public record Question(String type, String prompt, String explanation, List<Option> options) { }
    public record Option(String text, Boolean correct) { }
}
