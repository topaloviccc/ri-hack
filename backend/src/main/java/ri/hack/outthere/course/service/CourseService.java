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
import ri.hack.outthere.user.service.UserService;

@Service
@Transactional(readOnly = true)
public class CourseService {
    public enum Collection { CONTINUE, POPULAR, RECOMMENDED, FEED }

    private final CourseRepository courses;
    private final GeographyRepository geography;
    private final UserService users;

    public CourseService(CourseRepository courses, GeographyRepository geography, UserService users) {
        this.courses = courses;
        this.geography = geography;
        this.users = users;
    }

    public List<CourseResponse> list(UUID viewer, Collection collection, String countryCode,
                                     UUID locationId, List<UUID> ids) {
        users.requireUser(viewer);
        var rows = courses.courses(viewer, collection == null ? null : collection.name().toLowerCase(java.util.Locale.ROOT),
                countryCode, locationId, ids);
        var locations = courses.locations(rows.stream().map(CourseRow::id).toList());
        return rows.stream().map(row -> new CourseResponse(row.id(), row.title(), row.subject(),
                row.countryCode(), row.countryName(), locations.stream()
                    .filter(link -> link.courseId().equals(row.id())).map(CourseRepository.CourseLocation::location).toList(),
                row.description(), row.learnerCount(), row.estimatedMinutes(), row.difficulty(),
                row.progress(), row.unlockCost(), row.unlocked(), row.imageUrl())).toList();
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
        users.requireUser(viewer);
        if (!courses.exists(course)) throw ApiException.notFound("Course");
        courses.dismiss(viewer, course);
    }
}
