package ri.hack.outthere.network.dto;

import java.time.Instant;
import java.util.UUID;

public record FeedItemResponse(UUID id, UUID userId, String userName, String userAvatarUrl,
                               UUID courseId, String courseTitle, Instant completedAt) { }
