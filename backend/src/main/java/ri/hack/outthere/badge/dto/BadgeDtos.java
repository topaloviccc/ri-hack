package ri.hack.outthere.badge.dto;

import java.time.Instant;
import java.util.UUID;

public final class BadgeDtos {
    private BadgeDtos() { }

    /** {@code story} (Markdown) is null until the viewer has collected the badge. */
    public record BadgeResponse(UUID id, String name, String hook, String subtitle, String story, String imageUrl,
                                String countryCode, long rewardCoins, boolean collected, Instant collectedAt,
                                long awardedCoins) { }
    public record BadgeSummary(UUID id, String name, String hook, String imageUrl, Instant collectedAt) { }
    public record ScanRequest(String code) { }
    public record ScanResponse(BadgeResponse badge, boolean newlyCollected, long awardedCoins) { }
}
