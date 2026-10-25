package ri.hack.outthere.course.service;

import java.util.HashSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import com.openai.errors.OpenAIServiceException;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.course.dto.GeneratedCourse;
import ri.hack.outthere.course.repository.CourseGenerationRepository;

@Component
public class CourseGenerationWorker {
    private static final Logger log = LoggerFactory.getLogger(CourseGenerationWorker.class);
    private final CourseGenerationRepository jobs;
    private final CourseGenerationModel model;
    private final PlaceGeocoder geocoder;
    private final GeneratedCourseValidator validator;
    private final JsonMapper json;

    public CourseGenerationWorker(CourseGenerationRepository jobs, CourseGenerationModel model, PlaceGeocoder geocoder,
                                  GeneratedCourseValidator validator, JsonMapper json) {
        this.jobs = jobs; this.model = model; this.geocoder = geocoder; this.validator = validator; this.json = json;
    }

    @Scheduled(fixedDelayString = "${app.generation.worker-delay-ms}", initialDelayString = "${app.generation.worker-initial-delay-ms:10000}")
    public void tick() {
        if (!model.available() || !geocoder.available()) return;
        jobs.claim().ifPresent(job -> {
            String stage = "model";
            try {
                var draft = job.draftJson() == null ? model.generate(job.query(), jobs.subjects())
                        : json.readValue(job.draftJson(), GeneratedCourse.class);
                jobs.saveDraft(job, draft);
                while (true) {
                    try {
                        stage = "validation";
                        validator.validate(draft, new HashSet<>(jobs.countries()), new HashSet<>(jobs.subjects()));
                        if (draft.refusalReason() != null) {
                            jobs.finish(job, "REFUSED", draft.refusalReason());
                            return;
                        }
                        stage = "geocoder";
                        var places = geocoder.resolve(draft.places(), draft.countryCode());
                        if (places.stream().map(PlaceGeocoder.Place::identity).distinct().count() != places.size())
                            throw new GenerationValidationException("places", "Named places resolve to the same place");
                        stage = "storage";
                        jobs.publish(job, draft, places);
                        return;
                    } catch (GenerationValidationException invalid) {
                        log.warn("Course creation {} failed validation at {} during {}: {}", job.id(), invalid.path(), stage,
                                "validation".equals(stage) ? invalid.reason() : "Place could not be resolved; details are saved in job status");
                        if (!jobs.beginRepair(job, "Correcting course: " + invalid.getMessage())) throw invalid;
                        stage = "model";
                        draft = model.repair(job.query(), jobs.subjects(), draft, invalid.getMessage());
                        jobs.saveDraft(job, draft);
                    }
                }
            } catch (GenerationValidationException invalid) {
                jobs.finish(job, "FAILED", "Course correction could not finish: " + invalid.getMessage());
            } catch (IllegalArgumentException invalid) {
                log.warn("Course creation {} returned malformed data at {}", job.id(), stage);
                jobs.finish(job, "FAILED", "The " + stage + " response could not be read. Please try again.");
            } catch (RuntimeException failure) {
                int status = httpStatus(failure);
                // Provider messages and request URLs can contain credentials; log only stage/status/type.
                log.warn("Course creation {} failed at {} on attempt {} (HTTP {}, {})",
                        job.id(), stage, job.attempts(), status == 0 ? "unknown" : status, failure.getClass().getSimpleName());
                if (status == 401 || status == 403) {
                    String settings = "geocoder".equals(stage)
                            ? "Place geocoder authorization failed. Check GEOCODER_API_KEY and GEOCODER_AUTH_MODE."
                            : "Course model authorization failed. Check OPENAI_API_KEY and model access.";
                    jobs.finish(job, "FAILED", settings + " Restart the backend after updating credentials, then try again.");
                } else {
                    jobs.retry(job);
                }
            }
        });
    }

    private static int httpStatus(Throwable failure) {
        for (int depth = 0; failure != null && depth < 8; depth++, failure = failure.getCause()) {
            if (failure instanceof RestClientResponseException response) return response.getStatusCode().value();
            if (failure instanceof OpenAIServiceException response) return response.statusCode();
        }
        return 0;
    }
}
