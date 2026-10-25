package ri.hack.outthere.course.service;

import java.util.HashSet;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Component;
import ri.hack.outthere.course.dto.GeneratedCourse;
import ri.hack.outthere.course.dto.GeneratedCourse.Quiz;

@Component
public class GeneratedCourseValidator {
    public void validate(GeneratedCourse draft, Set<String> countries, Set<String> subjects) {
        require(draft != null, "course", "Missing course");
        if (draft.refusalReason() != null) {
            text(draft.refusalReason(), 1000, "refusalReason");
            return;
        }
        text(draft.title(), 220, "title"); text(draft.description(), 12000, "description"); text(draft.countryReason(), 2000, "countryReason");
        text(draft.countryCode(), 2, "countryCode"); text(draft.subject(), 100, "subject"); text(draft.difficulty(), 20, "difficulty");
        require(countries.contains(draft.countryCode()), "countryCode", "Unknown country");
        require(subjects.contains(draft.subject()), "subject", "Unknown subject; use an exact supplied subject label");
        require(Set.of("BEGINNER", "INTERMEDIATE", "ADVANCED").contains(draft.difficulty()), "difficulty", "Invalid difficulty");
        require(draft.estimatedMinutes() != null && draft.estimatedMinutes() >= 20 && draft.estimatedMinutes() <= 40,
                "estimatedMinutes", "Course duration must be 20–40 minutes");
        size(draft.objectives(), 2, 6, "objectives"); draft.objectives().forEach(value -> text(value, 1000, "objectives"));
        size(draft.places(), 1, 5, "places"); draft.places().forEach(value -> text(value, 200, "places"));
        require(draft.places().stream().map(GeneratedCourseValidator::key).distinct().count() == draft.places().size(),
                "places", "Duplicate places");
        size(draft.lessons(), 3, 5, "lessons");
        int readingMinutes = 0;
        StringBuilder reading = new StringBuilder();
        StringBuilder questions = new StringBuilder();
        int lessonIndex = 0;
        for (var lesson : draft.lessons()) {
            String path = "lessons[" + lessonIndex++ + "]";
            require(lesson != null, path, "Missing lesson");
            text(lesson.title(), 220, path + ".title"); text(lesson.markdown(), 30000, path + ".markdown");
            require(java.util.regex.Pattern.compile("(?m)^#{1,6} +\\S").matcher(lesson.markdown()).find() && lesson.markdown().length() >= 300,
                    path + ".markdown",
                    "Lesson needs Markdown reading content");
            require(lesson.estimatedMinutes() != null && lesson.estimatedMinutes() >= 1 && lesson.estimatedMinutes() <= 12,
                    path + ".estimatedMinutes", "Lesson duration must be 1–12 minutes");
            readingMinutes += lesson.estimatedMinutes();
            reading.append(' ').append(lesson.markdown());
            quiz(lesson.quiz(), 2, 4, questions, path + ".quiz");
        }
        require(readingMinutes < draft.estimatedMinutes(), "estimatedMinutes", "Leave time for quizzes: lesson minutes must sum to less than the course total");
        quiz(draft.finalQuiz(), 5, 8, questions, "finalQuiz");
        boolean assessesPlace = false;
        int placeIndex = 0;
        for (String place : draft.places()) {
            String path = "places[" + placeIndex++ + "]";
            String name = placeKey(place.split(",", 2)[0]);
            require(!name.isBlank(), path, "Missing place name");
            require(placeKey(reading.toString()).contains(name), path, "Named places must be taught using their name before the first comma");
            assessesPlace |= placeKey(questions.toString()).contains(name);
        }
        require(assessesPlace, "quizzes", "Quiz must assess a named place");
    }

    private void quiz(Quiz quiz, int min, int max, StringBuilder prompts, String path) {
        require(quiz != null, path, "Missing paired or final quiz");
        text(quiz.title(), 220, path + ".title"); size(quiz.questions(), min, max, path + ".questions");
        int questionIndex = 0;
        for (var question : quiz.questions()) {
            String questionPath = path + ".questions[" + questionIndex++ + "]";
            require(question != null, questionPath, "Missing question");
            text(question.prompt(), 4000, questionPath + ".prompt"); text(question.explanation(), 6000, questionPath + ".explanation");
            text(question.type(), 30, questionPath + ".type");
            require(Set.of("SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE").contains(question.type()), questionPath + ".type", "Unsupported question type");
            size(question.options(), 2, 5, questionPath + ".options");
            Set<String> options = new HashSet<>();
            int correct = 0;
            prompts.append(' ').append(question.prompt());
            for (var option : question.options()) {
                require(option != null && option.correct() != null, questionPath + ".options", "Missing answer key");
                text(option.text(), 2000, questionPath + ".options.text");
                require(options.add(key(option.text())), questionPath + ".options", "Duplicate options");
                if (option.correct()) correct++;
                prompts.append(' ').append(option.text());
            }
            require(correct > 0 && correct < options.size(), questionPath + ".options", "Need correct and incorrect options");
            if (!"MULTIPLE_CHOICE".equals(question.type())) require(correct == 1, questionPath + ".options", "Need one correct option");
            if ("TRUE_FALSE".equals(question.type())) require(options.equals(Set.of("true", "false")), questionPath + ".options", "Invalid true/false options");
        }
    }

    private static String key(String value) {
        return value.strip().toLowerCase(Locale.ROOT);
    }
    private static String placeKey(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFKD).replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]+", " ").strip();
    }
    private static void text(String value, int max, String path) {
        require(value != null && !value.isBlank() && value.length() <= max, path, "Required text must contain 1–" + max + " characters");
    }
    private static void size(List<?> value, int min, int max, String path) {
        require(value != null && value.size() >= min && value.size() <= max, path, "Expected " + min + "–" + max + " items");
    }
    private static void require(boolean valid, String path, String message) {
        if (!valid) throw new GenerationValidationException(path, message);
    }
}
