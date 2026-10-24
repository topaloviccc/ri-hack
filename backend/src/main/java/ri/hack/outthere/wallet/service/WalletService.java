package ri.hack.outthere.wallet.service;

import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.user.service.UserService;
import ri.hack.outthere.wallet.dto.WalletResponse;
import ri.hack.outthere.wallet.repository.WalletRepository;

@Service
@Transactional(readOnly = true)
public class WalletService {
    private final WalletRepository repository;
    private final UserService users;

    public WalletService(WalletRepository repository, UserService users) {
        this.repository = repository;
        this.users = users;
    }

    public WalletResponse get(UUID viewer) {
        users.requireUser(viewer);
        return new WalletResponse(repository.wallet(viewer, false).orElseThrow(() -> ApiException.notFound("Wallet")).balance());
    }

    @Transactional
    public WalletResponse unlock(UUID viewer, UUID course, String idempotencyKey) {
        users.requireUser(viewer);
        var wallet = repository.wallet(viewer, true).orElseThrow(() -> ApiException.notFound("Wallet"));
        var previous = repository.purchase(wallet.id(), idempotencyKey);
        if (previous.isPresent()) {
            if (!Objects.equals(previous.get().courseId(), course)) {
                throw ApiException.conflict("Idempotency key already used for a different course");
            }
            return new WalletResponse(wallet.balance());
        }
        // Course-level ownership also makes repeated/free acquisitions naturally idempotent.
        if (repository.owns(viewer, course)) return new WalletResponse(wallet.balance());
        var price = repository.price(course).orElseThrow(() -> ApiException.notFound("Course"));
        if (wallet.balance() < price.priceCoins()) {
            throw new ApiException(ApiException.Kind.INSUFFICIENT_COINS, "Not enough coins");
        }
        UUID transaction = price.priceCoins() == 0 ? null
                : repository.debit(wallet.id(), course, price.priceCoins(), idempotencyKey);
        repository.grant(viewer, price, transaction);
        return new WalletResponse(wallet.balance() - price.priceCoins());
    }
}
