package ri.hack.outthere.user.dto;

import java.util.List;
import java.util.UUID;

public final class InterestDtos {
    private InterestDtos() { }
    public record InterestResponse(List<UUID> fieldIds, boolean onboardingComplete) { }
    public record InterestRequest(List<UUID> fieldIds) { }
}
