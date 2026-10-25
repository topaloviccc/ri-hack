package ri.hack.outthere.badge.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.auth.controller.Viewer;
import ri.hack.outthere.badge.dto.BadgeDtos.BadgeResponse;
import ri.hack.outthere.badge.dto.BadgeDtos.BadgeSummary;
import ri.hack.outthere.badge.dto.BadgeDtos.ScanRequest;
import ri.hack.outthere.badge.dto.BadgeDtos.ScanResponse;
import ri.hack.outthere.badge.service.BadgeService;

@RestController
@RequestMapping("/api")
public class BadgeController {
    private final BadgeService service;

    public BadgeController(BadgeService service) { this.service = service; }

    @PostMapping("/badges/scan")
    public ScanResponse scan(@Viewer UUID viewer, @RequestBody ScanRequest request) {
        return service.scan(viewer, request.code());
    }

    @GetMapping("/badges/{id}")
    public BadgeResponse badge(@Viewer UUID viewer, @PathVariable UUID id) { return service.get(viewer, id); }

    @GetMapping("/users/{id}/badges")
    public List<BadgeSummary> collected(@Viewer UUID viewer, @PathVariable UUID id) {
        return service.collected(viewer, id);
    }
}
