package ri.hack.outthere.course.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.course.dto.CourseResponse;
import ri.hack.outthere.course.dto.CountryResponse;
import ri.hack.outthere.course.dto.LocationResponse;
import ri.hack.outthere.course.model.CourseRow;
import ri.hack.outthere.course.repository.CourseRepository;
import ri.hack.outthere.course.repository.GeographyRepository;
import ri.hack.outthere.course.repository.RecommendationRepository;
import ri.hack.outthere.user.service.UserService;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.image.dto.CoverImageResponse;

@Service
@Transactional(readOnly = true)
public class CourseService {
    public enum Collection { CONTINUE, POPULAR, RECOMMENDED, FEED }

    private final CourseRepository courses;
    private final GeographyRepository geography;
    private final UserService users;
    private final RecommendationService recommendations;
    private final RecommendationRepository feedback;
    private final JsonMapper json;

    public CourseService(CourseRepository courses, GeographyRepository geography, UserService users,
                         RecommendationService recommendations, RecommendationRepository feedback, JsonMapper json) {
        this.courses = courses;
        this.geography = geography;
        this.users = users;
        this.recommendations = recommendations;
        this.feedback = feedback;
        this.json = json;
    }

    public List<CourseResponse> list(UUID viewer, Collection collection, String countryCode,
                                     UUID locationId, List<UUID> ids) {
        return search(viewer, collection, countryCode, locationId, ids, null);
    }

    public static String normalizeQuery(String query) {
        if (query == null) return "";
        String value = query.strip().replaceAll("\\s+", " ");
        if (value.length() > 200) throw ApiException.badRequest("Search must be at most 200 characters");
        return value;
    }

    public List<CourseResponse> search(UUID viewer, Collection collection, String countryCode,
                                      UUID locationId, List<UUID> ids, String query) {
        users.requireUser(viewer);
        var rows = courses.courses(viewer, collection == null ? null : collection.name().toLowerCase(java.util.Locale.ROOT),
                countryCode, locationId, ids, normalizeQuery(query));
        if (collection == Collection.RECOMMENDED || collection == Collection.FEED) rows = recommendations.rank(viewer, rows);
        var locations = courses.locations(rows.stream().map(CourseRow::id).toList());
        return rows.stream().map(row -> new CourseResponse(row.id(), row.title(), row.subject(),
                row.countryCode(), row.countryName(), locations.stream()
                    .filter(link -> link.courseId().equals(row.id())).map(CourseRepository.CourseLocation::location).toList(),
                row.description(), row.learnerCount(), row.estimatedMinutes(), row.difficulty(),
                row.progress(), row.unlockCost(), row.unlocked(), CoverImageResponse.parse(json, row.coverImageJson()),
                row.coverImagePending())).toList();
    }

    public CourseResponse get(UUID viewer, UUID id) {
        return list(viewer, null, null, null, List.of(id)).stream().findFirst()
                .orElseThrow(() -> ApiException.notFound("Course"));
    }

    public List<CountryResponse> countries() { return geography.countries(); }

    public CountryResponse country(String code) {
        return geography.countries().stream().filter(country -> country.code().equals(code)).findFirst()
                .orElseThrow(() -> ApiException.notFound("Country"));
    }

    public List<LocationResponse> locations(String country, List<UUID> ids) { return geography.locations(country, ids); }

    public LocationResponse location(UUID id) {
        return geography.location(id).orElseThrow(() -> ApiException.notFound("Location"));
    }

    @Transactional
    public void dismiss(UUID viewer, UUID course) {
        get(viewer, course);
        courses.dismiss(viewer, course);
    }

    @Transactional
    public void feedback(UUID viewer, UUID course, String action, Integer dwellMs) {
        get(viewer, course);
        if (!("OPEN".equals(action) || "NEXT".equals(action)) || dwellMs == null || dwellMs < 0 || dwellMs > 120000)
            throw ApiException.badRequest("Use OPEN or NEXT and a dwellMs between 0 and 120000");
        feedback.feedback(viewer, course, "OPEN".equals(action), dwellMs);
    }
}
