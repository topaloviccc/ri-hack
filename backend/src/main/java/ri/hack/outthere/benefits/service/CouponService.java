package ri.hack.outthere.benefits.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.benefits.dto.BenefitsDtos.*;
import ri.hack.outthere.benefits.error.BenefitsException;
import ri.hack.outthere.benefits.model.CouponRow;
import ri.hack.outthere.benefits.repository.BenefitOfferRepository;
import ri.hack.outthere.benefits.repository.CouponRepository;
import ri.hack.outthere.wallet.repository.WalletRepository;

@Service
@Transactional
public class CouponService {
    private final BenefitOfferRepository offers;
    private final BenefitCatalogService catalog;
    private final CouponRepository coupons;
    private final WalletRepository wallets;
    private final CouponViewService views;

    public CouponService(BenefitOfferRepository offers, BenefitCatalogService catalog, CouponRepository coupons,
                         WalletRepository wallets, CouponViewService views) {
        this.offers = offers;
        this.catalog = catalog;
        this.coupons = coupons;
        this.wallets = wallets;
        this.views = views;
    }

    public CouponResult activate(UUID viewer, UUID offerId) {
        var wallet = wallets.wallet(viewer, true).orElseThrow(BenefitsException::missing);
        offers.lock(offerId);
        var now = offers.now();
        var offer = catalog.get(viewer, offerId);
        if (!offer.eligible()) {
            String code = offer.availability().equals("SOLD_OUT") ? "OFFER_OUT_OF_STOCK" : "OFFER_UNAVAILABLE";
            throw BenefitsException.conflict(code, offer.reasonIfIneligible());
        }
        var balance = wallets.balances(wallet.id());
        if (balance.availableBalance() < offer.priceCoins()) {
            throw new BenefitsException(402, "INSUFFICIENT_COINS", "You need " + (offer.priceCoins() - balance.availableBalance()) + " more coins");
        }
        UUID id = UUID.randomUUID();
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
        var coupon = new CouponRow(id, offerId, viewer, wallet.id(), "ACTIVE", offer.priceCoins(),
                views.snapshot(offer), code, now, now.plusSeconds(900));
        coupons.create(coupon);
        return result(coupon);
    }

    public Coupon get(UUID viewer, UUID id) { return views.coupon(owned(id, viewer), offers.now()); }

    public Coupon markUsed(UUID viewer, UUID id) {
        var coupon = coupons.find(id).filter(row -> row.userId().equals(viewer)).orElseThrow(BenefitsException::missing);
        coupon = coupons.lock(id);
        Instant now = offers.now();
        if (!coupon.status().equals("ACTIVE") || !coupon.expiresAt().isAfter(now)) {
            throw BenefitsException.conflict("COUPON_NOT_ACTIVE", "Only an active coupon can be marked as used");
        }
        return views.coupon(coupons.markUsed(id, now), now);
    }

    @Transactional(readOnly = true)
    public Page<Coupon> history(UUID viewer, String status, int page, int size) {
        BenefitCatalogService.checkPage(page, size);
        wallets.wallet(viewer, false).orElseThrow(BenefitsException::missing);
        var statuses = status == null || status.isBlank() ? List.of("ACTIVE", "REDEEMED", "EXPIRED") : Arrays.asList(status.split(","));
        if (statuses.stream().anyMatch(value -> !List.of("ACTIVE", "REDEEMED", "EXPIRED").contains(value))) {
            throw BenefitCatalogService.invalid("Unknown coupon status");
        }
        Instant now = offers.now();
        return new Page<>(coupons.history(viewer, statuses, page, size).stream()
                .map(row -> views.coupon(row, now)).toList(), page, size, coupons.count(viewer, statuses));
    }

    public void expire(UUID id) {
        coupons.find(id).filter(row -> row.status().equals("ACTIVE") && !row.expiresAt().isAfter(offers.now()))
                .ifPresent(row -> coupons.expire(row, offers.now()));
    }

    private CouponRow owned(UUID id, UUID viewer) {
        return coupons.find(id).filter(row -> row.userId().equals(viewer)).orElseThrow(BenefitsException::missing);
    }

    private CouponResult result(CouponRow coupon) {
        var now = offers.now();
        return new CouponResult(views.coupon(coupon, now), wallets.balances(coupon.walletId()), now);
    }
}
