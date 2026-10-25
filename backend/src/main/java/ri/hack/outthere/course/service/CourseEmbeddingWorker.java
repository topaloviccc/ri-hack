package ri.hack.outthere.course.service;

import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ri.hack.outthere.course.repository.RecommendationRepository;

@Component
public class CourseEmbeddingWorker {
    private static final Logger log = LoggerFactory.getLogger(CourseEmbeddingWorker.class);
    private final RecommendationRepository repository;
    private final String model;
    private final EmbeddingModel embeddings;

    @org.springframework.beans.factory.annotation.Autowired
    public CourseEmbeddingWorker(RecommendationRepository repository,
            @Value("${app.recommendations.embedding-model}") String model,
            @Value("${app.recommendations.api-key}") String apiKey,
            @Value("${app.recommendations.worker-enabled}") boolean enabled) {
        this(repository, model, enabled && !apiKey.isBlank() ? new OpenAiEmbeddingModel(
                OpenAiEmbeddingOptions.builder().apiKey(apiKey).model(model)
                        .timeout(Duration.ofSeconds(15)).maxRetries(0).build()) : null);
        if (enabled && apiKey.isBlank()) log.warn("OPENAI_API_KEY is absent: course embedding generation is paused; metadata ranking remains available");
    }

    // Kept separate so ordinary tests can supply a deterministic provider.
    CourseEmbeddingWorker(RecommendationRepository repository, String model, EmbeddingModel embeddings) {
        this.repository = repository;
        this.model = model;
        this.embeddings = embeddings;
    }

    @Scheduled(fixedDelayString = "${app.recommendations.worker-delay-ms}", initialDelay = 10000)
    public void tick() {
        if (embeddings == null) return;
        repository.discover(model);
        repository.claim(model).ifPresent(job -> {
            try {
                float[] vector = embeddings.embed(job.text());
                if (vector == null || vector.length == 0) throw new IllegalStateException("Empty embedding");
                double norm = 0;
                for (float value : vector) {
                    if (!Float.isFinite(value)) throw new IllegalStateException("Non-finite embedding");
                    norm += value * (double) value;
                }
                if (norm == 0) throw new IllegalStateException("Zero embedding");
                repository.complete(job, model, vector);
            } catch (RuntimeException failure) {
                // Never log provider bodies/headers (which may contain credentials).
                log.warn("Course embedding failed for {} (attempt {}/5, {}); retry lease is persisted",
                        job.id(), job.attempts(), failure.getClass().getSimpleName());
            }
        });
    }
}
