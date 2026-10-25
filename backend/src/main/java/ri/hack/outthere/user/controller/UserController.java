package ri.hack.outthere.user.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.auth.controller.Viewer;
import ri.hack.outthere.user.dto.UserResponse;
import ri.hack.outthere.user.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) { this.service = service; }

    @GetMapping
    public List<UserResponse> list(@Viewer UUID viewer,
            @RequestParam(required = false) String query, @RequestParam(required = false) String relation,
            @RequestParam(defaultValue = "false") boolean suggested) {
        return service.list(viewer, query, relation, suggested);
    }

    @GetMapping("/me")
    public UserResponse me(@Viewer UUID viewer) { return service.get(viewer, viewer); }

    @GetMapping("/{id}")
    public UserResponse get(@Viewer UUID viewer, @PathVariable UUID id) { return service.get(viewer, id); }

    @PostMapping("/{id}/friend-requests")
    public UserResponse request(@Viewer UUID viewer, @PathVariable UUID id) {
        return service.sendFriendRequest(viewer, id);
    }

    /** {@code id} is the user who sent the request; the viewer is its recipient. */
    @PostMapping("/{id}/friend-requests/accept")
    public UserResponse accept(@Viewer UUID viewer, @PathVariable UUID id) {
        return service.acceptFriendRequest(viewer, id);
    }

    @PostMapping("/{id}/friend-requests/decline")
    public UserResponse decline(@Viewer UUID viewer, @PathVariable UUID id) {
        return service.declineFriendRequest(viewer, id);
    }

    /** Withdraws the viewer's own pending request to {@code id}. */
    @PostMapping("/{id}/friend-requests/cancel")
    public UserResponse cancel(@Viewer UUID viewer, @PathVariable UUID id) {
        return service.cancelFriendRequest(viewer, id);
    }

    @PostMapping("/{id}/unfriend")
    public UserResponse unfriend(@Viewer UUID viewer, @PathVariable UUID id) {
        return service.removeFriend(viewer, id);
    }
}
