package ri.hack.outthere.course.controller;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ri.hack.outthere.auth.controller.Viewer;
import ri.hack.outthere.course.dto.*;
import ri.hack.outthere.course.service.CourseService;

@RestController
@RequestMapping("/api")
public class CourseController {
    private final CourseService service;

    public CourseController(CourseService service) { this.service = service; }

    @GetMapping("/courses")
    public List<CourseResponse> courses(@Viewer UUID viewer,
            @RequestParam(required = false) String collection, @RequestParam(required = false) String countryCode,
            @RequestParam(required = false) UUID locationId, @RequestParam(required = false) List<UUID> ids,
            @RequestParam(required = false) String query) {
        CourseService.Collection selected = null;
        if (collection != null) {
            try { selected = CourseService.Collection.valueOf(collection.toUpperCase(Locale.ROOT)); }
            catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown course collection");
            }
        }
        return service.search(viewer, selected, countryCode, locationId, ids, query);
    }

    @GetMapping("/courses/{id}")
    public CourseResponse course(@Viewer UUID viewer, @PathVariable UUID id) {
        return service.get(viewer, id);
    }

    @PostMapping("/courses/{id}/dismiss")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void dismiss(@Viewer UUID viewer, @PathVariable UUID id) { service.dismiss(viewer, id); }

    public record FeedbackRequest(String action, Integer dwellMs) { }

    @PostMapping("/courses/{id}/feedback")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void feedback(@Viewer UUID viewer, @PathVariable UUID id, @RequestBody FeedbackRequest request) {
        service.feedback(viewer, id, request.action(), request.dwellMs());
    }

    @GetMapping("/countries")
    public List<CountryResponse> countries() { return service.countries(); }

    @GetMapping("/countries/{code}")
    public CountryResponse country(@PathVariable String code) { return service.country(code); }

    @GetMapping("/locations")
    public List<LocationResponse> locations(@RequestParam(required = false) String countryCode,
                                            @RequestParam(required = false) List<UUID> ids) {
        return service.locations(countryCode, ids);
    }

    @GetMapping("/locations/{id}")
    public LocationResponse location(@PathVariable UUID id) { return service.location(id); }
}
