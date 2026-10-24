package ri.hack.outthere.event.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.event.dto.EventResponse;
import ri.hack.outthere.event.service.EventService;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService service;

    public EventController(EventService service) { this.service = service; }

    @GetMapping
    public List<EventResponse> list() { return service.list(); }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable UUID id) { return service.get(id); }
}
