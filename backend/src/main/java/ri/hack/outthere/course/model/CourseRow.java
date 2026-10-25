package ri.hack.outthere.course.model;

import java.util.UUID;

/** Internal JDBC projection, kept separate from the API response. */
public record CourseRow(UUID id, String title, String subject, String countryCode, String countryName,
                        String description, long learnerCount, Integer estimatedMinutes,
                        String difficulty, Double progress, long unlockCost, boolean unlocked,
                        String coverImageJson, boolean coverImagePending) { }
