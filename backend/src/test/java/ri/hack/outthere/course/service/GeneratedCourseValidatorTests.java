package ri.hack.outthere.course.service;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.course.dto.GeneratedCourse;
import static org.assertj.core.api.Assertions.*;

class GeneratedCourseValidatorTests {
    final GeneratedCourseValidator validator = new GeneratedCourseValidator();

    void validate(GeneratedCourse course) { validator.validate(course, Set.of("ME"), Set.of("History")); }

    @Test void acceptsCompleteCourseAndCountryRefusal() {
        validate(GeneratedCourseFixtures.course());
        validate(GeneratedCourseFixtures.refusal());
    }

    @Test void rejectsMissingFinalQuizUnknownCountryAndUnassessedPlaces() {
        var c = GeneratedCourseFixtures.course();
        assertThatThrownBy(() -> validate(new GeneratedCourse(null, c.title(), c.description(), c.countryCode(), c.countryReason(),
                c.subject(), c.difficulty(), c.estimatedMinutes(), c.objectives(), c.places(), c.lessons(), null)))
                .hasMessageContaining("final quiz");
        assertThatThrownBy(() -> validator.validate(c, Set.of("HR"), Set.of("History"))).hasMessageContaining("country");
        assertThatThrownBy(() -> validate(new GeneratedCourse(null, c.title(), c.description(), c.countryCode(), c.countryReason(),
                c.subject(), c.difficulty(), c.estimatedMinutes(), c.objectives(), List.of("Cetinje"), c.lessons(), c.finalQuiz())))
                .hasMessageContaining("taught");
    }

    @Test void rejectsInvalidAnswerKeysAndNullMetadata() {
        var c = GeneratedCourseFixtures.course();
        var badQuiz = new GeneratedCourse.Quiz("Invalid", java.util.Collections.nCopies(5,
                new GeneratedCourse.Question("SINGLE_CHOICE", "Question", "Explanation", List.of(
                        new GeneratedCourse.Option("A", true), new GeneratedCourse.Option("B", true)))));
        assertThatThrownBy(() -> validate(new GeneratedCourse(null, c.title(), c.description(), c.countryCode(), c.countryReason(),
                c.subject(), c.difficulty(), c.estimatedMinutes(), c.objectives(), c.places(), c.lessons(), badQuiz)))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> validate(new GeneratedCourse(null, c.title(), c.description(), c.countryCode(), c.countryReason(),
                c.subject(), null, c.estimatedMinutes(), c.objectives(), c.places(), c.lessons(), c.finalQuiz())))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test void providerSchemaRequiresEveryFieldAndPermitsRefusalNulls() {
        var schema = new JsonMapper().readTree(CourseGenerationModel.outputSchema());
        assertObjectsStrict(schema);
        for (var property : schema.path("properties")) {
            assertThat(property.path("anyOf").get(1).path("type").asText()).isEqualTo("null");
        }
    }

    @Test void providerSchemaDisallowsFourQuestionFinalQuizAndKeepsLessonQuizBoundsSeparate() {
        var root = new JsonMapper().readTree(CourseGenerationModel.outputSchema());
        var finalQuizRef = root.path("properties").path("finalQuiz").path("anyOf").get(0).path("$ref").asText();
        var finalQuestions = root.at(finalQuizRef.substring(1)).path("properties").path("questions");
        assertThat(finalQuestions.path("minItems").asInt()).isEqualTo(5);
        assertThat(finalQuestions.path("maxItems").asInt()).isEqualTo(8);
        assertThat(4).isLessThan(finalQuestions.path("minItems").asInt());
        var lessonQuizRef = root.path("properties").path("lessons").path("anyOf").get(0)
                .path("items").path("properties").path("quiz").path("$ref").asText();
        var lessonQuestions = root.at(lessonQuizRef.substring(1)).path("properties").path("questions");
        assertThat(lessonQuestions.path("minItems").asInt()).isEqualTo(2);
        assertThat(lessonQuestions.path("maxItems").asInt()).isEqualTo(4);
        assertThat(lessonQuestions.path("items").path("properties").path("options").path("minItems").asInt()).isEqualTo(2);
        assertThat(root.path("properties").path("estimatedMinutes").path("anyOf").get(0).path("minimum").asInt()).isEqualTo(20);
    }

    @Test void reportsExactQuizPathAndKeepsCompatibleMarkdownAndPlaceSpellings() {
        var c = GeneratedCourseFixtures.course();
        var lessons = new java.util.ArrayList<>(c.lessons());
        var first = lessons.getFirst();
        lessons.set(0, new GeneratedCourse.Lesson(first.title(), "Introduction.\n\n" + first.markdown().replace("## ", "# "),
                first.estimatedMinutes(), first.quiz()));
        validate(new GeneratedCourse(null, c.title(), c.description(), c.countryCode(), c.countryReason(), c.subject(), c.difficulty(),
                c.estimatedMinutes(), c.objectives(), List.of("Kótor, Montenegro"), lessons, c.finalQuiz()));
        lessons.set(0, new GeneratedCourse.Lesson(first.title(), first.markdown(), first.estimatedMinutes(),
                new GeneratedCourse.Quiz("Missing questions", List.of())));
        assertThatThrownBy(() -> validate(new GeneratedCourse(null, c.title(), c.description(), c.countryCode(), c.countryReason(),
                c.subject(), c.difficulty(), c.estimatedMinutes(), c.objectives(), c.places(), lessons, c.finalQuiz())))
                .isInstanceOf(GenerationValidationException.class).hasMessageContaining("lessons[0].quiz.questions", "2–4");
    }

    @Test void placeCorrectionPreservesPreviouslyValidTimingWithoutMaskingOtherErrors() {
        var original = GeneratedCourseFixtures.course();
        var lessons = original.lessons().stream().map(lesson -> new GeneratedCourse.Lesson(lesson.title(), lesson.markdown(), 10, lesson.quiz())).toList();
        var correction = new GeneratedCourse(null, original.title(), original.description(), original.countryCode(), original.countryReason(),
                original.subject(), original.difficulty(), 30, original.objectives(), original.places(), lessons, original.finalQuiz());
        assertThatThrownBy(() -> validate(correction)).hasMessageContaining("Leave time");
        var preserved = CourseGenerationModel.preserveValidTiming(original, correction, "places[0]: No map match");
        validate(preserved);
        assertThat(preserved.estimatedMinutes()).isEqualTo(25);
        assertThat(preserved.lessons()).allSatisfy(lesson -> assertThat(lesson.estimatedMinutes()).isEqualTo(5));
        assertThat(CourseGenerationModel.preserveValidTiming(original, correction, "estimatedMinutes: Leave time for quizzes"))
                .isSameAs(correction);
        validate(CourseGenerationModel.preserveValidTiming(original, correction, "finalQuiz.questions: Expected 5–8 items"));
    }

    private void assertObjectsStrict(JsonNode node) {
        if (node.path("type").isTextual() && "object".equals(node.path("type").asText())) {
            assertThat(node.path("additionalProperties").asBoolean(true)).isFalse();
            assertThat(node.path("required").size()).isEqualTo(node.path("properties").size());
        }
        if (node.isObject() || node.isArray()) for (JsonNode child : node) assertObjectsStrict(child);
    }
}
