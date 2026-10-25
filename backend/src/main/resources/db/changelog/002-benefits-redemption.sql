--liquibase formatted sql
--changeset outthere:002-benefits-redemption

CREATE TABLE partner (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(160) NOT NULL,
    logo_url text,
    active boolean NOT NULL DEFAULT true,
    is_demo boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE partner_venue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id uuid NOT NULL REFERENCES partner(id),
    place_id uuid NOT NULL REFERENCES place(id),
    active boolean NOT NULL DEFAULT true,
    UNIQUE(partner_id, place_id),
    UNIQUE(id, partner_id)
);

CREATE TABLE benefit_offer (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id uuid NOT NULL REFERENCES partner(id),
    title varchar(220) NOT NULL,
    subtitle text,
    description text,
    image_url text,
    terms text NOT NULL,
    terms_version integer NOT NULL DEFAULT 1 CHECK (terms_version > 0),
    price_coins bigint NOT NULL CHECK (price_coins > 0),
    status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','PAUSED','EXPIRED','ARCHIVED')),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    max_per_user integer NOT NULL DEFAULT 1 CHECK (max_per_user > 0),
    inventory_total integer CHECK (inventory_total >= 0),
    popularity_rank integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (ends_at > starts_at),
    UNIQUE(id, partner_id)
);

CREATE TABLE offer_venue (
    offer_id uuid NOT NULL,
    partner_venue_id uuid NOT NULL,
    partner_id uuid NOT NULL,
    PRIMARY KEY(offer_id, partner_venue_id),
    FOREIGN KEY(offer_id, partner_id) REFERENCES benefit_offer(id, partner_id),
    FOREIGN KEY(partner_venue_id, partner_id) REFERENCES partner_venue(id, partner_id)
);

CREATE TABLE wallet_reservation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id uuid NOT NULL REFERENCES wallet(id),
    amount_coins bigint NOT NULL CHECK (amount_coins > 0),
    status varchar(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD','CAPTURED','RELEASED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    captured_at timestamptz,
    released_at timestamptz,
    capture_transaction_id uuid UNIQUE,
    UNIQUE(id, wallet_id),
    FOREIGN KEY(capture_transaction_id, wallet_id) REFERENCES wallet_transaction(id, wallet_id),
    CHECK (expires_at > created_at),
    CHECK ((status = 'HELD' AND captured_at IS NULL AND released_at IS NULL AND capture_transaction_id IS NULL)
        OR (status = 'CAPTURED' AND captured_at IS NOT NULL AND released_at IS NULL AND capture_transaction_id IS NOT NULL)
        OR (status = 'RELEASED' AND captured_at IS NULL AND released_at IS NOT NULL AND capture_transaction_id IS NULL))
);

CREATE TABLE benefit_quote (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_user(id),
    offer_id uuid NOT NULL REFERENCES benefit_offer(id),
    price_coins bigint NOT NULL CHECK (price_coins > 0),
    terms_version integer NOT NULL CHECK (terms_version > 0),
    scope_hash varchar(128) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    CHECK (expires_at > created_at)
);

CREATE TABLE partner_operator (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES app_user(id),
    partner_id uuid NOT NULL REFERENCES partner(id),
    venue_id uuid,
    active boolean NOT NULL DEFAULT true,
    role varchar(20) NOT NULL DEFAULT 'CASHIER' CHECK (role IN ('CASHIER','MANAGER')),
    credential_hash varchar(128) NOT NULL UNIQUE,
    FOREIGN KEY(venue_id, partner_id) REFERENCES partner_venue(id, partner_id)
);

CREATE TABLE coupon_redemption (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id uuid NOT NULL REFERENCES benefit_offer(id),
    user_id uuid NOT NULL REFERENCES app_user(id),
    wallet_id uuid NOT NULL,
    reservation_id uuid NOT NULL UNIQUE,
    quote_id uuid NOT NULL UNIQUE REFERENCES benefit_quote(id),
    status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REDEEMED','EXPIRED','CANCELLED')),
    price_coins_snapshot bigint NOT NULL CHECK (price_coins_snapshot > 0),
    terms_version_snapshot integer NOT NULL CHECK (terms_version_snapshot > 0),
    offer_snapshot jsonb NOT NULL,
    qr_token_hash varchar(128) NOT NULL UNIQUE,
    pin_hash varchar(128) NOT NULL,
    credentials_ciphertext bytea NOT NULL,
    credential_key_version integer NOT NULL DEFAULT 1,
    issued_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    redeemed_at timestamptz,
    cancelled_at timestamptz,
    redeemed_venue_id uuid REFERENCES partner_venue(id),
    redeemed_by_operator_id uuid REFERENCES partner_operator(id),
    capture_request_key varchar(180),
    idempotency_key varchar(180) NOT NULL,
    request_fingerprint varchar(128) NOT NULL,
    UNIQUE(user_id, idempotency_key),
    FOREIGN KEY(wallet_id, user_id) REFERENCES wallet(id, user_id),
    FOREIGN KEY(reservation_id, wallet_id) REFERENCES wallet_reservation(id, wallet_id),
    CHECK (expires_at > issued_at),
    CHECK ((status = 'REDEEMED' AND redeemed_at IS NOT NULL AND redeemed_venue_id IS NOT NULL
        AND redeemed_by_operator_id IS NOT NULL AND capture_request_key IS NOT NULL)
        OR (status <> 'REDEEMED' AND redeemed_at IS NULL AND redeemed_venue_id IS NULL
        AND redeemed_by_operator_id IS NULL AND capture_request_key IS NULL)),
    CHECK ((status = 'CANCELLED') = (cancelled_at IS NOT NULL))
);

CREATE TABLE vendor_attempt (
    scope_hash varchar(128) PRIMARY KEY,
    attempt_count integer NOT NULL CHECK (attempt_count > 0),
    window_start timestamptz NOT NULL
);

CREATE INDEX ix_benefit_offer_partner_status ON benefit_offer(partner_id, status, starts_at, ends_at);
CREATE INDEX ix_partner_venue_place ON partner_venue(place_id);
CREATE INDEX ix_offer_venue_venue ON offer_venue(partner_venue_id);
CREATE INDEX ix_reservation_wallet_expiry ON wallet_reservation(wallet_id, status, expires_at);
CREATE INDEX ix_coupon_viewer_status ON coupon_redemption(user_id, status, issued_at DESC, id);
CREATE INDEX ix_coupon_offer_status ON coupon_redemption(offer_id, status, expires_at);
CREATE INDEX ix_coupon_expiry ON coupon_redemption(expires_at) WHERE status = 'ACTIVE';
CREATE INDEX ix_quote_viewer_expiry ON benefit_quote(user_id, expires_at);
CREATE INDEX ix_operator_partner_venue ON partner_operator(partner_id, venue_id);
CREATE INDEX ix_vendor_attempt_window ON vendor_attempt(window_start);
CREATE UNIQUE INDEX ux_coupon_capture_request ON coupon_redemption(redeemed_by_operator_id,capture_request_key)
    WHERE capture_request_key IS NOT NULL;
