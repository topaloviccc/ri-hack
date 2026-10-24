-- Optional local setup only. Run manually; never included in Liquibase startup.
-- Re-running preserves the learner, wallet and any subsequent purchases.
BEGIN;

INSERT INTO app_user(id, first_name, last_name, username, email, timezone, created_at)
VALUES ('11111111-1111-4111-8111-111111111111', 'Demo', 'Learner',
        'demo.learner', 'demo.learner@example.test', 'Europe/Zagreb', now()-interval '60 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO wallet(user_id)
VALUES ('11111111-1111-4111-8111-111111111111')
ON CONFLICT (user_id) DO NOTHING;

SELECT id FROM wallet WHERE user_id='11111111-1111-4111-8111-111111111111' FOR UPDATE;

-- The schema's balance trigger is omitted, so provision credit and balance together.
WITH opening_credit AS (
    INSERT INTO wallet_transaction(wallet_id, type_id, amount, idempotency_key, metadata_json)
    SELECT w.id, t.id, 250, 'local-demo-opening-balance', '{"demo":true}'::jsonb
    FROM wallet w CROSS JOIN wallet_transaction_type t
    WHERE w.user_id='11111111-1111-4111-8111-111111111111' AND t.label='ADJUSTMENT'
      AND NOT EXISTS (
          SELECT 1 FROM wallet_transaction wt
          WHERE wt.wallet_id=w.id AND wt.idempotency_key='local-demo-opening-balance'
      )
    RETURNING wallet_id, amount
)
UPDATE wallet w SET balance=w.balance+c.amount FROM opening_credit c WHERE w.id=c.wallet_id;

COMMIT;
