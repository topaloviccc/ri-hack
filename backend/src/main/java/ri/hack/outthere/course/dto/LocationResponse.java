package ri.hack.outthere.course.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LocationResponse(UUID id, String name, String countryCode, String countryName,
                               BigDecimal lat, BigDecimal lng) { }
