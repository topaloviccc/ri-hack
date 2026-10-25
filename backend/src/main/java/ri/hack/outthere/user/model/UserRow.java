package ri.hack.outthere.user.model;

import java.util.UUID;

public record UserRow(UUID id, String name, String handle, String avatarUrl, String countryCode,
                      String relation, long mutualFriendsCount, String bio) { }
