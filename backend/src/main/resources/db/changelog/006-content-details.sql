--liquibase formatted sql
--changeset outthere:006-content-details
-- Display details the mobile app used to fake locally. All nullable: existing rows stay valid and
-- clients render a fallback when a value is missing. Media are public URLs fetched directly by
-- the client (as with benefit_offer.image_url), not uploaded assets.
-- kind/category hold lowercase codes known to the client (place: monument, nature, museum,
-- venue, site; event: lecture, workshop, exhibition, film, sport, other). Like the source
-- schema's other columns they carry no CHECK constraint; unknown codes get a generic fallback.
ALTER TABLE country ADD COLUMN blurb text;
ALTER TABLE app_user ADD COLUMN bio text;
ALTER TABLE course ADD COLUMN image_url text;
ALTER TABLE place
    ADD COLUMN image_url text,
    ADD COLUMN kind varchar(30),
    ADD COLUMN city varchar(120);
-- price_eur is only meaningful when is_free is false; NULL there means "paid, price not given".
ALTER TABLE event
    ADD COLUMN image_url text,
    ADD COLUMN category varchar(30),
    ADD COLUMN language varchar(35),
    ADD COLUMN price_eur numeric(8,2);
