package ri.hack.outthere.benefits.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.benefits.model.CouponRow;

@Repository
public class CouponRepository {
    private final JdbcClient jdbc;
    private static final String SELECT = """
            SELECT id,offer_id,user_id,wallet_id,status,price_coins_snapshot,
                   offer_snapshot::text AS offer_snapshot,redemption_code,issued_at,expires_at
            FROM coupon_redemption
            """;

    public CouponRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Optional<CouponRow> find(UUID id) {
        return jdbc.sql(SELECT + " WHERE id=:id").param("id", id).query(CouponRow.class).optional();
    }

    public CouponRow lock(UUID id) {
        return jdbc.sql(SELECT + " WHERE id=:id FOR UPDATE").param("id", id).query(CouponRow.class).single();
    }

    public void create(CouponRow coupon) {
        jdbc.sql("""
                INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,metadata_json)
                VALUES (:wallet,(SELECT id FROM wallet_transaction_type WHERE label='BENEFIT_ACTIVATION'),
                        :amount,:key,jsonb_build_object('coupon_id',cast(:coupon AS text),'offer_id',cast(:offer AS text)))
                """).param("wallet", coupon.walletId()).param("amount", -coupon.priceCoinsSnapshot())
                .param("key", "benefit:" + coupon.id()).param("coupon", coupon.id()).param("offer", coupon.offerId()).update();
        jdbc.sql("UPDATE wallet SET balance=balance-:amount WHERE id=:wallet")
                .param("amount", coupon.priceCoinsSnapshot()).param("wallet", coupon.walletId()).update();
        jdbc.sql("""
                INSERT INTO coupon_redemption(id,offer_id,user_id,wallet_id,status,price_coins_snapshot,
                    offer_snapshot,redemption_code,issued_at,expires_at)
                VALUES (:id,:offer,:user,:wallet,'ACTIVE',:price,cast(:snapshot AS jsonb),:code,:issued,:expires)
                """).param("id", coupon.id()).param("offer", coupon.offerId()).param("user", coupon.userId())
                .param("wallet", coupon.walletId()).param("price", coupon.priceCoinsSnapshot())
                .param("snapshot", coupon.offerSnapshot()).param("code", coupon.redemptionCode())
                .param("issued", Timestamp.from(coupon.issuedAt())).param("expires", Timestamp.from(coupon.expiresAt())).update();
    }

    public void expire(CouponRow coupon, Instant now) {
        jdbc.sql("UPDATE coupon_redemption SET status='EXPIRED' WHERE id=:id AND status='ACTIVE'")
                .param("id", coupon.id()).update();
    }

    public CouponRow markUsed(UUID id, Instant now) {
        jdbc.sql("UPDATE coupon_redemption SET status='REDEEMED' WHERE id=:id AND status='ACTIVE' AND expires_at>:now")
                .param("id", id).param("now", Timestamp.from(now)).update();
        return lock(id);
    }

    public List<UUID> expired(UUID viewer, int limit) {
        var query = jdbc.sql("SELECT id FROM coupon_redemption WHERE status='ACTIVE' AND expires_at<=clock_timestamp()"
                + (viewer == null ? "" : " AND user_id=:viewer") + " ORDER BY offer_id,id LIMIT :limit");
        if (viewer != null) query.param("viewer", viewer);
        return query.param("limit", limit).query(UUID.class).list();
    }

    public List<CouponRow> history(UUID viewer, List<String> statuses, int page, int size) {
        var query = jdbc.sql(SELECT + " WHERE user_id=:viewer AND " + effectiveStatus() + " IN (:statuses) ORDER BY issued_at DESC,id LIMIT :size OFFSET :offset");
        return query.param("viewer", viewer).param("statuses", statuses).param("size", size)
                .param("offset", (long) page * size).query(CouponRow.class).list();
    }

    public long count(UUID viewer, List<String> statuses) {
        return jdbc.sql("SELECT count(*) FROM coupon_redemption WHERE user_id=:viewer AND " + effectiveStatus() + " IN (:statuses)")
                .param("viewer", viewer).param("statuses", statuses).query(Long.class).single();
    }

    private String effectiveStatus() {
        return "(CASE WHEN status='ACTIVE' AND expires_at<=clock_timestamp() THEN 'EXPIRED' ELSE status END)";
    }
}
