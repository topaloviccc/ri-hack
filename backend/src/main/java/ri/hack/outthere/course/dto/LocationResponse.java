package ri.hack.outthere.course.dto;

import java.math.BigDecimal;
import java.util.UUID;

/** {@code kind} is a lowercase code (monument, nature, museum, venue, site) or null. */
public record LocationResponse(UUID id, String name, String countryCode, String countryName,
                               BigDecimal lat, BigDecimal lng, String imageUrl, String kind, String city) { }
