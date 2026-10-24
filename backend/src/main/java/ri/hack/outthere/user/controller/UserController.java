package ri.hack.outthere.user.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.user.dto.UserResponse;
import ri.hack.outthere.user.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) { this.service = service; }

    @GetMapping
    public List<UserResponse> list(@RequestHeader("X-User-Id") UUID viewer,
            @RequestParam(required = false) String query, @RequestParam(required = false) String relation,
            @RequestParam(defaultValue = "false") boolean suggested) {
        return service.list(viewer, query, relation, suggested);
    }

    @GetMapping("/me")
    public UserResponse me(@RequestHeader("X-User-Id") UUID viewer) { return service.get(viewer, viewer); }

    @GetMapping("/{id}")
    public UserResponse get(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID id) { return service.get(viewer, id); }

    @PostMapping("/{id}/friend-requests")
    public UserResponse request(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID id) {
        return service.sendFriendRequest(viewer, id);
    }
}
