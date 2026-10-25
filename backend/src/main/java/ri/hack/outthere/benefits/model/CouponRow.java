package ri.hack.outthere.benefits.model;

import java.time.Instant;
import java.util.UUID;

public record CouponRow(UUID id, UUID offerId, UUID userId, UUID walletId, String status,
                        long priceCoinsSnapshot, String offerSnapshot, String redemptionCode,
                        Instant issuedAt, Instant expiresAt) { }
