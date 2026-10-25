package ri.hack.outthere.image.service;

import java.util.LinkedHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import com.openai.errors.OpenAIServiceException;
import ri.hack.outthere.image.model.ImageCandidate;
import ri.hack.outthere.image.repository.CoverImageRepository;

@Component
public class CoverImageWorker {
    private static final Logger log = LoggerFactory.getLogger(CoverImageWorker.class);
    private final CoverImageRepository jobs;
    private final CommonsImageSearch search;
    private final CoverImageSelector selector;
    private final boolean enabled;
    public CoverImageWorker(CoverImageRepository jobs, CommonsImageSearch search, CoverImageSelector selector,
                            @Value("${app.images.worker-enabled}") boolean enabled) {
        this.jobs = jobs; this.search = search; this.selector = selector; this.enabled = enabled;
    }
    @Scheduled(fixedDelayString = "${app.images.worker-delay-ms}", initialDelayString = "${app.images.worker-initial-delay-ms:15000}")
    public void tick() {
        if (!enabled || !selector.available()) return;
        jobs.discover();
        jobs.claim().ifPresent(job -> {
            try {
                var context = jobs.context(job);
                if (context.isEmpty()) { jobs.complete(job, null); return; }
                var candidates = new LinkedHashMap<String, ImageCandidate>();
                for (String query : selector.queries(context.get()))
                    for (var candidate : search.search(query)) candidates.putIfAbsent(candidate.id(), candidate);
                var selected = selector.select(context.get(), java.util.List.copyOf(candidates.values()));
                if (selected.isPresent() && !search.reachable(selected.get())) throw new IllegalStateException("Image is unavailable");
                jobs.complete(job, selected.orElse(null));
            } catch (RuntimeException failure) {
                int status = failure instanceof RestClientResponseException http ? http.getStatusCode().value()
                        : failure instanceof OpenAIServiceException api ? api.statusCode() : 0;
                log.warn("Cover image job {} failed on attempt {} (HTTP {}, {})", job.id(), job.attempts(), status,
                        failure.getClass().getSimpleName());
                jobs.fail(job, status == 401 || status == 403);
            }
        });
    }
}
