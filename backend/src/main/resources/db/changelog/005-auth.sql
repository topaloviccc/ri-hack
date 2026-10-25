--liquibase formatted sql
--changeset outthere:005-auth
-- Email/password login. Existing rows keep a NULL hash and cannot log in until one is set.
-- Only regular users exist for now; widen the CHECK when other roles are introduced.
ALTER TABLE app_user
    ADD COLUMN password_hash varchar(100),
    ADD COLUMN role varchar(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER'));
