package ri.hack.outthere.event.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.event.dto.EventResponse;
import ri.hack.outthere.event.repository.EventRepository;

@Service
@Transactional(readOnly = true)
public class EventService {
    private final EventRepository repository;

    public EventService(EventRepository repository) { this.repository = repository; }

    public List<EventResponse> list() { return repository.events(null); }

    public EventResponse get(UUID id) {
        return repository.events(id).stream().findFirst().orElseThrow(() -> ApiException.notFound("Event"));
    }
}
