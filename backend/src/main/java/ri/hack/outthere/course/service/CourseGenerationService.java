package ri.hack.outthere.course.service;

import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.course.dto.GenerationResponse;
import ri.hack.outthere.course.repository.CourseGenerationRepository;
import ri.hack.outthere.user.service.UserService;

@Service
public class CourseGenerationService {
    private final CourseGenerationRepository jobs;
    private final CourseService courses;
    private final UserService users;
    private final CourseGenerationModel model;
    private final PlaceGeocoder geocoder;

    public CourseGenerationService(CourseGenerationRepository jobs, CourseService courses, UserService users,
                                   CourseGenerationModel model, PlaceGeocoder geocoder) {
        this.jobs = jobs; this.courses = courses; this.users = users; this.model = model; this.geocoder = geocoder;
    }

    @Transactional
    public GenerationResponse create(UUID viewer, String query) {
        users.requireUser(viewer);
        String topic = CourseService.normalizeQuery(query);
        if (topic.isBlank()) throw ApiException.badRequest("Enter a topic to create a course");
        jobs.lockUser(viewer);
        String key = topic.toLowerCase(Locale.ROOT);
        var existing = jobs.forQuery(viewer, key);
        if (existing.isPresent() && !existing.get().state().equals("FAILED")) return existing.get();
        var matches = courses.search(viewer, null, null, null, null, topic);
        if (!matches.isEmpty()) throw ApiException.conflict("A matching course is already available. Search again to open it.");
        if (!model.available() || !geocoder.available())
            throw ApiException.conflict("Course creation is unavailable until the server's model and geocoder are configured.");
        if (jobs.active(viewer).isPresent()) throw ApiException.conflict("Your previous course is still being created.");
        if (jobs.subjects().isEmpty()) throw ApiException.conflict("Course subjects must be configured before creating courses.");
        return jobs.enqueue(viewer, topic, key);
    }

    public GenerationResponse get(UUID viewer, UUID id) {
        users.requireUser(viewer);
        return jobs.get(viewer, id).orElseThrow(() -> ApiException.notFound("Course creation"));
    }

    public GenerationResponse find(UUID viewer, String query) {
        users.requireUser(viewer);
        return jobs.forQuery(viewer, CourseService.normalizeQuery(query).toLowerCase(Locale.ROOT)).orElse(null);
    }
}
