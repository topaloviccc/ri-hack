package ri.hack.outthere.benefits.model;

import java.time.Instant;
import java.util.UUID;

public record OfferRow(UUID id, UUID partnerId, String partnerName, String logoUrl, boolean partnerActive,
                       boolean isDemo, String title, String subtitle, String description, String imageUrl,
                       long priceCoins, String terms, int termsVersion, String status, Instant startsAt,
                       Instant endsAt, Integer inventoryTotal, int maxPerUser, long issuedCount, long userCount) { }
