-- Optional local setup only. Run manually after demo-data.sql; never included in Liquibase startup.
-- Gives every seeded demo user (all use @example.test emails) the password "demo1234",
-- e.g. log in as demo.learner@example.test. Users that already have a password keep it.
BEGIN;

UPDATE app_user
SET password_hash='$2a$10$N2.f/gLCuFgabHDZdqZHCuRWiMIT/S5NFOy/9pcxcreTs5d0xtGKO', updated_at=now()
WHERE email LIKE '%@example.test' AND password_hash IS NULL;

COMMIT;
