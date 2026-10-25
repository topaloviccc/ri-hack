package ri.hack.outthere.user.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.auth.controller.Viewer;
import ri.hack.outthere.user.dto.InterestDtos.*;
import ri.hack.outthere.user.service.InterestService;

@RestController
@RequestMapping("/api/users/me/interests")
public class InterestController {
    private final InterestService service;
    public InterestController(InterestService service) { this.service = service; }
    @GetMapping
    public InterestResponse get(@Viewer UUID viewer) { return service.get(viewer); }
    @PostMapping
    public InterestResponse save(@Viewer UUID viewer, @RequestBody InterestRequest request) {
        return service.save(viewer, request);
    }
}
