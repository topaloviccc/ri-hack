package ri.hack.outthere.user.dto;

import java.util.List;
import java.util.UUID;

public record UserResponse(UUID id, String name, String handle, String avatarUrl, String countryCode,
                           Stats stats, List<String> badgeCountryCodes, List<UUID> inProgressCourseIds,
                           List<UUID> completedCourseIds, String relation, long mutualFriendsCount,
                           String bio) {
    public record Stats(long completedCount, long streakDays, long countriesCount) { }
}
