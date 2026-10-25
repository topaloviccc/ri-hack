package ri.hack.outthere.badge.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.badge.dto.BadgeDtos.BadgeResponse;
import ri.hack.outthere.badge.dto.BadgeDtos.BadgeSummary;
import ri.hack.outthere.badge.dto.BadgeDtos.ScanResponse;
import ri.hack.outthere.badge.repository.BadgeRepository;
import ri.hack.outthere.badge.repository.BadgeRepository.BadgeRow;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.user.service.UserService;

@Service
@Transactional(readOnly = true)
public class BadgeService {
    private static final int MAX_CODE_LENGTH = 120;

    private final BadgeRepository repository;
    private final UserService users;

    public BadgeService(BadgeRepository repository, UserService users) {
        this.repository = repository;
        this.users = users;
    }

    public BadgeResponse get(UUID viewer, UUID id) {
        users.requireUser(viewer);
        return response(repository.badge(viewer, id).orElseThrow(() -> ApiException.notFound("Badge")));
    }

    public List<BadgeSummary> collected(UUID viewer, UUID user) {
        users.requireUser(viewer);
        users.requireUser(user);
        return repository.collected(user);
    }

    @Transactional
    public ScanResponse scan(UUID viewer, String code) {
        users.requireUser(viewer);
        if (code == null || code.isBlank() || code.length() > MAX_CODE_LENGTH) throw ApiException.badRequest("Invalid tag code");
        UUID badge = repository.badgeForCode(code.strip()).orElseThrow(() -> ApiException.notFound("Badge"));
        var wallet = repository.lockWallet(viewer).orElseThrow(() -> ApiException.notFound("Wallet"));
        boolean isNew = !repository.hasCollected(viewer, badge);
        long awarded = 0;
        if (isNew) {
            awarded = repository.badge(viewer, badge).orElseThrow().rewardCoins();
            repository.collect(viewer, wallet, badge, awarded);
        }
        return new ScanResponse(get(viewer, badge), isNew, awarded);
    }

    private static BadgeResponse response(BadgeRow row) {
        boolean collected = row.collectedAt() != null;
        // The story is the reward for finding the tag; others only see the teaser.
        return new BadgeResponse(row.id(), row.name(), row.hook(), row.subtitle(), collected ? row.story() : null,
                row.imageUrl(), row.countryCode(), row.rewardCoins(), collected, row.collectedAt(),
                row.awardedCoins() == null ? 0 : row.awardedCoins());
    }
}
