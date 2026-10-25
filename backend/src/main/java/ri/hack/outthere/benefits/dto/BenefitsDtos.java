package ri.hack.outthere.benefits.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import ri.hack.outthere.wallet.dto.WalletResponse;

public final class BenefitsDtos {
    private BenefitsDtos() { }

    public record Partner(UUID id, String name, String logoUrl, boolean isDemo) { }
    public record Country(String code, String name) { }
    public record Venue(UUID id, String name, String countryCode, String countryName) { }
    public record Page<T>(List<T> items, int page, int size, long total) { }
    public record Offer(UUID id, String title, String subtitle, String description, String imageUrl,
                        Partner partner, List<Country> eligibleCountries, List<Venue> venues,
                        long priceCoins, String terms, int termsVersion, String availability,
                        boolean eligible, String reasonIfIneligible, boolean isDemo) { }
    public record Coupon(UUID id, String status, Offer offer, long priceCoins, Instant issuedAt,
                         Instant expiresAt, String redemptionCode, Instant serverNow) { }
    public record CouponResult(Coupon coupon, WalletResponse wallet, Instant serverNow) { }
}
