package ri.hack.outthere.course.service;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;
import ri.hack.outthere.course.repository.RecommendationRepository;
import static org.mockito.Mockito.*;

class CourseEmbeddingWorkerTests {
    @Test
    void persistsRealProviderVectorsAndLeavesFailuresRetryable() {
        var repository = mock(RecommendationRepository.class);
        var provider = mock(EmbeddingModel.class);
        var job = new RecommendationRepository.EmbeddingJob(UUID.randomUUID(), "Course description", "hash", 1);
        when(repository.claim("model")).thenReturn(Optional.of(job));
        float[] vector = {0.5f, 0.8f};
        when(provider.embed(job.text())).thenReturn(vector).thenThrow(new RuntimeException("provider unavailable"))
                .thenReturn(new float[] {Float.NaN});
        var worker = new CourseEmbeddingWorker(repository, "model", provider);
        worker.tick();
        worker.tick();
        worker.tick();
        verify(repository, times(1)).complete(job, "model", vector);
        verify(repository, times(3)).discover("model");
    }
}
