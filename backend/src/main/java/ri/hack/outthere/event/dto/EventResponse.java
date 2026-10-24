package ri.hack.outthere.event.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record EventResponse(UUID id, String title, Instant startsAt, String venue,
                            BigDecimal lat, BigDecimal lng, String description, String organizer,
                            boolean isFree, String registrationUrl) { }
