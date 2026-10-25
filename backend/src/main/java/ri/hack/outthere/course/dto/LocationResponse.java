package ri.hack.outthere.course.dto;

import java.math.BigDecimal;
import java.util.UUID;
import ri.hack.outthere.image.dto.CoverImageResponse;

public record LocationResponse(UUID id, String name, String countryCode, String countryName,
                               BigDecimal lat, BigDecimal lng, String geocoderAttribution,
                               CoverImageResponse coverImage, boolean coverImagePending) { }
