package ri.hack.outthere.network.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.auth.controller.Viewer;
import ri.hack.outthere.network.dto.*;
import ri.hack.outthere.network.service.NetworkService;

@RestController
@RequestMapping("/api/network")
public class NetworkController {
    private final NetworkService service;

    public NetworkController(NetworkService service) { this.service = service; }

    @GetMapping("/feed")
    public List<FeedItemResponse> feed(@Viewer UUID viewer) { return service.feed(viewer); }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntryResponse> leaderboard(@Viewer UUID viewer) { return service.leaderboard(viewer); }
}
