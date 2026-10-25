package ri.hack.outthere.course.dto;

import java.util.List;
import java.util.UUID;
import ri.hack.outthere.image.dto.CoverImageResponse;

public record CourseResponse(UUID id, String title, String subject, String countryCode,
                             String countryName, List<LocationResponse> locations, String description,
                             long learnerCount, Integer estimatedMinutes, String difficulty,
                             Double progress, long unlockCost, boolean isUnlocked, String imageUrl,
                             CoverImageResponse coverImage, boolean coverImagePending) { }
