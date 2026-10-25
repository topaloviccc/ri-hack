package ri.hack.outthere.learning.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.learning.dto.LearningResponse;
import ri.hack.outthere.learning.model.LearningRows.*;

@Component
public class QuizGrader {
    public Map<UUID, List<UUID>> selections(List<Question> questions, List<Option> options,
                                           LearningResponse.Submission submission) {
        if (submission == null || submission.answers() == null || submission.answers().size() != questions.size())
            throw ApiException.badRequest("Answer every question exactly once");
        var result = new HashMap<UUID, List<UUID>>();
        for (var answer : submission.answers()) {
            if (answer == null || answer.questionId() == null || answer.optionIds() == null
                    || answer.optionIds().isEmpty() || answer.optionIds().stream().anyMatch(java.util.Objects::isNull)
                    || new HashSet<>(answer.optionIds()).size() != answer.optionIds().size()
                    || result.putIfAbsent(answer.questionId(), answer.optionIds().stream().sorted().toList()) != null)
                throw ApiException.badRequest("Provide one answer per question without duplicate options");
        }
        for (var question : questions) {
            requireSupported(question);
            var selected = result.get(question.id());
            Set<UUID> allowed = new HashSet<>(options.stream().filter(o -> o.questionId().equals(question.id())).map(Option::id).toList());
            if (selected == null || !allowed.containsAll(selected)
                    || (!question.type().equals("MULTIPLE_CHOICE") && selected.size() != 1))
                throw ApiException.badRequest("Selected options must belong to the question and match its type");
        }
        return result;
    }

    public void requireSupported(Question question) {
        if (!List.of("SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE").contains(question.type()))
            throw ApiException.conflict("This question type is not supported by the course player yet");
    }

    public List<UUID> correctOptions(UUID question, List<Option> options) {
        return options.stream().filter(o -> o.questionId().equals(question) && o.correct()).map(Option::id).sorted().toList();
    }
}
