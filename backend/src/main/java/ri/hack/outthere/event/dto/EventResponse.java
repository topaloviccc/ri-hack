package ri.hack.outthere.event.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * {@code city} comes from the venue place. {@code category} is a lowercase code (lecture, workshop,
 * exhibition, film, sport, other) or null; {@code language} is a BCP 47 tag; {@code priceEur} is
 * only set for paid events whose price is known.
 */
public record EventResponse(UUID id, String title, Instant startsAt, String venue,
                            BigDecimal lat, BigDecimal lng, String description, String organizer,
                            boolean isFree, String registrationUrl, String imageUrl, String category,
                            String city, String language, BigDecimal priceEur) { }
