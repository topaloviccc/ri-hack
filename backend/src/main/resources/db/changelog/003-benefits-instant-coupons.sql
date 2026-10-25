--liquibase formatted sql
--changeset outthere:003-benefits-instant-coupons

ALTER TABLE coupon_redemption
    DROP CONSTRAINT coupon_redemption_status_check,
    DROP CONSTRAINT coupon_redemption_check1,
    DROP CONSTRAINT coupon_redemption_check2;

-- Previous active coupons represented holds. Expire them before removing the hold
-- table so existing users are not given free coupons after the wallet change.
UPDATE coupon_redemption SET status='EXPIRED',cancelled_at=NULL
WHERE status IN ('ACTIVE','CANCELLED');

ALTER TABLE coupon_redemption ADD CONSTRAINT coupon_redemption_status_check
    CHECK (status IN ('ACTIVE','EXPIRED','REDEEMED'));

ALTER TABLE coupon_redemption ADD COLUMN redemption_code varchar(10);
UPDATE coupon_redemption SET redemption_code=upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
ALTER TABLE coupon_redemption ALTER COLUMN redemption_code SET NOT NULL;
ALTER TABLE coupon_redemption ADD CONSTRAINT ux_coupon_redemption_code UNIQUE(redemption_code);

ALTER TABLE coupon_redemption
    DROP COLUMN reservation_id CASCADE,
    DROP COLUMN quote_id CASCADE,
    DROP COLUMN terms_version_snapshot CASCADE,
    DROP COLUMN qr_token_hash CASCADE,
    DROP COLUMN pin_hash CASCADE,
    DROP COLUMN credentials_ciphertext CASCADE,
    DROP COLUMN credential_key_version CASCADE,
    DROP COLUMN redeemed_at CASCADE,
    DROP COLUMN cancelled_at CASCADE,
    DROP COLUMN redeemed_venue_id CASCADE,
    DROP COLUMN redeemed_by_operator_id CASCADE,
    DROP COLUMN capture_request_key CASCADE,
    DROP COLUMN idempotency_key CASCADE,
    DROP COLUMN request_fingerprint CASCADE;

DROP TABLE vendor_attempt;
DROP TABLE partner_operator;
DROP TABLE benefit_quote;
DROP TABLE wallet_reservation;

INSERT INTO wallet_transaction_type(id,label)
VALUES ('7fd9f875-0dae-42e4-92af-15085b458819','BENEFIT_ACTIVATION')
ON CONFLICT (label) DO NOTHING;
