package ri.hack.outthere.wallet.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class WalletRepository {
    private final JdbcClient jdbc;

    public WalletRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public record WalletRow(UUID id, long balance) { }
    public record PriceRow(UUID id, long priceCoins, long rewardCoins) { }
    public record PurchaseRow(UUID courseId) { }

    public Optional<WalletRow> wallet(UUID user, boolean lock) {
        return jdbc.sql("SELECT id,balance FROM wallet WHERE user_id=:user" + (lock ? " FOR UPDATE" : ""))
                .param("user", user).query(WalletRow.class).optional();
    }

    public Optional<PriceRow> price(UUID course) {
        return jdbc.sql("""
                SELECT c.id,c.price_coins,c.reward_coins FROM course c
                JOIN course_version v ON v.id=c.current_published_version_id
                JOIN publication_status ps ON ps.id=v.publication_status_id
                WHERE c.id=:course AND c.archived_at IS NULL AND ps.label='PUBLISHED'
                FOR SHARE OF c,v
                """).param("course", course).query(PriceRow.class).optional();
    }

    public boolean owns(UUID user, UUID course) {
        return jdbc.sql("SELECT EXISTS(SELECT 1 FROM course_entitlement WHERE user_id=:user AND course_id=:course)")
                .param("user", user).param("course", course).query(Boolean.class).single();
    }

    public Optional<PurchaseRow> purchase(UUID wallet, String key) {
        return jdbc.sql("""
                SELECT (metadata_json->>'course_id')::uuid AS course_id FROM wallet_transaction
                WHERE wallet_id=:wallet AND idempotency_key=:key
                """).param("wallet", wallet).param("key", "unlock:" + key).query(PurchaseRow.class).optional();
    }

    public UUID debit(UUID wallet, UUID course, long amount, String key) {
        var transaction = jdbc.sql("""
                INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,metadata_json)
                VALUES (:wallet,(SELECT id FROM wallet_transaction_type WHERE label='COURSE_PURCHASE'),
                        :amount,:key,jsonb_build_object('course_id',cast(:course AS text))) RETURNING id
                """).param("wallet", wallet).param("course", course).param("amount", -amount)
                .param("key", "unlock:" + key).query(UUID.class).single();
        // The source schema's ledger trigger is intentionally omitted; this use case owns both writes.
        jdbc.sql("UPDATE wallet SET balance=balance-:amount WHERE id=:wallet")
                .param("wallet", wallet).param("amount", amount).update();
        return transaction;
    }

    public void grant(UUID user, PriceRow course, UUID transaction) {
        jdbc.sql("""
                INSERT INTO course_entitlement(user_id,course_id,acquisition_kind,acquisition_transaction_id,
                                               paid_coins,promised_reward_coins)
                VALUES (:user,:course,:kind,:transaction,:price,:reward)
                """).param("user", user).param("course", course.id()).param("kind", course.priceCoins() == 0 ? "FREE" : "PURCHASE")
                .param("transaction", transaction).param("price", course.priceCoins()).param("reward", course.rewardCoins()).update();
    }
}
