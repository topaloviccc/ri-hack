package ri.hack.outthere.course.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;
import ri.hack.outthere.course.dto.GeneratedCourse;

@Service
public class CourseGenerationModel {
    private final OpenAiChatModel model;
    private final String template;
    private final BeanOutputConverter<GeneratedCourse> converter = new BeanOutputConverter<>(GeneratedCourse.class);

    public CourseGenerationModel(@Value("${app.generation.api-key}") String key,
            @Value("${app.generation.model}") String modelName) throws IOException {
        model = key.isBlank() ? null : OpenAiChatModel.builder().options(OpenAiChatOptions.builder()
                .apiKey(key).model(modelName).timeout(Duration.ofMinutes(3)).maxRetries(0)
                .maxCompletionTokens(16000).outputSchema(outputSchema()).build()).build();
        template = new ClassPathResource("prompts/course-generation.md").getContentAsString(StandardCharsets.UTF_8);
    }

    public boolean available() { return model != null; }

    static String outputSchema() {
        var json = new JsonMapper();
        var schema = (ObjectNode) json.readTree(new BeanOutputConverter<>(GeneratedCourse.class).getJsonSchema());
        var definitions = (ObjectNode) schema.path("$defs");
        var lessonQuiz = (ObjectNode) definitions.path("Quiz");
        var questions = (ObjectNode) lessonQuiz.path("properties").path("questions");
        bounds(questions, 2, 4);
        var question = questions.path("items").path("properties");
        ((ObjectNode) question.path("type")).putArray("enum").add("SINGLE_CHOICE").add("MULTIPLE_CHOICE").add("TRUE_FALSE");
        bounds((ObjectNode) question.path("options"), 2, 5);
        // The shared Java Quiz type has different counts in these two positions.
        var finalQuiz = lessonQuiz.deepCopy();
        bounds((ObjectNode) finalQuiz.path("properties").path("questions"), 5, 8);
        definitions.set("FinalQuiz", finalQuiz);
        var properties = (ObjectNode) schema.path("properties");
        ((ObjectNode) properties.path("finalQuiz")).put("$ref", "#/$defs/FinalQuiz");
        bounds((ObjectNode) properties.path("lessons"), 3, 5);
        bounds((ObjectNode) properties.path("objectives"), 2, 6);
        bounds((ObjectNode) properties.path("places"), 1, 5);
        ((ObjectNode) properties.path("difficulty")).putArray("enum").add("BEGINNER").add("INTERMEDIATE").add("ADVANCED");
        ((ObjectNode) properties.path("countryCode")).put("pattern", "^[A-Z]{2}$");
        ((ObjectNode) properties.path("estimatedMinutes")).put("minimum", 20).put("maximum", 40);
        ((ObjectNode) properties.path("lessons").path("items").path("properties").path("estimatedMinutes"))
                .put("minimum", 1).put("maximum", 12);
        // Every top-level field is nullable so a refusal can omit course content without inventing it.
        for (String name : properties.propertyNames()) {
            var original = properties.get(name);
            var nullable = json.createObjectNode();
            nullable.putArray("anyOf").add(original).addObject().put("type", "null");
            properties.set(name, nullable);
        }
        return json.writeValueAsString(schema);
    }

    private static void bounds(ObjectNode array, int minimum, int maximum) {
        array.put("minItems", minimum).put("maxItems", maximum);
    }

    public GeneratedCourse generate(String query, List<String> subjects) {
        return invoke(List.of(
                new SystemMessage(template + "\nExisting subjects: " + String.join(", ", subjects)),
                new UserMessage("Search topic: " + query + "\nFill all necessary fields in the complete course contract.")));
    }

    public GeneratedCourse repair(String query, List<String> subjects, GeneratedCourse draft, String feedback) {
        var corrected = invoke(List.of(new SystemMessage(template + "\nExisting subjects: " + String.join(", ", subjects)),
                new UserMessage("Search topic: " + query),
                new AssistantMessage(new JsonMapper().writeValueAsString(draft)),
                new UserMessage("Correct the previous complete course. The application found this issue: " + feedback
                        + "\nKeep valid material and fix this issue AND check every other requirement. Return the entire corrected JSON, not a patch."
                        + " If a place cannot be mapped unambiguously, use its precise local name or a well-known alternative relevant to the topic."
                        + " You may use only one place (the minimum); do not add extra difficult-to-map places just to fill the list."
                        + " Keep lesson and quiz place mentions consistent. Do not invent coordinates or discard required quizzes."
                        + " Preserve existing valid timing estimates while fixing places. Course estimatedMinutes must be strictly greater"
                        + " than the SUM of all lesson estimatedMinutes; explicitly add those numbers before responding.")));
        return preserveValidTiming(draft, corrected, feedback);
    }

    // A content/location correction must not invalidate already accepted duration metadata.
    static GeneratedCourse preserveValidTiming(GeneratedCourse original, GeneratedCourse corrected, String feedback) {
        if (feedback.startsWith("estimatedMinutes:") || feedback.contains(".estimatedMinutes:") || feedback.startsWith("course:")
                || original == null || corrected == null || corrected.refusalReason() != null
                || original.estimatedMinutes() == null || original.estimatedMinutes() < 20 || original.estimatedMinutes() > 40
                || original.lessons() == null || corrected.lessons() == null || original.lessons().size() != corrected.lessons().size())
            return corrected;
        int total = 0;
        for (var lesson : original.lessons()) {
            if (lesson == null || lesson.estimatedMinutes() == null || lesson.estimatedMinutes() < 1 || lesson.estimatedMinutes() > 12)
                return corrected;
            total += lesson.estimatedMinutes();
        }
        if (total >= original.estimatedMinutes() || corrected.lessons().stream().anyMatch(java.util.Objects::isNull)) return corrected;
        var lessons = new java.util.ArrayList<GeneratedCourse.Lesson>();
        for (int i = 0; i < corrected.lessons().size(); i++) {
            var lesson = corrected.lessons().get(i);
            lessons.add(new GeneratedCourse.Lesson(lesson.title(), lesson.markdown(), original.lessons().get(i).estimatedMinutes(), lesson.quiz()));
        }
        return new GeneratedCourse(corrected.refusalReason(), corrected.title(), corrected.description(), corrected.countryCode(),
                corrected.countryReason(), corrected.subject(), corrected.difficulty(), original.estimatedMinutes(),
                corrected.objectives(), corrected.places(), List.copyOf(lessons), corrected.finalQuiz());
    }

    private GeneratedCourse invoke(List<Message> messages) {
        var response = model.call(new Prompt(messages));
        var result = response.getResult();
        if (result == null) throw new IllegalStateException("Missing model result");
        if ("LENGTH".equalsIgnoreCase(result.getMetadata().getFinishReason()))
            throw new IllegalStateException("Incomplete model output");
        // Provider safety refusals may have no content and do not follow the JSON schema.
        if (result.getOutput().getText() == null || result.getOutput().getText().isBlank()) {
            return new GeneratedCourse("The model could not create a course about this topic. Try a more specific topic.",
                    null, null, null, null, null, null, null, null, null, null, null);
        }
        if (!"STOP".equalsIgnoreCase(result.getMetadata().getFinishReason()))
            throw new IllegalStateException("Incomplete model output");
        return converter.convert(result.getOutput().getText());
    }
}
