package ri.hack.outthere.network.dto;

import java.util.UUID;

public record LeaderboardEntryResponse(long rank, UUID userId, String userName, String userAvatarUrl,
                                       long completedThisWeek, boolean isMe) { }
