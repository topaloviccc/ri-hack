package ri.hack.outthere.badge.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.badge.dto.BadgeDtos.BadgeSummary;

@Repository
public class BadgeRepository {
    private final JdbcClient jdbc;

    public BadgeRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public record BadgeRow(UUID id, String name, String hook, String subtitle, String story, String imageUrl,
                           String countryCode, long rewardCoins, Instant collectedAt, Long awardedCoins) { }

    public Optional<BadgeRow> badge(UUID viewer, UUID id) {
        return jdbc.sql("""
                SELECT b.id,b.label AS name,b.hook,b.subtitle,b.description AS story,b.image_url,
                       n.iso_code AS country_code,b.reward_coins,ub.earned_at AS collected_at,ub.reward_coins AS awarded_coins
                FROM badge b LEFT JOIN country n ON n.id=b.country_id
                LEFT JOIN user_badge ub ON ub.badge_id=b.id AND ub.user_id=:viewer
                WHERE b.id=:id
                """).param("viewer", viewer).param("id", id).query(BadgeRow.class).optional();
    }

    /** The badge an active tag awards; inactive and revoked tags award nothing. */
    public Optional<UUID> badgeForCode(String code) {
        return jdbc.sql("""
                SELECT t.badge_id FROM nfc_tag t JOIN nfc_tag_status s ON s.id=t.status_id
                WHERE t.public_code=:code AND s.label='ACTIVE'
                """).param("code", code).query(UUID.class).optional();
    }

    public List<BadgeSummary> collected(UUID user) {
        return jdbc.sql("""
                SELECT b.id,b.label AS name,b.hook,b.image_url,ub.earned_at AS collected_at
                FROM user_badge ub JOIN badge b ON b.id=ub.badge_id
                WHERE ub.user_id=:user ORDER BY ub.earned_at DESC,b.id
                """).param("user", user).query(BadgeSummary.class).list();
    }

    /** Locks the user's wallet, which serializes their scans so a badge is collected once. */
    public Optional<UUID> lockWallet(UUID user) {
        return jdbc.sql("SELECT id FROM wallet WHERE user_id=:user FOR UPDATE")
                .param("user", user).query(UUID.class).optional();
    }

    public boolean hasCollected(UUID user, UUID badge) {
        return jdbc.sql("SELECT EXISTS(SELECT 1 FROM user_badge WHERE user_id=:user AND badge_id=:badge)")
                .param("user", user).param("badge", badge).query(Boolean.class).single();
    }

    /** Called under the wallet lock: records the badge and pays its reward together. */
    public void collect(UUID user, UUID wallet, UUID badge, long rewardCoins) {
        UUID transaction = null;
        if (rewardCoins > 0) {
            transaction = jdbc.sql("""
                    INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,metadata_json)
                    VALUES (:wallet,(SELECT id FROM wallet_transaction_type WHERE label='NFC_VISIT'),:amount,:key,
                      jsonb_build_object('badge_id',CAST(:badge AS text))) RETURNING id
                    """).param("wallet", wallet).param("amount", rewardCoins).param("key", "nfc-badge:" + badge)
                    .param("badge", badge).query(UUID.class).single();
            jdbc.sql("UPDATE wallet SET balance=balance+:amount WHERE id=:wallet")
                    .param("amount", rewardCoins).param("wallet", wallet).update();
        }
        jdbc.sql("INSERT INTO user_badge(user_id,badge_id,transaction_id,reward_coins) VALUES (:user,:badge,:transaction,:amount)")
                .param("user", user).param("badge", badge).param("transaction", transaction)
                .param("amount", rewardCoins).update();
    }
}
