package ri.hack.outthere.course.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.auth.controller.Viewer;
import ri.hack.outthere.course.dto.GenerationResponse;
import ri.hack.outthere.course.service.CourseGenerationService;

@RestController
@RequestMapping("/api/course-generations")
public class CourseGenerationController {
    private final CourseGenerationService service;
    public CourseGenerationController(CourseGenerationService service) { this.service = service; }
    public record Request(String query) { }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public GenerationResponse create(@Viewer UUID viewer, @RequestBody Request request) {
        return service.create(viewer, request.query());
    }

    @GetMapping
    public GenerationResponse find(@Viewer UUID viewer, @RequestParam String query) { return service.find(viewer, query); }

    @GetMapping("/{id}")
    public GenerationResponse get(@Viewer UUID viewer, @PathVariable UUID id) { return service.get(viewer, id); }
}
