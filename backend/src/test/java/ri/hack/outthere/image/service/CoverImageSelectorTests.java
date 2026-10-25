package ri.hack.outthere.image.service;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.image.dto.CoverImageResponse;
import ri.hack.outthere.image.model.ImageCandidate;
import ri.hack.outthere.image.repository.CoverImageRepository.Context;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class CoverImageSelectorTests {
    @Test void modelCanOnlySelectRetrievedCandidatesAndCannotInventUrlOrCredits() {
        var model = mock(OpenAiChatModel.class);
        var selector = new CoverImageSelector(new JsonMapper(), model, model);
        var image = new CoverImageResponse("https://upload.wikimedia.org/castle.jpg", "https://commons.wikimedia.org/wiki/File:Castle.jpg",
                "Real author", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "Provider caption", 1280, 850);
        var candidates = List.of(new ImageCandidate("commons:42", "Castle", "Rijeka, Croatia", image));
        var context = new Context("Trsat castle walls", "Historical walls", "Croatia", "Trsat Castle, Rijeka");
        when(model.call(any(Prompt.class))).thenReturn(response("{\"candidateId\":\"invented\",\"caption\":\"Fake\"}"));
        assertThat(selector.select(context, candidates)).isEmpty();
        when(model.call(any(Prompt.class))).thenReturn(response("{\"candidateId\":\"commons:42\",\"caption\":\"Trsat Castle\"}"));
        assertThat(selector.select(context, candidates)).hasValueSatisfying(selected -> {
            assertThat(selected.url()).isEqualTo(image.url());
            assertThat(selected.author()).isEqualTo("Real author");
            assertThat(selected.caption()).isEqualTo("Trsat Castle");
        });
    }
    private static ChatResponse response(String json) {
        return new ChatResponse(List.of(new Generation(new AssistantMessage(json))));
    }
}
