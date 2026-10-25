--liquibase formatted sql
--changeset outthere:003-hosted-country-flags
-- Migrate existing backend-relative flag paths without replacing custom image URLs.
UPDATE country
SET flag_url='https://flagcdn.com/w160/' || lower(iso_code) || '.png'
WHERE flag_url='/api/flags/' || lower(iso_code) || '.png';
