-- WorldLearn: initial PostgreSQL schema (new database, not an upgrade migration).
-- English-only. Requires the postgis and vector extension packages on the server.
-- UUID defaults run only for omitted IDs/DEFAULT; supplied UUIDs are preserved.
-- Course ownership spans versions. Published content is retained and immutable.
-- All lesson quizzes plus the final quiz count equally; an unrounded mean >=80 passes.
-- Best submitted attempt per quiz counts. Incorrect answers feed independent revision.
-- Application authorization, answer grading, scheduling and publication policy remain
-- backend responsibilities; constraints below enforce ownership and record consistency.
BEGIN;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;


-- 1. Codebooks. Stable seeded IDs work across environments; no country/field data is invented.


CREATE TABLE country (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
iso_code char(2) NOT NULL UNIQUE CHECK (iso_code ~ '^[A-Z]{2}$'),
label varchar(120) NOT NULL UNIQUE
);


CREATE TABLE field (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(100) NOT NULL UNIQUE
);


CREATE TABLE user_type (
id smallint PRIMARY KEY NOT NULL,
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO user_type(id,label) VALUES (1,'LEARNER');


INSERT INTO user_type(id,label) VALUES (2,'ADMIN');


INSERT INTO user_type(id,label) VALUES (3,'CONTRIBUTOR');


INSERT INTO user_type(id,label) VALUES (4,'PARTNER_OPERATOR');


CREATE TABLE question_type (
id integer PRIMARY KEY NOT NULL,
label varchar(50) NOT NULL UNIQUE
);


INSERT INTO question_type(id,label) VALUES (1,'SINGLE_CHOICE');


INSERT INTO question_type(id,label) VALUES (2,'MULTIPLE_CHOICE');


INSERT INTO question_type(id,label) VALUES (3,'TRUE_FALSE');


INSERT INTO question_type(id,label) VALUES (4,'SHORT_ANSWER');


INSERT INTO question_type(id,label) VALUES (5,'MATCHING');


CREATE TABLE visibility (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO visibility(id,label) VALUES ('e3a2ac10-28f9-5101-b32e-b2e70aecfaff','PUBLIC');


INSERT INTO visibility(id,label) VALUES ('10ef7cf4-6aac-5ebe-9a5f-06bdffe17543','PRIVATE');


CREATE TABLE difficulty (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO difficulty(id,label) VALUES ('08000e35-c398-5283-8335-920c4f7ad08d','BEGINNER');


INSERT INTO difficulty(id,label) VALUES ('d6b1b5e2-961c-59a0-aca8-c8fcd96c627d','INTERMEDIATE');


INSERT INTO difficulty(id,label) VALUES ('850b8492-9cb0-569b-b16c-2e8b0c1f944e','ADVANCED');


CREATE TABLE publication_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO publication_status(id,label) VALUES ('9c74f449-1cb8-5745-a7f4-6cc7ef718481','DRAFT');


INSERT INTO publication_status(id,label) VALUES ('aa7192b0-4b5d-5230-b311-25aa6b0e59ff','PUBLISHED');


INSERT INTO publication_status(id,label) VALUES ('6a79ff2b-726c-5c04-ac20-f207f66b4094','WITHDRAWN');


CREATE TABLE enrollment_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO enrollment_status(id,label) VALUES ('ebb792f8-19ba-5fd7-aebe-726b1a3071d2','NOT_STARTED');


INSERT INTO enrollment_status(id,label) VALUES ('fdb32e85-e734-5588-95c5-05a95c04ae49','IN_PROGRESS');


INSERT INTO enrollment_status(id,label) VALUES ('5bcd61ef-8dc7-53af-bc13-ee46134bbcc6','COMPLETED');


CREATE TABLE nfc_tag_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO nfc_tag_status(id,label) VALUES ('11de493d-fa1b-592e-a0a1-230dfc4565a7','ACTIVE');


INSERT INTO nfc_tag_status(id,label) VALUES ('13402db9-72ca-5fba-ac4e-306e8503a0a5','INACTIVE');


INSERT INTO nfc_tag_status(id,label) VALUES ('35206d63-4a3d-535d-bbe4-1be97b82c22b','REVOKED');


CREATE TABLE asset_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO asset_status(id,label) VALUES ('bfdb5251-82ab-5ea7-bfc6-4be526bca8c2','PENDING');


INSERT INTO asset_status(id,label) VALUES ('6e21ec3c-1874-520e-baad-9accbcdcbaaf','READY');


INSERT INTO asset_status(id,label) VALUES ('8ac885fd-419a-5113-9886-015de2f11a00','FAILED');


CREATE TABLE generation_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO generation_status(id,label) VALUES ('5079f1e3-f30d-553a-90d9-95af7aa93f1a','QUEUED');


INSERT INTO generation_status(id,label) VALUES ('fab67e8b-7e50-59bd-a122-c659553ed2a6','RUNNING');


INSERT INTO generation_status(id,label) VALUES ('aa0fb318-93ae-506f-9c23-06c00114e58c','SUCCEEDED');


INSERT INTO generation_status(id,label) VALUES ('38bf7781-5f3b-5f64-9ae4-f5a09a5a9c5a','FAILED');


INSERT INTO generation_status(id,label) VALUES ('4252d822-8fc7-596c-b1c6-33bad150d696','CANCELLED');


CREATE TABLE wallet_transaction_type (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO wallet_transaction_type(id,label) VALUES ('a82a54c9-c50b-5dd8-b590-ce5f160a0bad','COURSE_PURCHASE');


INSERT INTO wallet_transaction_type(id,label) VALUES ('6654b718-490c-5fda-b98e-7e3cea5c39ae','GENERATION_FEE');


INSERT INTO wallet_transaction_type(id,label) VALUES ('e05e02fe-5644-5a2d-9580-68c760199f59','COURSE_COMPLETION');


INSERT INTO wallet_transaction_type(id,label) VALUES ('9b09202a-1c69-5367-b408-b22abdc67fad','NFC_VISIT');


INSERT INTO wallet_transaction_type(id,label) VALUES ('a185b7bf-dd47-5705-b9fc-4d98a9529b47','EXPERT_CONTRIBUTION');


INSERT INTO wallet_transaction_type(id,label) VALUES ('d7d95781-9539-5e58-bd80-af0289e2af5a','MERCHANT_REDEMPTION');


INSERT INTO wallet_transaction_type(id,label) VALUES ('cbcb272d-eccb-53d6-921f-705fc3a1e861','COSMETIC_PURCHASE');


INSERT INTO wallet_transaction_type(id,label) VALUES ('719a2dc0-ae03-58f8-95dc-bdf60e8d9be7','REFUND');


INSERT INTO wallet_transaction_type(id,label) VALUES ('61e22e49-8912-56ef-8857-7f0fb4102635','ADJUSTMENT');


CREATE TABLE wallet_reservation_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO wallet_reservation_status(id,label) VALUES ('1cd2ee2f-16c3-576d-ac11-7655a065dd2d','ACTIVE');


INSERT INTO wallet_reservation_status(id,label) VALUES ('5321bc8d-f8c3-50a5-84d3-3bf9cabf2389','CAPTURED');


INSERT INTO wallet_reservation_status(id,label) VALUES ('a90e35cc-f18a-5bad-bd69-912fe5d14488','RELEASED');


INSERT INTO wallet_reservation_status(id,label) VALUES ('35d65bf6-2670-5ba0-b4b9-6bb8552650ea','EXPIRED');


CREATE TABLE course_interaction_type (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO course_interaction_type(id,label) VALUES ('ce8b2272-661d-5912-b473-25c95797d660','IMPRESSION');


INSERT INTO course_interaction_type(id,label) VALUES ('3756eb89-1516-5eb4-b0fc-cc3c9569c361','OPEN');


INSERT INTO course_interaction_type(id,label) VALUES ('19e993c2-d9a4-507d-8922-1bd07d7f41d1','LIKE');


INSERT INTO course_interaction_type(id,label) VALUES ('64f95540-c98f-5f9c-a999-13a47386d314','DISLIKE');


INSERT INTO course_interaction_type(id,label) VALUES ('456a36f0-8016-5d47-bec7-f6908a681e13','SAVE');


INSERT INTO course_interaction_type(id,label) VALUES ('80d257fb-b1c9-57eb-b4df-36a6f6a5c5a0','DEFER');


INSERT INTO course_interaction_type(id,label) VALUES ('8d17e6c0-3e7b-5fb6-9260-d0ecedcde84c','UNDO');


CREATE TABLE friendship_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO friendship_status(id,label) VALUES ('083f8160-cb30-54c4-9839-900c3ee65c68','PENDING');


INSERT INTO friendship_status(id,label) VALUES ('1fd341a9-517a-5e85-b681-2f558ce03441','ACCEPTED');


INSERT INTO friendship_status(id,label) VALUES ('b3027644-3190-5092-bcb0-ac9d116a4711','DECLINED');


INSERT INTO friendship_status(id,label) VALUES ('3c25464b-a108-576d-b534-e1f5a5bc851f','CANCELLED');


CREATE TABLE report_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO report_status(id,label) VALUES ('e1e28ea8-6f7a-5a82-90d7-9c1ec99362f6','OPEN');


INSERT INTO report_status(id,label) VALUES ('d58ace64-44ef-553b-b7eb-67a644055270','IN_REVIEW');


INSERT INTO report_status(id,label) VALUES ('ba1b98c2-5bfd-5312-83f2-d85bb6d7dc16','RESOLVED');


INSERT INTO report_status(id,label) VALUES ('4832cff2-3c84-57d8-974b-265b6329a41f','DISMISSED');


CREATE TABLE review_decision (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO review_decision(id,label) VALUES ('362f8bd1-e8a8-5ea1-8e38-6ff561db4810','COMMENT');


INSERT INTO review_decision(id,label) VALUES ('cb3df099-879c-5f00-991e-7c0d53cbdc85','ACCEPT');


INSERT INTO review_decision(id,label) VALUES ('bcbd4b0d-7aa1-5cb0-a67e-dcfc985621e9','REQUEST_CHANGES');


CREATE TABLE event_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO event_status(id,label) VALUES ('7d68ee58-6327-5512-a0a0-e7fab2f3e0e2','SCHEDULED');


INSERT INTO event_status(id,label) VALUES ('7c4370d5-e633-50c9-b9c0-35619a148e8f','CANCELLED');


INSERT INTO event_status(id,label) VALUES ('4500a14c-e12c-5a76-86e4-bc6def720902','COMPLETED');


CREATE TABLE redemption_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);


INSERT INTO redemption_status(id,label) VALUES ('692c45ae-2883-588d-89b0-6545ab90a2f6','RESERVED');


INSERT INTO redemption_status(id,label) VALUES ('d15a0f52-0282-5bfb-a5f1-b1a687a41104','REDEEMED');


INSERT INTO redemption_status(id,label) VALUES ('0b1f47d3-9744-5999-b8b1-8535e14a4422','EXPIRED');


INSERT INTO redemption_status(id,label) VALUES ('d03c2f7d-1ddb-58f0-81c0-cea2073947d5','CANCELLED');


-- 2. Accounts, authentication and privately stored files.


CREATE TABLE app_user (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
first_name varchar(100) NOT NULL,
last_name varchar(100) NOT NULL,
username varchar(50) NOT NULL CHECK (length(btrim(username)) > 0),
email varchar(255) NOT NULL CHECK (length(btrim(email)) > 0),
password_hash text,
email_verified_at timestamptz,
country_id uuid REFERENCES country(id),
user_type_id smallint NOT NULL DEFAULT 1 REFERENCES user_type(id),
avatar_url text,
timezone varchar(80) NOT NULL DEFAULT 'UTC',
visibility_id uuid NOT NULL DEFAULT '10ef7cf4-6aac-5ebe-9a5f-06bdffe17543' REFERENCES visibility(id),
notification_preferences jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(notification_preferences)='object'),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);


CREATE UNIQUE INDEX uq_username_ci ON app_user (lower(username));


CREATE UNIQUE INDEX uq_email_ci ON app_user (lower(email));


CREATE TABLE auth_identity (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
provider varchar(80) NOT NULL,
provider_subject text NOT NULL,
created_at timestamptz NOT NULL DEFAULT now(),
UNIQUE(provider,provider_subject), UNIQUE(user_id,provider)
);


CREATE TABLE auth_token (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
token_hash text NOT NULL UNIQUE,
purpose varchar(30) NOT NULL CHECK (purpose IN ('REFRESH','VERIFY_EMAIL','RESET_PASSWORD')),
created_at timestamptz NOT NULL DEFAULT now(),
expires_at timestamptz NOT NULL,
consumed_at timestamptz,
revoked_at timestamptz,
CHECK (expires_at > created_at)
);


-- Store only hashes of refresh, verification and password-reset tokens.


CREATE TABLE user_type_grant (
user_id uuid NOT NULL REFERENCES app_user(id),
user_type_id smallint NOT NULL REFERENCES user_type(id),
granted_by uuid NOT NULL REFERENCES app_user(id),
granted_at timestamptz NOT NULL DEFAULT now(),
revoked_at timestamptz CHECK (revoked_at >= granted_at),
PRIMARY KEY(user_id,user_type_id)
);


CREATE TABLE expert_field (
user_id uuid NOT NULL REFERENCES app_user(id),
field_id uuid NOT NULL REFERENCES field(id),
granted_by uuid NOT NULL REFERENCES app_user(id),
granted_at timestamptz NOT NULL DEFAULT now(),
revoked_at timestamptz CHECK (revoked_at >= granted_at),
PRIMARY KEY(user_id,field_id)
);


CREATE TABLE user_interest (
user_id uuid NOT NULL REFERENCES app_user(id),
field_id uuid NOT NULL REFERENCES field(id),
weight numeric(6,3) NOT NULL DEFAULT 1 CHECK (weight >= 0),
PRIMARY KEY(user_id,field_id)
);


CREATE TABLE media_asset (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
owner_id uuid NOT NULL REFERENCES app_user(id),
storage_key text NOT NULL UNIQUE,
original_filename text,
mime_type varchar(150) NOT NULL,
byte_size bigint NOT NULL CHECK (byte_size >= 0),
sha256 char(64) CHECK (sha256 ~ '^[0-9a-f]{64}$'),
status_id uuid NOT NULL DEFAULT 'bfdb5251-82ab-5ea7-bfc6-4be526bca8c2' REFERENCES asset_status(id),
created_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz,
UNIQUE(id,owner_id)
);


-- Object keys are private implementation data. Public course APIs must not expose raw source keys.


CREATE TABLE source_material (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
owner_id uuid NOT NULL REFERENCES app_user(id),
asset_id uuid,
title text NOT NULL,
source_url text,
pasted_text text,
extracted_text text,
supersedes_id uuid REFERENCES source_material(id),
extraction_status_id uuid NOT NULL DEFAULT 'bfdb5251-82ab-5ea7-bfc6-4be526bca8c2' REFERENCES asset_status(id),
rights_note text,
created_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz,
FOREIGN KEY(asset_id,owner_id) REFERENCES media_asset(id,owner_id),
CHECK (asset_id IS NOT NULL OR pasted_text IS NOT NULL OR source_url IS NOT NULL)
);


CREATE TABLE source_material_grant (
material_id uuid NOT NULL REFERENCES source_material(id),
user_id uuid NOT NULL REFERENCES app_user(id),
granted_by uuid NOT NULL REFERENCES app_user(id),
granted_at timestamptz NOT NULL DEFAULT now(),
expires_at timestamptz,
revoked_at timestamptz,
PRIMARY KEY(material_id,user_id),
CHECK (expires_at > granted_at), CHECK (revoked_at >= granted_at)
);


CREATE TABLE source_chunk (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
material_id uuid NOT NULL REFERENCES source_material(id),
position integer NOT NULL CHECK (position >= 0),
content text NOT NULL,
page_number integer CHECK (page_number > 0),
content_hash char(64) NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
UNIQUE(material_id,position)
);


-- 3. Geography. Decimal coordinates are authoritative; the geographic point cannot drift.


CREATE TABLE place (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
name varchar(200) NOT NULL,
description text,
country_id uuid NOT NULL REFERENCES country(id),
address text,
latitude numeric(9,6) CHECK (latitude BETWEEN -90 AND 90),
longitude numeric(9,6) CHECK (longitude BETWEEN -180 AND 180),
location geography(Point,4326) GENERATED ALWAYS AS (
  CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL
  THEN ST_SetSRID(ST_MakePoint(longitude::double precision,latitude::double precision),4326)::geography
  ELSE NULL END
) STORED,
created_at timestamptz NOT NULL DEFAULT now(),
archived_at timestamptz,
CHECK ((latitude IS NULL)=(longitude IS NULL))
);


CREATE INDEX ix_place_location ON place USING gist(location);


CREATE TABLE nfc_tag (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
place_id uuid NOT NULL REFERENCES place(id),
public_code varchar(120) NOT NULL UNIQUE,
status_id uuid NOT NULL DEFAULT '11de493d-fa1b-592e-a0a1-230dfc4565a7' REFERENCES nfc_tag_status(id),
installed_at timestamptz,
last_checked_at timestamptz,
UNIQUE(id,place_id)
);


CREATE TABLE concept (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(200) NOT NULL UNIQUE,
description text,
field_id uuid REFERENCES field(id)
);


CREATE TABLE concept_place (
concept_id uuid NOT NULL REFERENCES concept(id),
place_id uuid NOT NULL REFERENCES place(id),
relationship_note text NOT NULL,
PRIMARY KEY(concept_id,place_id)
);


-- 4. Versioned courses. Publication policy is intentionally not hard-coded.


CREATE TABLE course (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
creator_id uuid NOT NULL REFERENCES app_user(id),
title varchar(220) NOT NULL,
description text,
country_id uuid REFERENCES country(id),
difficulty_id uuid NOT NULL DEFAULT '08000e35-c398-5283-8335-920c4f7ad08d' REFERENCES difficulty(id),
estimated_minutes integer CHECK (estimated_minutes > 0),
price_coins bigint NOT NULL DEFAULT 0 CHECK (price_coins >= 0),
reward_coins bigint NOT NULL DEFAULT 0 CHECK (reward_coins >= 0),
visibility_id uuid NOT NULL DEFAULT 'e3a2ac10-28f9-5101-b32e-b2e70aecfaff' REFERENCES visibility(id),
current_published_version_id uuid,
cover_asset_id uuid REFERENCES media_asset(id),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
archived_at timestamptz
);


CREATE TABLE course_field (
course_id uuid NOT NULL REFERENCES course(id),
field_id uuid NOT NULL REFERENCES field(id), PRIMARY KEY(course_id,field_id)
);


CREATE TABLE course_place (
course_id uuid NOT NULL REFERENCES course(id),
place_id uuid NOT NULL REFERENCES place(id),
relationship_note text,
PRIMARY KEY(course_id,place_id)
);


CREATE TABLE course_version (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
course_id uuid NOT NULL REFERENCES course(id),
version_number integer NOT NULL CHECK (version_number > 0),
title varchar(220) NOT NULL,
description text,
objectives_json jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(objectives_json)='array'),
difficulty_id uuid NOT NULL DEFAULT '08000e35-c398-5283-8335-920c4f7ad08d' REFERENCES difficulty(id),
estimated_minutes integer CHECK (estimated_minutes > 0),
publication_status_id uuid NOT NULL DEFAULT '9c74f449-1cb8-5745-a7f4-6cc7ef718481' REFERENCES publication_status(id),
created_by uuid NOT NULL REFERENCES app_user(id),
created_at timestamptz NOT NULL DEFAULT now(),
published_at timestamptz,
UNIQUE(course_id,version_number), UNIQUE(id,course_id),
CHECK ((published_at IS NULL AND publication_status_id='9c74f449-1cb8-5745-a7f4-6cc7ef718481')
  OR (published_at IS NOT NULL AND publication_status_id<>'9c74f449-1cb8-5745-a7f4-6cc7ef718481'))
);


ALTER TABLE course ADD CONSTRAINT fk_course_current_version FOREIGN KEY(current_published_version_id,id) REFERENCES course_version(id,course_id) DEFERRABLE INITIALLY IMMEDIATE;


CREATE TABLE course_prerequisite (
course_id uuid NOT NULL REFERENCES course(id),
prerequisite_course_id uuid NOT NULL REFERENCES course(id),
PRIMARY KEY(course_id,prerequisite_course_id), CHECK(course_id<>prerequisite_course_id)
);


CREATE TABLE course_version_concept (
course_version_id uuid NOT NULL REFERENCES course_version(id),
concept_id uuid NOT NULL REFERENCES concept(id), PRIMARY KEY(course_version_id,concept_id)
);


CREATE TABLE course_version_source (
course_version_id uuid NOT NULL REFERENCES course_version(id),
material_id uuid NOT NULL REFERENCES source_material(id),
PRIMARY KEY(course_version_id,material_id)
);


CREATE TABLE lesson (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
course_version_id uuid NOT NULL REFERENCES course_version(id),
position integer NOT NULL CHECK (position >= 0),
title varchar(220) NOT NULL,
content_json jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(content_json)='object'),
UNIQUE(course_version_id,position), UNIQUE(id,course_version_id)
);


CREATE TABLE lesson_asset (
lesson_id uuid NOT NULL REFERENCES lesson(id),
asset_id uuid NOT NULL REFERENCES media_asset(id),
position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
PRIMARY KEY(lesson_id,asset_id)
);


CREATE TABLE lesson_chunk (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
lesson_id uuid NOT NULL REFERENCES lesson(id),
position integer NOT NULL CHECK (position >= 0),
content text NOT NULL,
content_hash char(64) NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
UNIQUE(lesson_id,position)
);


CREATE TABLE quiz (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
course_version_id uuid NOT NULL REFERENCES course_version(id),
lesson_id uuid UNIQUE,
title varchar(220),
UNIQUE(id,course_version_id),
FOREIGN KEY(lesson_id,course_version_id) REFERENCES lesson(id,course_version_id)
);


CREATE UNIQUE INDEX uq_quiz_final_per_version ON quiz (course_version_id) WHERE lesson_id IS NULL;


-- A quiz without lesson_id is the final quiz. Every lesson has one quiz at publication.


CREATE TABLE question (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
quiz_id uuid NOT NULL REFERENCES quiz(id),
question_type_id integer NOT NULL REFERENCES question_type(id),
prompt text NOT NULL,
explanation text,
grading_json jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(grading_json)='object'),
position integer NOT NULL CHECK (position >= 0),
points numeric(8,2) NOT NULL DEFAULT 1 CHECK (points > 0),
UNIQUE(quiz_id,position), UNIQUE(id,quiz_id)
);


CREATE TABLE answer_option (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
question_id uuid NOT NULL REFERENCES question(id),
answer_text text NOT NULL,
is_correct boolean NOT NULL DEFAULT false,
position integer NOT NULL CHECK (position >= 0),
UNIQUE(question_id,position)
);


CREATE TABLE question_concept (
question_id uuid NOT NULL REFERENCES question(id),
concept_id uuid NOT NULL REFERENCES concept(id), PRIMARY KEY(question_id,concept_id)
);


-- 5. Wallet ledger. Amounts are signed; balances are maintained by the ledger trigger.


CREATE TABLE wallet (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL UNIQUE REFERENCES app_user(id),
balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
UNIQUE(id,user_id)
);


CREATE TABLE wallet_reservation (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
wallet_id uuid NOT NULL REFERENCES wallet(id),
amount bigint NOT NULL CHECK (amount > 0),
idempotency_key text NOT NULL,
status_id uuid NOT NULL DEFAULT '1cd2ee2f-16c3-576d-ac11-7655a065dd2d' REFERENCES wallet_reservation_status(id),
created_at timestamptz NOT NULL DEFAULT now(),
expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
closed_at timestamptz,
UNIQUE(wallet_id,idempotency_key), UNIQUE(id,wallet_id),
CHECK ((status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d')=(closed_at IS NULL))
);


CREATE TABLE wallet_transaction (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
wallet_id uuid NOT NULL REFERENCES wallet(id),
type_id uuid NOT NULL REFERENCES wallet_transaction_type(id),
amount bigint NOT NULL CHECK (amount <> 0),
idempotency_key text NOT NULL,
reservation_id uuid UNIQUE,
reverses_transaction_id uuid UNIQUE,
metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata_json)='object'),
created_at timestamptz NOT NULL DEFAULT now(),
UNIQUE(wallet_id,idempotency_key), UNIQUE(id,wallet_id),
FOREIGN KEY(reservation_id,wallet_id) REFERENCES wallet_reservation(id,wallet_id),
FOREIGN KEY(reverses_transaction_id,wallet_id) REFERENCES wallet_transaction(id,wallet_id)
);


CREATE TABLE course_entitlement (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
course_id uuid NOT NULL REFERENCES course(id),
acquired_at timestamptz NOT NULL DEFAULT now(),
acquisition_kind varchar(20) NOT NULL CHECK (acquisition_kind IN ('FREE','PURCHASE','GENERATION','GRANT')),
acquisition_transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
paid_coins bigint NOT NULL DEFAULT 0 CHECK (paid_coins >= 0),
promised_reward_coins bigint NOT NULL CHECK (promised_reward_coins >= 0),
UNIQUE(user_id,course_id), UNIQUE(id,user_id,course_id),
CHECK ((paid_coins=0 AND acquisition_transaction_id IS NULL) OR
       (paid_coins>0 AND acquisition_transaction_id IS NOT NULL))
);


CREATE TABLE enrollment (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
entitlement_id uuid NOT NULL,
user_id uuid NOT NULL REFERENCES app_user(id),
course_id uuid NOT NULL,
course_version_id uuid NOT NULL,
status_id uuid NOT NULL DEFAULT 'ebb792f8-19ba-5fd7-aebe-726b1a3071d2' REFERENCES enrollment_status(id),
enrolled_at timestamptz NOT NULL DEFAULT now(),
first_opened_at timestamptz,
completed_at timestamptz,
UNIQUE(entitlement_id,course_version_id), UNIQUE(id,course_version_id), UNIQUE(id,user_id),
FOREIGN KEY(entitlement_id,user_id,course_id) REFERENCES course_entitlement(id,user_id,course_id),
FOREIGN KEY(course_version_id,course_id) REFERENCES course_version(id,course_id),
CHECK (first_opened_at >= enrolled_at),
CHECK (completed_at IS NULL OR (first_opened_at IS NOT NULL AND completed_at>=first_opened_at))
);


CREATE TABLE lesson_progress (
enrollment_id uuid NOT NULL,
course_version_id uuid NOT NULL,
lesson_id uuid NOT NULL,
completed_at timestamptz,
PRIMARY KEY(enrollment_id,lesson_id),
FOREIGN KEY(enrollment_id,course_version_id) REFERENCES enrollment(id,course_version_id),
FOREIGN KEY(lesson_id,course_version_id) REFERENCES lesson(id,course_version_id)
);


CREATE TABLE quiz_attempt (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
enrollment_id uuid NOT NULL,
course_version_id uuid NOT NULL,
quiz_id uuid NOT NULL,
attempt_number integer NOT NULL CHECK (attempt_number>0),
started_at timestamptz NOT NULL DEFAULT now(),
submitted_at timestamptz,
earned_points numeric(10,2),
possible_points numeric(10,2),
assisted boolean NOT NULL DEFAULT false,
UNIQUE(enrollment_id,quiz_id,attempt_number), UNIQUE(id,quiz_id),
FOREIGN KEY(enrollment_id,course_version_id) REFERENCES enrollment(id,course_version_id),
FOREIGN KEY(quiz_id,course_version_id) REFERENCES quiz(id,course_version_id),
CHECK (submitted_at >= started_at),
CHECK ((submitted_at IS NULL AND earned_points IS NULL AND possible_points IS NULL) OR
       (submitted_at IS NOT NULL AND earned_points IS NOT NULL AND possible_points IS NOT NULL
        AND possible_points>0 AND earned_points BETWEEN 0 AND possible_points))
);


CREATE TABLE question_response (
attempt_id uuid NOT NULL,
question_id uuid NOT NULL,
quiz_id uuid NOT NULL,
response_json jsonb NOT NULL,
is_correct boolean NOT NULL,
possible_points numeric(8,2) NOT NULL CHECK (possible_points>0),
earned_points numeric(8,2) NOT NULL,
PRIMARY KEY(attempt_id,question_id),
FOREIGN KEY(attempt_id,quiz_id) REFERENCES quiz_attempt(id,quiz_id),
FOREIGN KEY(question_id,quiz_id) REFERENCES question(id,quiz_id),
CHECK ((is_correct AND earned_points=possible_points) OR (NOT is_correct AND earned_points=0))
);


CREATE TABLE course_completion (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
enrollment_id uuid NOT NULL UNIQUE REFERENCES enrollment(id),
completed_at timestamptz NOT NULL DEFAULT now(),
quiz_count integer NOT NULL CHECK (quiz_count>0),
aggregate_percentage numeric(12,8) NOT NULL CHECK (aggregate_percentage BETWEEN 80 AND 100),
score_sum_numerator numeric NOT NULL CHECK (score_sum_numerator>=0),
score_sum_denominator numeric NOT NULL CHECK (score_sum_denominator>0),
CHECK (score_sum_numerator*5 >= score_sum_denominator*4*quiz_count)
);


CREATE TABLE course_completion_quiz_result (
completion_id uuid NOT NULL REFERENCES course_completion(id),
quiz_id uuid NOT NULL REFERENCES quiz(id),
attempt_id uuid NOT NULL,
PRIMARY KEY(completion_id,quiz_id),
FOREIGN KEY(attempt_id,quiz_id) REFERENCES quiz_attempt(id,quiz_id)
);


CREATE TABLE course_completion_reward (
user_id uuid NOT NULL REFERENCES app_user(id),
course_id uuid NOT NULL REFERENCES course(id),
completion_id uuid NOT NULL UNIQUE REFERENCES course_completion(id),
transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
amount bigint NOT NULL CHECK (amount>=0),
PRIMARY KEY(user_id,course_id),
CHECK ((amount=0 AND transaction_id IS NULL) OR (amount>0 AND transaction_id IS NOT NULL))
);


CREATE TABLE question_revision (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
question_id uuid NOT NULL REFERENCES question(id),
first_incorrect_attempt_id uuid NOT NULL,
last_incorrect_attempt_id uuid NOT NULL,
created_at timestamptz NOT NULL DEFAULT now(),
last_reviewed_at timestamptz,
next_review_at timestamptz NOT NULL,
review_count integer NOT NULL DEFAULT 0 CHECK (review_count>=0),
lapse_count integer NOT NULL DEFAULT 0 CHECK (lapse_count>=0),
interval_days numeric(10,3) NOT NULL DEFAULT 0 CHECK (interval_days>=0),
scheduler_version text NOT NULL DEFAULT 'interval-v1',
UNIQUE(user_id,question_id),
FOREIGN KEY(first_incorrect_attempt_id,question_id) REFERENCES question_response(attempt_id,question_id),
FOREIGN KEY(last_incorrect_attempt_id,question_id) REFERENCES question_response(attempt_id,question_id)
);


CREATE TABLE question_revision_event (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
revision_id uuid NOT NULL REFERENCES question_revision(id),
reviewed_at timestamptz NOT NULL DEFAULT now(),
is_correct boolean NOT NULL,
response_json jsonb NOT NULL,
previous_due_at timestamptz NOT NULL,
next_due_at timestamptz NOT NULL CHECK (next_due_at>reviewed_at),
interval_days numeric(10,3) NOT NULL CHECK (interval_days>0),
scheduler_version text NOT NULL
);


-- 6. Discovery, independent visits, badges and focus history.


CREATE TABLE course_interaction (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
course_id uuid NOT NULL REFERENCES course(id),
type_id uuid NOT NULL REFERENCES course_interaction_type(id),
created_at timestamptz NOT NULL DEFAULT now(),
context_json jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(context_json)='object')
);


CREATE TABLE user_course_preference (
user_id uuid NOT NULL REFERENCES app_user(id),
course_id uuid NOT NULL REFERENCES course(id),
is_saved boolean NOT NULL DEFAULT false,
is_dismissed boolean NOT NULL DEFAULT false,
deferred_until timestamptz,
updated_at timestamptz NOT NULL DEFAULT now(),
PRIMARY KEY(user_id,course_id)
);


CREATE TABLE focus_session (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
enrollment_id uuid,
started_at timestamptz NOT NULL DEFAULT now(),
ended_at timestamptz,
active_seconds integer NOT NULL DEFAULT 0 CHECK (active_seconds>=0),
CHECK (ended_at>=started_at),
FOREIGN KEY(enrollment_id,user_id) REFERENCES enrollment(id,user_id),
CHECK (ended_at IS NULL OR active_seconds<=extract(epoch FROM ended_at-started_at))
);


CREATE TABLE badge (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(160) NOT NULL UNIQUE,
description text,
icon_url text,
country_id uuid REFERENCES country(id)
);


CREATE TABLE user_badge (
user_id uuid NOT NULL REFERENCES app_user(id),
badge_id uuid NOT NULL REFERENCES badge(id),
earned_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,badge_id)
);


CREATE TABLE nfc_visit (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
nfc_tag_id uuid NOT NULL,
place_id uuid NOT NULL,
visited_at timestamptz NOT NULL DEFAULT now(),
verification_json jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(verification_json)='object'),
UNIQUE(id,user_id,place_id),
FOREIGN KEY(nfc_tag_id,place_id) REFERENCES nfc_tag(id,place_id)
);


CREATE TABLE nfc_visit_reward (
user_id uuid NOT NULL REFERENCES app_user(id),
place_id uuid NOT NULL REFERENCES place(id),
visit_id uuid NOT NULL UNIQUE,
transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
amount bigint NOT NULL CHECK (amount>=0),
PRIMARY KEY(user_id,place_id),
FOREIGN KEY(visit_id,user_id,place_id) REFERENCES nfc_visit(id,user_id,place_id),
CHECK ((amount=0 AND transaction_id IS NULL) OR (amount>0 AND transaction_id IS NOT NULL))
);


-- 7. Generation, provenance, editorial records and flexible embeddings.


CREATE TABLE generation_job (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
status_id uuid NOT NULL DEFAULT '5079f1e3-f30d-553a-90d9-95af7aa93f1a' REFERENCES generation_status(id),
idempotency_key text NOT NULL,
request_json jsonb NOT NULL CHECK (jsonb_typeof(request_json)='object'),
requested_visibility_id uuid NOT NULL DEFAULT 'e3a2ac10-28f9-5101-b32e-b2e70aecfaff' REFERENCES visibility(id),
reservation_id uuid UNIQUE REFERENCES wallet_reservation(id),
fee_transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
fee_coins bigint NOT NULL CHECK (fee_coins>=0),
model_name text,
prompt_version text,
provider_request_id text,
input_tokens bigint CHECK (input_tokens>=0),
output_tokens bigint CHECK (output_tokens>=0),
provider_cost numeric(18,8) CHECK (provider_cost>=0),
provider_cost_currency char(3),
result_course_id uuid REFERENCES course(id),
result_course_version_id uuid,
error_code text,
created_at timestamptz NOT NULL DEFAULT now(),
started_at timestamptz,
finished_at timestamptz,
UNIQUE(user_id,idempotency_key), UNIQUE(result_course_id),
FOREIGN KEY(result_course_version_id,result_course_id) REFERENCES course_version(id,course_id),
CHECK (result_course_version_id IS NULL OR result_course_id IS NOT NULL),
CHECK (started_at>=created_at), CHECK(finished_at>=started_at),
CHECK ((fee_coins=0 AND reservation_id IS NULL AND fee_transaction_id IS NULL) OR
       (fee_coins>0 AND reservation_id IS NOT NULL))
);


CREATE TABLE generation_job_source (
job_id uuid NOT NULL REFERENCES generation_job(id),
material_id uuid NOT NULL REFERENCES source_material(id), PRIMARY KEY(job_id,material_id)
);


CREATE TABLE course_review (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
course_version_id uuid NOT NULL REFERENCES course_version(id),
reviewer_id uuid NOT NULL REFERENCES app_user(id),
field_id uuid REFERENCES field(id),
decision_id uuid NOT NULL REFERENCES review_decision(id),
notes text,
change_summary_json jsonb,
created_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE expert_contribution_reward (
review_id uuid PRIMARY KEY NOT NULL REFERENCES course_review(id),
transaction_id uuid NOT NULL UNIQUE REFERENCES wallet_transaction(id),
amount bigint NOT NULL CHECK(amount>0)
);


CREATE TABLE content_report (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
reporter_id uuid NOT NULL REFERENCES app_user(id),
course_version_id uuid NOT NULL REFERENCES course_version(id),
lesson_id uuid,
question_id uuid REFERENCES question(id),
reason text NOT NULL,
status_id uuid NOT NULL DEFAULT 'e1e28ea8-6f7a-5a82-90d7-9c1ec99362f6' REFERENCES report_status(id),
resolved_by uuid REFERENCES app_user(id),
resolution_note text,
created_at timestamptz NOT NULL DEFAULT now(),
resolved_at timestamptz CHECK (resolved_at>=created_at),
FOREIGN KEY(lesson_id,course_version_id) REFERENCES lesson(id,course_version_id)
);


CREATE TABLE audit_event (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
actor_id uuid REFERENCES app_user(id),
entity_type varchar(80) NOT NULL,
entity_id uuid,
action varchar(80) NOT NULL,
details_json jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE embedding_model (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(160) NOT NULL UNIQUE,
provider varchar(80) NOT NULL,
model_name text NOT NULL,
dimensions integer NOT NULL CHECK(dimensions>0 AND dimensions<=16000),
distance_metric varchar(12) NOT NULL DEFAULT 'COSINE' CHECK(distance_metric IN ('COSINE','L2','INNER_PRODUCT')),
created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(provider,model_name,dimensions)
);


CREATE TABLE course_version_embedding (
course_version_id uuid NOT NULL REFERENCES course_version(id),
embedding_model_id uuid NOT NULL REFERENCES embedding_model(id),
embedding vector NOT NULL,
content_hash char(64) NOT NULL CHECK(content_hash ~ '^[0-9a-f]{64}$'),
embedded_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(course_version_id,embedding_model_id)
);


CREATE TABLE source_chunk_embedding (
source_chunk_id uuid NOT NULL REFERENCES source_chunk(id),
embedding_model_id uuid NOT NULL REFERENCES embedding_model(id),
embedding vector NOT NULL,
content_hash char(64) NOT NULL CHECK(content_hash ~ '^[0-9a-f]{64}$'),
embedded_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(source_chunk_id,embedding_model_id)
);


CREATE TABLE lesson_chunk_embedding (
lesson_chunk_id uuid NOT NULL REFERENCES lesson_chunk(id),
embedding_model_id uuid NOT NULL REFERENCES embedding_model(id),
embedding vector NOT NULL,
content_hash char(64) NOT NULL CHECK(content_hash ~ '^[0-9a-f]{64}$'),
embedded_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(lesson_chunk_id,embedding_model_id)
);


-- No model or dimensionality is guessed, and no approximate vector index is created.
-- After choosing a model, add a model-filtered expression HNSW index with a
-- fixed vector(N) cast and an operator class matching its distance metric.
-- Private source chunks and public lesson chunks are deliberately separate.
-- Retrieval must authorize source ownership/grants before returning passages.


-- 8. Friends, events, optional cosmetics and merchant offers.


CREATE TABLE friendship (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
requester_id uuid NOT NULL REFERENCES app_user(id),
addressee_id uuid NOT NULL REFERENCES app_user(id),
friendship_status_id uuid NOT NULL DEFAULT '083f8160-cb30-54c4-9839-900c3ee65c68' REFERENCES friendship_status(id),
created_at timestamptz NOT NULL DEFAULT now(),
responded_at timestamptz CHECK(responded_at>=created_at),
CHECK(requester_id<>addressee_id)
);


CREATE UNIQUE INDEX uq_friendship_pair ON friendship (least(requester_id,addressee_id),greatest(requester_id,addressee_id));


CREATE TABLE user_block (
user_id uuid NOT NULL REFERENCES app_user(id),
blocked_user_id uuid NOT NULL REFERENCES app_user(id),
created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,blocked_user_id), CHECK(user_id<>blocked_user_id)
);


CREATE TABLE event (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
name varchar(220) NOT NULL,
description text,
organizer_id uuid REFERENCES app_user(id),
field_id uuid REFERENCES field(id),
country_id uuid REFERENCES country(id),
place_id uuid REFERENCES place(id),
online_url text,
external_registration_url text,
starts_at timestamptz NOT NULL,
ends_at timestamptz NOT NULL CHECK(ends_at>starts_at),
timezone varchar(80) NOT NULL DEFAULT 'UTC',
capacity integer CHECK(capacity>=0),
is_free boolean NOT NULL DEFAULT true,
status_id uuid NOT NULL DEFAULT '7d68ee58-6327-5512-a0a0-e7fab2f3e0e2' REFERENCES event_status(id),
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE event_saved (
event_id uuid NOT NULL REFERENCES event(id),
user_id uuid NOT NULL REFERENCES app_user(id), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(event_id,user_id)
);


CREATE TABLE event_participant (
event_id uuid NOT NULL REFERENCES event(id),
user_id uuid NOT NULL REFERENCES app_user(id),
external_registration_reference text,
created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(event_id,user_id)
);


-- Saving an event does not register a learner or reserve a seat.


CREATE TABLE cosmetic (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(), label varchar(160) NOT NULL UNIQUE,
asset_id uuid REFERENCES media_asset(id),
price_coins bigint NOT NULL CHECK(price_coins>=0),
archived_at timestamptz
);


CREATE TABLE user_cosmetic (
user_id uuid NOT NULL REFERENCES app_user(id),
cosmetic_id uuid NOT NULL REFERENCES cosmetic(id),
transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
paid_coins bigint NOT NULL DEFAULT 0 CHECK(paid_coins>=0),
acquired_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,cosmetic_id)
);


CREATE TABLE merchant (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
operator_id uuid NOT NULL REFERENCES app_user(id),
name varchar(220) NOT NULL,
place_id uuid REFERENCES place(id), archived_at timestamptz
);


CREATE TABLE merchant_offer (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
merchant_id uuid NOT NULL REFERENCES merchant(id),
title varchar(220) NOT NULL,
description text,
price_coins bigint NOT NULL CHECK(price_coins>0),
starts_at timestamptz NOT NULL,
ends_at timestamptz NOT NULL CHECK(ends_at>starts_at),
total_quantity integer CHECK(total_quantity>=0),
remaining_quantity integer CHECK(remaining_quantity>=0),
per_user_limit integer NOT NULL DEFAULT 1 CHECK(per_user_limit>0),
archived_at timestamptz,
CHECK((total_quantity IS NULL AND remaining_quantity IS NULL) OR
      (total_quantity IS NOT NULL AND remaining_quantity IS NOT NULL AND remaining_quantity<=total_quantity))
);


CREATE TABLE merchant_offer_badge (
offer_id uuid NOT NULL REFERENCES merchant_offer(id),
badge_id uuid NOT NULL REFERENCES badge(id), PRIMARY KEY(offer_id,badge_id)
);


CREATE TABLE merchant_offer_place (
offer_id uuid NOT NULL REFERENCES merchant_offer(id),
place_id uuid NOT NULL REFERENCES place(id), PRIMARY KEY(offer_id,place_id)
);


CREATE TABLE merchant_redemption (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
offer_id uuid NOT NULL REFERENCES merchant_offer(id),
user_id uuid NOT NULL REFERENCES app_user(id),
idempotency_key text NOT NULL,
token_hash text NOT NULL UNIQUE,
reservation_id uuid NOT NULL UNIQUE REFERENCES wallet_reservation(id),
transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
price_coins bigint NOT NULL CHECK(price_coins>0),
status_id uuid NOT NULL DEFAULT '692c45ae-2883-588d-89b0-6545ab90a2f6' REFERENCES redemption_status(id),
created_at timestamptz NOT NULL DEFAULT now(),
expires_at timestamptz NOT NULL CHECK(expires_at>created_at),
redeemed_at timestamptz,
confirmed_by uuid REFERENCES app_user(id),
UNIQUE(user_id,idempotency_key),
CHECK ((status_id='d15a0f52-0282-5bfb-a5f1-b1a687a41104' AND transaction_id IS NOT NULL
        AND redeemed_at IS NOT NULL AND confirmed_by IS NOT NULL) OR
       (status_id<>'d15a0f52-0282-5bfb-a5f1-b1a687a41104' AND transaction_id IS NULL
        AND redeemed_at IS NULL AND confirmed_by IS NULL))
);


-- 9. Database integrity and transactional helpers.


CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER tr_user_updated BEFORE UPDATE ON app_user FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_course_updated BEFORE UPDATE ON course FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_event_updated BEFORE UPDATE ON event FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_preference_updated BEFORE UPDATE ON user_course_preference FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE FUNCTION deny_history_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION '% records are retained and immutable',TG_TABLE_NAME; END $$;
CREATE TRIGGER tr_ledger_immutable BEFORE UPDATE OR DELETE ON wallet_transaction FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_completion_immutable BEFORE UPDATE OR DELETE ON course_completion FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_completion_result_immutable BEFORE UPDATE OR DELETE ON course_completion_quiz_result FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_completion_reward_immutable BEFORE UPDATE OR DELETE ON course_completion_reward FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_entitlement_immutable BEFORE UPDATE OR DELETE ON course_entitlement FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_revision_event_immutable BEFORE UPDATE OR DELETE ON question_revision_event FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_visit_reward_immutable BEFORE UPDATE OR DELETE ON nfc_visit_reward FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_audit_immutable BEFORE UPDATE OR DELETE ON audit_event FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_source_chunk_immutable BEFORE UPDATE OR DELETE ON source_chunk FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_nfc_visit_immutable BEFORE UPDATE OR DELETE ON nfc_visit FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_review_immutable BEFORE UPDATE OR DELETE ON course_review FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_expert_reward_immutable BEFORE UPDATE OR DELETE ON expert_contribution_reward FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_generation_retained BEFORE DELETE ON generation_job FOR EACH ROW EXECUTE FUNCTION deny_history_change();
CREATE TRIGGER tr_course_archive BEFORE DELETE ON course FOR EACH ROW EXECUTE FUNCTION deny_history_change();

CREATE FUNCTION create_user_wallet() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN INSERT INTO wallet(user_id) VALUES(NEW.id); RETURN NEW; END $$;
CREATE TRIGGER tr_user_wallet AFTER INSERT ON app_user FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

CREATE FUNCTION guard_wallet_balance() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' AND NEW.balance<>0 THEN RAISE EXCEPTION 'Initial wallet balance must be zero; credit the ledger'; END IF;
 IF TG_OP='UPDATE' AND NEW.balance<>OLD.balance AND pg_trigger_depth()<=1 THEN
  RAISE EXCEPTION 'Wallet balance changes must originate from the ledger';
 END IF;
 IF TG_OP='UPDATE' AND (NEW.id,NEW.user_id) IS DISTINCT FROM (OLD.id,OLD.user_id) THEN
  RAISE EXCEPTION 'Wallet identity cannot change';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_wallet_balance BEFORE INSERT OR UPDATE ON wallet FOR EACH ROW EXECUTE FUNCTION guard_wallet_balance();

CREATE FUNCTION guard_reservation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE held numeric; funds bigint;
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Reservations are retained; release or expire them'; END IF;
 SELECT balance INTO funds FROM wallet WHERE id=NEW.wallet_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown reservation wallet'; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.status_id<>'1cd2ee2f-16c3-576d-ac11-7655a065dd2d' OR NEW.expires_at<=now() THEN
   RAISE EXCEPTION 'New reservation must be active and unexpired';
  END IF;
  UPDATE wallet_reservation SET status_id='35d65bf6-2670-5ba0-b4b9-6bb8552650ea',closed_at=now()
   WHERE wallet_id=NEW.wallet_id AND status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d' AND expires_at<=now();
  SELECT coalesce(sum(amount),0) INTO held FROM wallet_reservation
   WHERE wallet_id=NEW.wallet_id AND status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d';
  IF NEW.amount>funds-held THEN RAISE EXCEPTION 'Insufficient available coins'; END IF;
 ELSE
  IF (NEW.id,NEW.wallet_id,NEW.amount,NEW.idempotency_key,NEW.created_at,NEW.expires_at)
    IS DISTINCT FROM (OLD.id,OLD.wallet_id,OLD.amount,OLD.idempotency_key,OLD.created_at,OLD.expires_at) THEN
   RAISE EXCEPTION 'Reservation identity, amount and deadline cannot change';
  END IF;
  IF NEW IS NOT DISTINCT FROM OLD THEN RETURN NEW; END IF;
  IF OLD.status_id<>'1cd2ee2f-16c3-576d-ac11-7655a065dd2d' OR NEW.status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d' THEN
   RAISE EXCEPTION 'Closed reservations cannot change or reopen';
  END IF;
  IF NEW.status_id='35d65bf6-2670-5ba0-b4b9-6bb8552650ea' AND NEW.expires_at>now() THEN
   RAISE EXCEPTION 'Reservation deadline has not expired';
  END IF;
  NEW.closed_at:=now();
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_reservation BEFORE INSERT OR UPDATE OR DELETE ON wallet_reservation FOR EACH ROW EXECUTE FUNCTION guard_reservation();

CREATE FUNCTION check_reservation_capture() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE current_state uuid; tx_count integer;
BEGIN
 SELECT status_id INTO current_state FROM wallet_reservation WHERE id=NEW.id;
 SELECT count(*) INTO tx_count FROM wallet_transaction WHERE reservation_id=NEW.id;
 IF (current_state='5321bc8d-f8c3-50a5-84d3-3bf9cabf2389' AND tx_count<>1)
  OR (current_state<>'5321bc8d-f8c3-50a5-84d3-3bf9cabf2389' AND tx_count<>0) THEN
  RAISE EXCEPTION 'A captured reservation requires exactly one debit transaction';
 END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER tr_reservation_capture AFTER INSERT OR UPDATE ON wallet_reservation
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_reservation_capture();

CREATE FUNCTION post_ledger_row() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE funds bigint; held numeric; r wallet_reservation%ROWTYPE; kind text; original wallet_transaction%ROWTYPE;
BEGIN
 -- Check conflicts before side effects: INSERT ... ON CONFLICT must not double-adjust balances.
 PERFORM pg_advisory_xact_lock(hashtextextended('ledger:'||NEW.id::text,0));
 SELECT balance INTO funds FROM wallet WHERE id=NEW.wallet_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown wallet'; END IF;
 IF EXISTS(SELECT 1 FROM wallet_transaction WHERE id=NEW.id OR
   (wallet_id=NEW.wallet_id AND idempotency_key=NEW.idempotency_key)) THEN
  RAISE unique_violation USING MESSAGE='Duplicate ledger ID/idempotency key; return the existing transaction';
 END IF;
 SELECT label INTO kind FROM wallet_transaction_type WHERE id=NEW.type_id;
 IF kind IS NULL THEN RAISE EXCEPTION 'Unknown ledger reason'; END IF;
 IF kind IN ('COURSE_PURCHASE','GENERATION_FEE','MERCHANT_REDEMPTION','COSMETIC_PURCHASE') AND NEW.amount>=0 THEN
  RAISE EXCEPTION 'Purchase/fee transactions must debit coins';
 END IF;
 IF kind IN ('COURSE_COMPLETION','NFC_VISIT','EXPERT_CONTRIBUTION','REFUND') AND NEW.amount<=0 THEN
  RAISE EXCEPTION 'Reward/refund transactions must credit coins';
 END IF;
 IF kind='REFUND' THEN
  SELECT * INTO original FROM wallet_transaction WHERE id=NEW.reverses_transaction_id AND wallet_id=NEW.wallet_id;
  IF NOT FOUND OR original.amount>=0 OR NEW.amount<>-original.amount THEN
   RAISE EXCEPTION 'Refund must reverse a complete debit from this wallet';
  END IF;
  IF EXISTS(SELECT 1 FROM wallet_transaction WHERE reverses_transaction_id=NEW.reverses_transaction_id) THEN
   RAISE unique_violation USING MESSAGE='This debit has already been refunded';
  END IF;
 ELSIF NEW.reverses_transaction_id IS NOT NULL THEN RAISE EXCEPTION 'Only a refund references a reversed debit';
 END IF;
 UPDATE wallet_reservation SET status_id='35d65bf6-2670-5ba0-b4b9-6bb8552650ea',closed_at=now()
  WHERE wallet_id=NEW.wallet_id AND status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d' AND expires_at<=now();
 IF NEW.reservation_id IS NOT NULL THEN
  SELECT * INTO r FROM wallet_reservation WHERE id=NEW.reservation_id AND wallet_id=NEW.wallet_id FOR UPDATE;
  IF NOT FOUND OR r.status_id<>'1cd2ee2f-16c3-576d-ac11-7655a065dd2d' OR r.expires_at<=now() OR NEW.amount<>-r.amount THEN
   RAISE EXCEPTION 'Capture must match an active, unexpired reservation exactly';
  END IF;
  UPDATE wallet_reservation SET status_id='5321bc8d-f8c3-50a5-84d3-3bf9cabf2389',closed_at=now() WHERE id=r.id;
 END IF;
 SELECT coalesce(sum(amount),0) INTO held FROM wallet_reservation
  WHERE wallet_id=NEW.wallet_id AND status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d';
 IF funds+NEW.amount<held THEN RAISE EXCEPTION 'Insufficient available coins'; END IF;
 NEW.created_at:=now();
 UPDATE wallet SET balance=balance+NEW.amount WHERE id=NEW.wallet_id;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_post_ledger BEFORE INSERT ON wallet_transaction FOR EACH ROW EXECUTE FUNCTION post_ledger_row();

CREATE FUNCTION require_financial_link(p_transaction uuid,p_user uuid,p_amount bigint,p_kind text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
 IF p_amount=0 AND p_transaction IS NULL THEN RETURN; END IF;
 IF p_transaction IS NULL OR NOT EXISTS(
  SELECT 1 FROM wallet_transaction t JOIN wallet w ON w.id=t.wallet_id
  JOIN wallet_transaction_type k ON k.id=t.type_id
  WHERE t.id=p_transaction AND w.user_id=p_user AND t.amount=p_amount AND k.label=p_kind
 ) THEN RAISE EXCEPTION 'Transaction does not match user, amount or reason (%)',p_kind; END IF;
END $$;

CREATE FUNCTION guard_entitlement() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c course%ROWTYPE;
BEGIN
 SELECT * INTO c FROM course WHERE id=NEW.course_id FOR SHARE;
 IF NOT FOUND OR c.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Cannot acquire an archived or missing course'; END IF;
 IF c.visibility_id='10ef7cf4-6aac-5ebe-9a5f-06bdffe17543' AND c.creator_id<>NEW.user_id THEN
  RAISE EXCEPTION 'New private-course access is restricted to its creator';
 END IF;
 NEW.promised_reward_coins:=c.reward_coins;
 IF NEW.acquisition_kind='PURCHASE' THEN
  IF NEW.paid_coins<>c.price_coins OR NEW.paid_coins<=0 THEN RAISE EXCEPTION 'Purchase must match the current course price'; END IF;
  PERFORM require_financial_link(NEW.acquisition_transaction_id,NEW.user_id,-NEW.paid_coins,'COURSE_PURCHASE');
 ELSIF NEW.acquisition_kind='GENERATION' THEN
  IF NEW.user_id<>c.creator_id THEN RAISE EXCEPTION 'Generation access belongs to its creator'; END IF;
  PERFORM require_financial_link(NEW.acquisition_transaction_id,NEW.user_id,-NEW.paid_coins,'GENERATION_FEE');
 ELSIF NEW.paid_coins<>0 OR NEW.acquisition_transaction_id IS NOT NULL THEN
  RAISE EXCEPTION 'Free/granted entitlements cannot have a debit';
 ELSIF NEW.acquisition_kind='FREE' AND c.price_coins<>0 THEN RAISE EXCEPTION 'This course is not free';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_entitlement BEFORE INSERT ON course_entitlement FOR EACH ROW EXECUTE FUNCTION guard_entitlement();

CREATE FUNCTION version_for_content(p_table text,p_row jsonb) RETURNS uuid LANGUAGE plpgsql STABLE AS $$
DECLARE v uuid;
BEGIN
 IF p_row IS NULL THEN RETURN NULL; END IF;
 IF p_row ? 'course_version_id' THEN RETURN (p_row->>'course_version_id')::uuid; END IF;
 IF p_table IN ('lesson_asset','lesson_chunk') THEN
  SELECT course_version_id INTO v FROM lesson WHERE id=(p_row->>'lesson_id')::uuid;
 ELSIF p_table='question' THEN
  SELECT course_version_id INTO v FROM quiz WHERE id=(p_row->>'quiz_id')::uuid;
 ELSIF p_table IN ('answer_option','question_concept') THEN
  SELECT z.course_version_id INTO v FROM question q JOIN quiz z ON z.id=q.quiz_id
   WHERE q.id=(p_row->>'question_id')::uuid;
 END IF;
 RETURN v;
END $$;

CREATE FUNCTION guard_versioned_content() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE old_v uuid; new_v uuid; v uuid; published timestamptz;
BEGIN
 IF TG_OP<>'INSERT' THEN old_v:=version_for_content(TG_TABLE_NAME,to_jsonb(OLD)); END IF;
 IF TG_OP<>'DELETE' THEN new_v:=version_for_content(TG_TABLE_NAME,to_jsonb(NEW)); END IF;
 FOR v IN SELECT DISTINCT x FROM unnest(ARRAY[old_v,new_v]) x WHERE x IS NOT NULL ORDER BY x LOOP
  SELECT published_at INTO published FROM course_version WHERE id=v FOR UPDATE;
  IF published IS NOT NULL THEN RAISE EXCEPTION 'Published content is immutable; create a new course version'; END IF;
 END LOOP;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_lesson_content BEFORE INSERT OR UPDATE OR DELETE ON lesson FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_quiz_content BEFORE INSERT OR UPDATE OR DELETE ON quiz FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_question_content BEFORE INSERT OR UPDATE OR DELETE ON question FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_option_content BEFORE INSERT OR UPDATE OR DELETE ON answer_option FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_lesson_assets BEFORE INSERT OR UPDATE OR DELETE ON lesson_asset FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_lesson_chunks BEFORE INSERT OR UPDATE OR DELETE ON lesson_chunk FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_question_concepts BEFORE INSERT OR UPDATE OR DELETE ON question_concept FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_version_concepts BEFORE INSERT OR UPDATE OR DELETE ON course_version_concept FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();
CREATE TRIGGER tr_version_sources BEFORE INSERT OR UPDATE OR DELETE ON course_version_source FOR EACH ROW EXECUTE FUNCTION guard_versioned_content();

CREATE FUNCTION guard_course_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  IF OLD.published_at IS NOT NULL THEN RAISE EXCEPTION 'Published versions are retained'; END IF;
  RETURN OLD;
 END IF;
 IF TG_OP='UPDATE' AND OLD.published_at IS NOT NULL THEN
  IF (to_jsonb(NEW)-'publication_status_id') IS DISTINCT FROM (to_jsonb(OLD)-'publication_status_id') THEN
   RAISE EXCEPTION 'Published version content and publication timestamp cannot change';
  END IF;
  IF NEW.publication_status_id='9c74f449-1cb8-5745-a7f4-6cc7ef718481' THEN RAISE EXCEPTION 'A published version cannot become a draft'; END IF;
 END IF;
 IF NEW.publication_status_id='6a79ff2b-726c-5c04-ac20-f207f66b4094' AND (TG_OP='INSERT' OR OLD.published_at IS NULL) THEN
  RAISE EXCEPTION 'A draft cannot be withdrawn before publication';
 END IF;
 IF NEW.publication_status_id='aa7192b0-4b5d-5230-b311-25aa6b0e59ff' AND (TG_OP='INSERT' OR OLD.published_at IS NULL) THEN
  IF TG_OP='INSERT' THEN RAISE EXCEPTION 'Create the draft and its content before publishing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM lesson WHERE course_version_id=NEW.id) THEN RAISE EXCEPTION 'A course needs at least one lesson'; END IF;
  IF NOT EXISTS(SELECT 1 FROM quiz WHERE course_version_id=NEW.id AND lesson_id IS NULL) THEN RAISE EXCEPTION 'A course needs its final quiz'; END IF;
  IF EXISTS(SELECT 1 FROM lesson l WHERE l.course_version_id=NEW.id AND NOT EXISTS(SELECT 1 FROM quiz q WHERE q.lesson_id=l.id)) THEN
   RAISE EXCEPTION 'Every lesson needs a quiz';
  END IF;
  IF EXISTS(SELECT 1 FROM quiz q WHERE q.course_version_id=NEW.id AND NOT EXISTS(SELECT 1 FROM question x WHERE x.quiz_id=q.id)) THEN
   RAISE EXCEPTION 'Every quiz needs questions';
  END IF;
  IF EXISTS(SELECT 1 FROM question q JOIN quiz z ON z.id=q.quiz_id WHERE z.course_version_id=NEW.id AND
   ((q.question_type_id IN(1,2,3) AND (SELECT count(*) FROM answer_option a WHERE a.question_id=q.id)<2)
    OR (q.question_type_id IN(1,3) AND (SELECT count(*) FROM answer_option a WHERE a.question_id=q.id AND a.is_correct)<>1)
    OR (q.question_type_id=3 AND (SELECT count(*) FROM answer_option a WHERE a.question_id=q.id)<>2)
    OR (q.question_type_id=2 AND NOT EXISTS(SELECT 1 FROM answer_option a WHERE a.question_id=q.id AND a.is_correct)))) THEN
   RAISE EXCEPTION 'Choice questions need valid options and correct answers';
  END IF;
  NEW.published_at:=now();
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_course_version BEFORE INSERT OR UPDATE OR DELETE ON course_version FOR EACH ROW EXECUTE FUNCTION guard_course_version();

CREATE FUNCTION guard_current_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.current_published_version_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM course_version
  WHERE id=NEW.current_published_version_id AND course_id=NEW.id AND publication_status_id='aa7192b0-4b5d-5230-b311-25aa6b0e59ff') THEN
  RAISE EXCEPTION 'Current catalogue version must be a published version of this course';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_current_version BEFORE INSERT OR UPDATE OF current_published_version_id ON course FOR EACH ROW EXECUTE FUNCTION guard_current_version();
CREATE FUNCTION remove_withdrawn_version_from_catalogue() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.publication_status_id='6a79ff2b-726c-5c04-ac20-f207f66b4094' THEN
  UPDATE course SET current_published_version_id=NULL WHERE current_published_version_id=NEW.id;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_withdrawn_version AFTER UPDATE OF publication_status_id ON course_version FOR EACH ROW EXECUTE FUNCTION remove_withdrawn_version_from_catalogue();

CREATE FUNCTION guard_enrollment() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Enrollment history is retained'; END IF;
 IF NOT EXISTS(SELECT 1 FROM course_version WHERE id=NEW.course_version_id AND published_at IS NOT NULL) THEN
  RAISE EXCEPTION 'Enrollments reference published content, not drafts';
 END IF;
 IF TG_OP='UPDATE' THEN
  IF (NEW.id,NEW.entitlement_id,NEW.user_id,NEW.course_id,NEW.course_version_id,NEW.enrolled_at)
    IS DISTINCT FROM (OLD.id,OLD.entitlement_id,OLD.user_id,OLD.course_id,OLD.course_version_id,OLD.enrolled_at) THEN
   RAISE EXCEPTION 'Enrollment identity cannot change';
  END IF;
  IF OLD.first_opened_at IS NOT NULL AND NEW.first_opened_at IS DISTINCT FROM OLD.first_opened_at THEN RAISE EXCEPTION 'First-open timestamp cannot reset'; END IF;
  IF OLD.completed_at IS NOT NULL AND NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN RAISE EXCEPTION 'First-completion timestamp cannot reset'; END IF;
 END IF;
 IF NEW.completed_at IS NOT NULL THEN
  IF NOT EXISTS(SELECT 1 FROM course_completion WHERE enrollment_id=NEW.id AND completed_at=NEW.completed_at) THEN
   RAISE EXCEPTION 'Only a validated course completion sets completed_at';
  END IF;
  NEW.status_id:='5bcd61ef-8dc7-53af-bc13-ee46134bbcc6';
 ELSIF NEW.first_opened_at IS NOT NULL THEN
  IF TG_OP='INSERT' OR OLD.first_opened_at IS NULL THEN NEW.first_opened_at:=now(); END IF;
  NEW.status_id:='fdb32e85-e734-5588-95c5-05a95c04ae49';
 ELSE NEW.status_id:='ebb792f8-19ba-5fd7-aebe-726b1a3071d2';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_enrollment BEFORE INSERT OR UPDATE OR DELETE ON enrollment FOR EACH ROW EXECUTE FUNCTION guard_enrollment();
CREATE FUNCTION open_enrollment(p_enrollment uuid) RETURNS timestamptz LANGUAGE plpgsql AS $$
DECLARE t timestamptz;
BEGIN
 UPDATE enrollment SET first_opened_at=coalesce(first_opened_at,now()) WHERE id=p_enrollment RETURNING first_opened_at INTO t;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown enrollment'; END IF;
 RETURN t;
END $$;

CREATE FUNCTION guard_question_response() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE a quiz_attempt%ROWTYPE; possible numeric;
BEGIN
 SELECT * INTO a FROM quiz_attempt WHERE id=CASE WHEN TG_OP='DELETE' THEN OLD.attempt_id ELSE NEW.attempt_id END FOR UPDATE;
 IF NOT FOUND OR a.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'Responses require an open attempt'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 IF TG_OP='UPDATE' AND (NEW.attempt_id,NEW.question_id) IS DISTINCT FROM (OLD.attempt_id,OLD.question_id) THEN
  RAISE EXCEPTION 'Response identity cannot change';
 END IF;
 SELECT points INTO possible FROM question WHERE id=NEW.question_id AND quiz_id=a.quiz_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Response question is outside the attempted quiz'; END IF;
 NEW.quiz_id:=a.quiz_id;
 NEW.possible_points:=possible;
 NEW.earned_points:=CASE WHEN NEW.is_correct THEN possible ELSE 0 END;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_question_response BEFORE INSERT OR UPDATE OR DELETE ON question_response FOR EACH ROW EXECUTE FUNCTION guard_question_response();

CREATE FUNCTION guard_quiz_attempt() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE opened timestamptz; question_count integer; response_count integer; earned numeric; possible numeric;
BEGIN
 IF TG_OP='DELETE' THEN
  IF OLD.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'Submitted attempts are immutable'; END IF;
  RETURN OLD;
 END IF;
 SELECT first_opened_at INTO opened FROM enrollment WHERE id=NEW.enrollment_id FOR UPDATE;
 IF opened IS NULL THEN RAISE EXCEPTION 'Open enrolled course content before attempting its quizzes'; END IF;
 IF TG_OP='UPDATE' THEN
  IF OLD.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'Submitted attempts are immutable'; END IF;
  IF (NEW.id,NEW.enrollment_id,NEW.course_version_id,NEW.quiz_id,NEW.attempt_number,NEW.started_at)
   IS DISTINCT FROM (OLD.id,OLD.enrollment_id,OLD.course_version_id,OLD.quiz_id,OLD.attempt_number,OLD.started_at) THEN
   RAISE EXCEPTION 'Attempt identity and start time cannot change';
  END IF;
 ELSIF NEW.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'Create the attempt, record all responses, then submit';
 END IF;
 IF TG_OP='INSERT' THEN NEW.started_at:=now(); END IF;
 IF NEW.submitted_at IS NOT NULL THEN
  SELECT count(*) INTO question_count FROM question WHERE quiz_id=NEW.quiz_id;
  SELECT count(*),sum(earned_points),sum(possible_points) INTO response_count,earned,possible FROM question_response WHERE attempt_id=NEW.id;
  IF question_count=0 OR response_count<>question_count THEN RAISE EXCEPTION 'All quiz questions must be answered before submission'; END IF;
  NEW.earned_points:=earned; NEW.possible_points:=possible; NEW.submitted_at:=now();
 ELSE NEW.earned_points:=NULL; NEW.possible_points:=NULL;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_quiz_attempt BEFORE INSERT OR UPDATE OR DELETE ON quiz_attempt FOR EACH ROW EXECUTE FUNCTION guard_quiz_attempt();

CREATE FUNCTION best_course_score(p_enrollment uuid)
RETURNS TABLE(expected_quizzes integer,completed_quizzes integer,numerator numeric,denominator numeric,quiz_ids uuid[],attempt_ids uuid[])
LANGUAGE plpgsql STABLE AS $$
DECLARE v uuid; r record; ep numeric; pp numeric; divisor numeric;
BEGIN
 SELECT course_version_id INTO v FROM enrollment WHERE id=p_enrollment;
 SELECT count(*) INTO expected_quizzes FROM quiz WHERE course_version_id=v;
 completed_quizzes:=0; numerator:=0; denominator:=1; quiz_ids:=ARRAY[]::uuid[]; attempt_ids:=ARRAY[]::uuid[];
 FOR r IN SELECT q.id AS quiz_id,a.id AS attempt_id,a.earned_points,a.possible_points
  FROM quiz q JOIN LATERAL (
   SELECT x.* FROM quiz_attempt x WHERE x.enrollment_id=p_enrollment AND x.quiz_id=q.id AND x.submitted_at IS NOT NULL
   AND NOT EXISTS(SELECT 1 FROM quiz_attempt y WHERE y.enrollment_id=x.enrollment_id AND y.quiz_id=x.quiz_id
    AND y.submitted_at IS NOT NULL AND y.earned_points*x.possible_points>x.earned_points*y.possible_points)
   ORDER BY x.submitted_at,x.id LIMIT 1
  ) a ON true WHERE q.course_version_id=v ORDER BY q.id LOOP
  ep:=r.earned_points*100; pp:=r.possible_points*100;
  numerator:=numerator*pp+ep*denominator; denominator:=denominator*pp;
  divisor:=gcd(numerator,denominator); numerator:=numerator/divisor; denominator:=denominator/divisor;
  completed_quizzes:=completed_quizzes+1;
  quiz_ids:=array_append(quiz_ids,r.quiz_id); attempt_ids:=array_append(attempt_ids,r.attempt_id);
 END LOOP;
 RETURN NEXT;
END $$;

CREATE FUNCTION validate_completion() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE result record;
BEGIN
 PERFORM 1 FROM enrollment WHERE id=NEW.enrollment_id FOR UPDATE;
 SELECT * INTO result FROM best_course_score(NEW.enrollment_id);
 IF result.expected_quizzes=0 OR result.completed_quizzes<>result.expected_quizzes
  OR result.numerator*5<result.denominator*4*result.expected_quizzes THEN
  RAISE EXCEPTION 'Completion requires all quizzes and an equal-weight average of at least 80 percent';
 END IF;
 NEW.completed_at:=now(); NEW.quiz_count:=result.expected_quizzes;
 NEW.score_sum_numerator:=result.numerator; NEW.score_sum_denominator:=result.denominator;
 NEW.aggregate_percentage:=round(result.numerator*100/result.denominator/result.expected_quizzes,8);
 RETURN NEW;
END $$;
CREATE TRIGGER tr_validate_completion BEFORE INSERT ON course_completion FOR EACH ROW EXECUTE FUNCTION validate_completion();

CREATE FUNCTION validate_completion_result() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM course_completion c JOIN enrollment e ON e.id=c.enrollment_id
  JOIN quiz_attempt a ON a.enrollment_id=e.id
  WHERE c.id=NEW.completion_id AND a.id=NEW.attempt_id AND a.quiz_id=NEW.quiz_id AND a.submitted_at IS NOT NULL) THEN
  RAISE EXCEPTION 'Completion evidence must come from the completed enrollment';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_completion_result BEFORE INSERT ON course_completion_quiz_result FOR EACH ROW EXECUTE FUNCTION validate_completion_result();

CREATE FUNCTION validate_completion_reward() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE e enrollment%ROWTYPE; promised bigint;
BEGIN
 SELECT en.* INTO e FROM course_completion c JOIN enrollment en ON en.id=c.enrollment_id WHERE c.id=NEW.completion_id;
 SELECT promised_reward_coins INTO promised FROM course_entitlement WHERE id=e.entitlement_id;
 IF NOT FOUND OR (NEW.user_id,NEW.course_id,NEW.amount) IS DISTINCT FROM (e.user_id,e.course_id,promised) THEN
  RAISE EXCEPTION 'Completion reward must match the owner, course and promised amount';
 END IF;
 PERFORM require_financial_link(NEW.transaction_id,NEW.user_id,NEW.amount,'COURSE_COMPLETION');
 RETURN NEW;
END $$;
CREATE TRIGGER tr_validate_completion_reward BEFORE INSERT ON course_completion_reward FOR EACH ROW EXECUTE FUNCTION validate_completion_reward();

CREATE FUNCTION record_completion_effects() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE e enrollment%ROWTYPE; entitlement course_entitlement%ROWTYPE; result record; w uuid; tx uuid; i integer;
BEGIN
 SELECT * INTO e FROM enrollment WHERE id=NEW.enrollment_id FOR UPDATE;
 SELECT * INTO entitlement FROM course_entitlement WHERE id=e.entitlement_id FOR UPDATE;
 SELECT * INTO result FROM best_course_score(e.id);
 FOR i IN 1..cardinality(result.quiz_ids) LOOP
  INSERT INTO course_completion_quiz_result(completion_id,quiz_id,attempt_id)
   VALUES(NEW.id,result.quiz_ids[i],result.attempt_ids[i]);
 END LOOP;
 UPDATE enrollment SET completed_at=NEW.completed_at WHERE id=e.id;
 SELECT id INTO w FROM wallet WHERE user_id=e.user_id FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM course_completion_reward WHERE user_id=e.user_id AND course_id=e.course_id) THEN
  tx:=NULL;
  IF entitlement.promised_reward_coins>0 THEN
   INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key)
    VALUES(w,'e05e02fe-5644-5a2d-9580-68c760199f59',entitlement.promised_reward_coins,'course-completion:'||e.course_id)
    RETURNING id INTO tx;
  END IF;
  INSERT INTO course_completion_reward(user_id,course_id,completion_id,transaction_id,amount)
   VALUES(e.user_id,e.course_id,NEW.id,tx,entitlement.promised_reward_coins);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_completion_effects AFTER INSERT ON course_completion FOR EACH ROW EXECUTE FUNCTION record_completion_effects();

CREATE FUNCTION validate_revision_source() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='UPDATE' AND (NEW.id,NEW.user_id,NEW.question_id,NEW.first_incorrect_attempt_id,NEW.created_at)
  IS DISTINCT FROM (OLD.id,OLD.user_id,OLD.question_id,OLD.first_incorrect_attempt_id,OLD.created_at) THEN
  RAISE EXCEPTION 'Revision identity and first mistake cannot change';
 END IF;
 IF EXISTS(SELECT 1 FROM unnest(ARRAY[NEW.first_incorrect_attempt_id,NEW.last_incorrect_attempt_id]) a(id)
  WHERE NOT EXISTS(SELECT 1 FROM question_response r JOIN quiz_attempt q ON q.id=r.attempt_id
   JOIN enrollment e ON e.id=q.enrollment_id WHERE r.attempt_id=a.id AND r.question_id=NEW.question_id
   AND NOT r.is_correct AND q.submitted_at IS NOT NULL AND e.user_id=NEW.user_id)) THEN
  RAISE EXCEPTION 'Revision sources must be this learner''s submitted incorrect responses';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_revision_source BEFORE INSERT OR UPDATE ON question_revision FOR EACH ROW EXECUTE FUNCTION validate_revision_source();

CREATE FUNCTION after_quiz_submission() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE learner uuid; result record;
BEGIN
 IF NEW.submitted_at IS NULL OR OLD.submitted_at IS NOT NULL THEN RETURN NEW; END IF;
 SELECT user_id INTO learner FROM enrollment WHERE id=NEW.enrollment_id;
 INSERT INTO question_revision(user_id,question_id,first_incorrect_attempt_id,last_incorrect_attempt_id,next_review_at)
  SELECT learner,r.question_id,NEW.id,NEW.id,now()+interval '1 day' FROM question_response r
  WHERE r.attempt_id=NEW.id AND NOT r.is_correct
  ON CONFLICT(user_id,question_id) DO UPDATE SET last_incorrect_attempt_id=EXCLUDED.last_incorrect_attempt_id,
   next_review_at=least(question_revision.next_review_at,EXCLUDED.next_review_at);
 IF NOT EXISTS(SELECT 1 FROM course_completion WHERE enrollment_id=NEW.enrollment_id) THEN
  SELECT * INTO result FROM best_course_score(NEW.enrollment_id);
  IF result.expected_quizzes>0 AND result.completed_quizzes=result.expected_quizzes
    AND result.numerator*5>=result.denominator*4*result.expected_quizzes THEN
   INSERT INTO course_completion(enrollment_id,quiz_count,aggregate_percentage,score_sum_numerator,score_sum_denominator)
    VALUES(NEW.enrollment_id,result.expected_quizzes,80,result.numerator,result.denominator);
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_after_quiz_submission AFTER UPDATE OF submitted_at ON quiz_attempt FOR EACH ROW EXECUTE FUNCTION after_quiz_submission();

CREATE FUNCTION prepare_revision_event() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE r question_revision%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('revision-event:'||NEW.id::text,0));
 IF EXISTS(SELECT 1 FROM question_revision_event WHERE id=NEW.id) THEN
  RAISE unique_violation USING MESSAGE='Duplicate revision event ID; return the existing review';
 END IF;
 SELECT * INTO r FROM question_revision WHERE id=NEW.revision_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown revision item'; END IF;
 IF NEW.is_correct AND r.interval_days>0 AND NEW.interval_days<=r.interval_days THEN
  RAISE EXCEPTION 'Successful recall increases the review interval';
 END IF;
 NEW.reviewed_at:=now(); NEW.previous_due_at:=r.next_review_at;
 NEW.next_due_at:=NEW.reviewed_at+NEW.interval_days*interval '1 day';
 UPDATE question_revision SET last_reviewed_at=NEW.reviewed_at,next_review_at=NEW.next_due_at,
  review_count=review_count+1,lapse_count=lapse_count+CASE WHEN NEW.is_correct THEN 0 ELSE 1 END,
  interval_days=NEW.interval_days,scheduler_version=NEW.scheduler_version WHERE id=r.id;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_revision_event BEFORE INSERT ON question_revision_event FOR EACH ROW EXECUTE FUNCTION prepare_revision_event();

CREATE FUNCTION check_embedding_dimensions() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE dims integer; expected_hash text;
BEGIN
 SELECT dimensions INTO dims FROM embedding_model WHERE id=NEW.embedding_model_id;
 IF dims IS NULL OR vector_dims(NEW.embedding)<>dims THEN RAISE EXCEPTION 'Embedding dimensionality does not match its model'; END IF;
 IF TG_TABLE_NAME='source_chunk_embedding' THEN SELECT content_hash INTO expected_hash FROM source_chunk WHERE id=NEW.source_chunk_id;
 ELSIF TG_TABLE_NAME='lesson_chunk_embedding' THEN SELECT content_hash INTO expected_hash FROM lesson_chunk WHERE id=NEW.lesson_chunk_id;
 END IF;
 IF expected_hash IS NOT NULL AND NEW.content_hash<>expected_hash THEN RAISE EXCEPTION 'Embedding content hash is stale'; END IF;
 NEW.embedded_at:=now(); RETURN NEW;
END $$;
CREATE TRIGGER tr_course_embedding BEFORE INSERT OR UPDATE ON course_version_embedding FOR EACH ROW EXECUTE FUNCTION check_embedding_dimensions();
CREATE TRIGGER tr_source_embedding BEFORE INSERT OR UPDATE ON source_chunk_embedding FOR EACH ROW EXECUTE FUNCTION check_embedding_dimensions();
CREATE TRIGGER tr_lesson_embedding BEFORE INSERT OR UPDATE ON lesson_chunk_embedding FOR EACH ROW EXECUTE FUNCTION check_embedding_dimensions();
CREATE FUNCTION guard_embedding_model_dimensions() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (NEW.dimensions,NEW.provider,NEW.model_name,NEW.distance_metric) IS DISTINCT FROM (OLD.dimensions,OLD.provider,OLD.model_name,OLD.distance_metric) THEN
  RAISE EXCEPTION 'Create a new model record instead of changing embedding semantics';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_embedding_model BEFORE UPDATE ON embedding_model FOR EACH ROW EXECUTE FUNCTION guard_embedding_model_dimensions();

CREATE FUNCTION validate_report_target() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.question_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM question q JOIN quiz z ON z.id=q.quiz_id
  WHERE q.id=NEW.question_id AND z.course_version_id=NEW.course_version_id
  AND (NEW.lesson_id IS NULL OR z.lesson_id=NEW.lesson_id)) THEN
  RAISE EXCEPTION 'Reported question must belong to the reported version/lesson';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_report_target BEFORE INSERT OR UPDATE ON content_report FOR EACH ROW EXECUTE FUNCTION validate_report_target();

CREATE FUNCTION validate_visit_reward() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM require_financial_link(NEW.transaction_id,NEW.user_id,NEW.amount,'NFC_VISIT'); RETURN NEW;
END $$;
CREATE TRIGGER tr_visit_reward BEFORE INSERT ON nfc_visit_reward FOR EACH ROW EXECUTE FUNCTION validate_visit_reward();
CREATE FUNCTION award_nfc_visit(p_visit uuid,p_amount bigint) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v nfc_visit%ROWTYPE; w uuid; tx uuid;
BEGIN
 IF p_amount<0 THEN RAISE EXCEPTION 'Visit reward cannot be negative'; END IF;
 SELECT * INTO v FROM nfc_visit WHERE id=p_visit;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown visit'; END IF;
 SELECT id INTO w FROM wallet WHERE user_id=v.user_id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM nfc_visit_reward WHERE user_id=v.user_id AND place_id=v.place_id) THEN
  SELECT transaction_id INTO tx FROM nfc_visit_reward WHERE user_id=v.user_id AND place_id=v.place_id;
  RETURN tx;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM nfc_tag WHERE id=v.nfc_tag_id AND status_id='11de493d-fa1b-592e-a0a1-230dfc4565a7') THEN RAISE EXCEPTION 'Tag is inactive'; END IF;
 IF p_amount>0 THEN
  INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key)
   VALUES(w,'9b09202a-1c69-5367-b408-b22abdc67fad',p_amount,'nfc-place:'||v.place_id) RETURNING id INTO tx;
 END IF;
 INSERT INTO nfc_visit_reward(user_id,place_id,visit_id,transaction_id,amount) VALUES(v.user_id,v.place_id,v.id,tx,p_amount);
 RETURN tx;
END $$;

CREATE FUNCTION guard_generation_job() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE r wallet_reservation%ROWTYPE; owner uuid;
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.status_id<>'5079f1e3-f30d-553a-90d9-95af7aa93f1a' THEN RAISE EXCEPTION 'New generation jobs start queued'; END IF;
 ELSE
  IF OLD.status_id IN ('aa0fb318-93ae-506f-9c23-06c00114e58c','38bf7781-5f3b-5f64-9ae4-f5a09a5a9c5a','4252d822-8fc7-596c-b1c6-33bad150d696') THEN
   IF NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'Finished generation jobs are retained and immutable'; END IF;
   RETURN NEW;
  END IF;
  IF (NEW.id,NEW.user_id,NEW.idempotency_key,NEW.request_json,NEW.requested_visibility_id,NEW.reservation_id,NEW.fee_coins,NEW.created_at)
   IS DISTINCT FROM (OLD.id,OLD.user_id,OLD.idempotency_key,OLD.request_json,OLD.requested_visibility_id,OLD.reservation_id,OLD.fee_coins,OLD.created_at) THEN
   RAISE EXCEPTION 'Generation inputs, owner and fee cannot change';
  END IF;
  IF OLD.status_id='fab67e8b-7e50-59bd-a122-c659553ed2a6' AND NEW.status_id='5079f1e3-f30d-553a-90d9-95af7aa93f1a' THEN RAISE EXCEPTION 'Running jobs cannot return to the queue'; END IF;
 END IF;
 IF NEW.fee_coins>0 THEN
  SELECT * INTO r FROM wallet_reservation WHERE id=NEW.reservation_id;
  SELECT user_id INTO owner FROM wallet WHERE id=r.wallet_id;
  IF owner IS DISTINCT FROM NEW.user_id OR r.amount IS DISTINCT FROM NEW.fee_coins THEN RAISE EXCEPTION 'Generation reservation must match its owner and fee'; END IF;
 END IF;
 IF NEW.status_id='fab67e8b-7e50-59bd-a122-c659553ed2a6' AND NEW.started_at IS NULL THEN NEW.started_at:=now(); END IF;
 IF NEW.status_id='aa0fb318-93ae-506f-9c23-06c00114e58c' THEN
  IF NOT EXISTS(SELECT 1 FROM course_version v JOIN course c ON c.id=v.course_id
   WHERE v.id=NEW.result_course_version_id AND c.id=NEW.result_course_id AND c.creator_id=NEW.user_id
   AND c.visibility_id=NEW.requested_visibility_id) THEN RAISE EXCEPTION 'Generation result must match its creator, course and visibility'; END IF;
  IF EXISTS(SELECT 1 FROM course_entitlement WHERE user_id=NEW.user_id AND course_id=NEW.result_course_id) THEN RAISE EXCEPTION 'Generation result must be a newly acquired course'; END IF;
  IF NEW.fee_coins>0 THEN
   INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,reservation_id)
    VALUES(r.wallet_id,'6654b718-490c-5fda-b98e-7e3cea5c39ae',-NEW.fee_coins,'generation:'||NEW.id,r.id) RETURNING id INTO NEW.fee_transaction_id;
  END IF;
  NEW.finished_at:=now();
 ELSIF NEW.status_id IN ('38bf7781-5f3b-5f64-9ae4-f5a09a5a9c5a','4252d822-8fc7-596c-b1c6-33bad150d696') THEN
  IF NEW.fee_transaction_id IS NOT NULL THEN RAISE EXCEPTION 'Failed/cancelled generation cannot retain a final fee'; END IF;
  IF NEW.reservation_id IS NOT NULL THEN
   UPDATE wallet_reservation SET status_id='a90e35cc-f18a-5bad-bd69-912fe5d14488',closed_at=now()
    WHERE id=NEW.reservation_id AND status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d';
  END IF;
  NEW.finished_at:=now();
 ELSE
  IF NEW.fee_transaction_id IS NOT NULL OR NEW.finished_at IS NOT NULL THEN RAISE EXCEPTION 'Unfinished jobs cannot have a captured fee or finish time'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_generation_job BEFORE INSERT OR UPDATE ON generation_job FOR EACH ROW EXECUTE FUNCTION guard_generation_job();
CREATE FUNCTION grant_generated_course() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.status_id='aa0fb318-93ae-506f-9c23-06c00114e58c' AND OLD.status_id<>NEW.status_id THEN
  INSERT INTO course_entitlement(user_id,course_id,acquisition_kind,acquisition_transaction_id,paid_coins,promised_reward_coins)
   VALUES(NEW.user_id,NEW.result_course_id,'GENERATION',NEW.fee_transaction_id,NEW.fee_coins,0);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_generated_entitlement AFTER UPDATE OF status_id ON generation_job FOR EACH ROW EXECUTE FUNCTION grant_generated_course();

CREATE FUNCTION validate_expert_reward() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE recipient uuid;
BEGIN
 SELECT reviewer_id INTO recipient FROM course_review WHERE id=NEW.review_id;
 PERFORM require_financial_link(NEW.transaction_id,recipient,NEW.amount,'EXPERT_CONTRIBUTION');
 RETURN NEW;
END $$;
CREATE TRIGGER tr_expert_reward BEFORE INSERT ON expert_contribution_reward FOR EACH ROW EXECUTE FUNCTION validate_expert_reward();

CREATE FUNCTION validate_cosmetic_purchase() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE price bigint;
BEGIN
 SELECT price_coins INTO price FROM cosmetic WHERE id=NEW.cosmetic_id AND archived_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cosmetic is unavailable'; END IF;
 NEW.paid_coins:=price;
 PERFORM require_financial_link(NEW.transaction_id,NEW.user_id,-price,'COSMETIC_PURCHASE');
 RETURN NEW;
END $$;
CREATE TRIGGER tr_cosmetic_purchase BEFORE INSERT ON user_cosmetic FOR EACH ROW EXECUTE FUNCTION validate_cosmetic_purchase();
CREATE TRIGGER tr_cosmetic_purchase_immutable BEFORE UPDATE OR DELETE ON user_cosmetic FOR EACH ROW EXECUTE FUNCTION deny_history_change();

CREATE FUNCTION unlock_course(p_user uuid,p_course uuid,p_idempotency_key text) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE c course%ROWTYPE; w uuid; entitlement uuid; tx uuid;
BEGIN
 IF p_idempotency_key IS NULL OR length(btrim(p_idempotency_key))=0 THEN RAISE EXCEPTION 'Unlock requires an idempotency key'; END IF;
 SELECT id INTO w FROM wallet WHERE user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown learner wallet'; END IF;
 SELECT id INTO entitlement FROM course_entitlement WHERE user_id=p_user AND course_id=p_course;
 IF FOUND THEN RETURN entitlement; END IF;
 SELECT * INTO c FROM course WHERE id=p_course FOR SHARE;
 IF NOT FOUND OR c.archived_at IS NOT NULL OR c.current_published_version_id IS NULL THEN RAISE EXCEPTION 'Course is not available for acquisition'; END IF;
 IF c.visibility_id='10ef7cf4-6aac-5ebe-9a5f-06bdffe17543' AND c.creator_id<>p_user THEN RAISE EXCEPTION 'Private course is not available to this learner'; END IF;
 IF c.price_coins>0 THEN
  INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,metadata_json)
   VALUES(w,'a82a54c9-c50b-5dd8-b590-ce5f160a0bad',-c.price_coins,'unlock:'||p_idempotency_key,jsonb_build_object('course_id',c.id))
   RETURNING id INTO tx;
 END IF;
 INSERT INTO course_entitlement(user_id,course_id,acquisition_kind,acquisition_transaction_id,paid_coins,promised_reward_coins)
  VALUES(p_user,p_course,CASE WHEN c.price_coins=0 THEN 'FREE' ELSE 'PURCHASE' END,tx,c.price_coins,c.reward_coins)
  RETURNING id INTO entitlement;
 RETURN entitlement;
END $$;

-- Merchant inventory and reservation capture are serialized within the same transaction.
CREATE FUNCTION guard_redemption() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE o merchant_offer%ROWTYPE; r wallet_reservation%ROWTYPE; owner uuid; used integer;
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Redemption history is retained'; END IF;
 SELECT * INTO r FROM wallet_reservation WHERE id=NEW.reservation_id;
 SELECT user_id INTO owner FROM wallet WHERE id=r.wallet_id FOR UPDATE;
 SELECT * INTO o FROM merchant_offer WHERE id=NEW.offer_id FOR UPDATE;
 IF owner IS DISTINCT FROM NEW.user_id OR r.amount IS DISTINCT FROM NEW.price_coins THEN RAISE EXCEPTION 'Redemption reservation must match its owner and price'; END IF;
 IF TG_OP='INSERT' THEN
  IF EXISTS(SELECT 1 FROM merchant_redemption WHERE id=NEW.id OR token_hash=NEW.token_hash OR reservation_id=NEW.reservation_id
   OR (user_id=NEW.user_id AND idempotency_key=NEW.idempotency_key)) THEN RAISE unique_violation USING MESSAGE='Duplicate redemption'; END IF;
  IF NEW.status_id<>'692c45ae-2883-588d-89b0-6545ab90a2f6' OR r.status_id<>'1cd2ee2f-16c3-576d-ac11-7655a065dd2d' OR NEW.price_coins<>o.price_coins
   OR o.archived_at IS NOT NULL OR now()<o.starts_at OR now()>=o.ends_at OR NEW.expires_at>least(o.ends_at,r.expires_at) OR NEW.expires_at<=now() THEN
   RAISE EXCEPTION 'Offer/reservation is not eligible for redemption';
  END IF;
  SELECT count(*) INTO used FROM merchant_redemption WHERE offer_id=o.id AND user_id=NEW.user_id
   AND status_id IN ('692c45ae-2883-588d-89b0-6545ab90a2f6','d15a0f52-0282-5bfb-a5f1-b1a687a41104');
  IF used>=o.per_user_limit OR o.remaining_quantity=0 THEN RAISE EXCEPTION 'Offer limit or inventory exhausted'; END IF;
  IF EXISTS(SELECT 1 FROM merchant_offer_badge b WHERE b.offer_id=o.id AND NOT EXISTS(SELECT 1 FROM user_badge u WHERE u.user_id=NEW.user_id AND u.badge_id=b.badge_id)) THEN RAISE EXCEPTION 'Missing required badge'; END IF;
  IF EXISTS(SELECT 1 FROM merchant_offer_place p WHERE p.offer_id=o.id AND NOT EXISTS(SELECT 1 FROM nfc_visit v WHERE v.user_id=NEW.user_id AND v.place_id=p.place_id)) THEN RAISE EXCEPTION 'Missing required visit'; END IF;
  IF o.remaining_quantity IS NOT NULL THEN UPDATE merchant_offer SET remaining_quantity=remaining_quantity-1 WHERE id=o.id; END IF;
 ELSE
  IF (NEW.id,NEW.offer_id,NEW.user_id,NEW.idempotency_key,NEW.token_hash,NEW.reservation_id,NEW.price_coins,NEW.created_at,NEW.expires_at)
   IS DISTINCT FROM (OLD.id,OLD.offer_id,OLD.user_id,OLD.idempotency_key,OLD.token_hash,OLD.reservation_id,OLD.price_coins,OLD.created_at,OLD.expires_at) THEN
   RAISE EXCEPTION 'Redemption identity and price cannot change';
  END IF;
  IF NEW IS NOT DISTINCT FROM OLD THEN RETURN NEW; END IF;
  IF OLD.status_id<>'692c45ae-2883-588d-89b0-6545ab90a2f6' OR NEW.status_id='692c45ae-2883-588d-89b0-6545ab90a2f6' THEN RAISE EXCEPTION 'Closed redemption cannot change or reopen'; END IF;
  IF NEW.status_id='d15a0f52-0282-5bfb-a5f1-b1a687a41104' THEN
   IF NEW.expires_at<=now() OR NEW.confirmed_by IS NULL THEN RAISE EXCEPTION 'Redemption is expired or unconfirmed'; END IF;
   IF NOT EXISTS(SELECT 1 FROM merchant WHERE id=o.merchant_id AND operator_id=NEW.confirmed_by) THEN RAISE EXCEPTION 'Confirmation requires the merchant operator'; END IF;
   INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,reservation_id)
    VALUES(r.wallet_id,'d7d95781-9539-5e58-bd80-af0289e2af5a',-NEW.price_coins,'redemption:'||NEW.id,r.id) RETURNING id INTO NEW.transaction_id;
   NEW.redeemed_at:=now();
  ELSE
   IF NEW.status_id='0b1f47d3-9744-5999-b8b1-8535e14a4422' AND NEW.expires_at>now() THEN RAISE EXCEPTION 'Redemption deadline has not expired'; END IF;
   UPDATE wallet_reservation SET status_id='a90e35cc-f18a-5bad-bd69-912fe5d14488',closed_at=now() WHERE id=r.id AND status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d';
   IF o.remaining_quantity IS NOT NULL THEN UPDATE merchant_offer SET remaining_quantity=remaining_quantity+1 WHERE id=o.id; END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tr_redemption BEFORE INSERT OR UPDATE OR DELETE ON merchant_redemption FOR EACH ROW EXECUTE FUNCTION guard_redemption();

CREATE VIEW course_catalogue AS
SELECT c.*,v.version_number,v.publication_status_id
FROM course c JOIN course_version v ON v.id=c.current_published_version_id
WHERE c.archived_at IS NULL AND c.visibility_id='e3a2ac10-28f9-5101-b32e-b2e70aecfaff'
 AND v.publication_status_id='aa7192b0-4b5d-5230-b311-25aa6b0e59ff';

-- Backend transaction contracts:
-- * Acquiring a paid course: lock its wallet, return an existing entitlement if
--   present, insert one COURSE_PURCHASE ledger row and its entitlement atomically.
-- * Generation: reserve coins, create the queued job, then transition the job;
--   success captures its fee and grants access, failure/cancellation releases it.
-- * Assessments: create an open attempt, write server-graded responses, then set
--   submitted_at. Triggers snapshot points, queue mistakes and complete/pay once.
-- * Reviews: insert a question_revision_event with correctness and interval_days.
--   The interval scheduler lives in the backend; correct recall increases intervals.
-- * Privacy/archive: catalogue visibility changes never delete entitlements. Access
--   queries must authorize an owner independently of the public catalogue view.
-- * Do not use INSERT ... ON CONFLICT for ledger/redemption writes. Read and
--   validate the existing idempotent result under the wallet lock instead.


-- 10. Lookup indexes. Existing primary/unique indexes are reused where they cover a lookup.


CREATE INDEX ix_app_user_country_id ON app_user (country_id);


CREATE INDEX ix_auth_token_user_id_expires_at ON auth_token (user_id,expires_at);


CREATE INDEX ix_user_interest_field_id ON user_interest (field_id);


CREATE INDEX ix_expert_field_field_id ON expert_field (field_id);


CREATE INDEX ix_media_asset_owner_id ON media_asset (owner_id);


CREATE INDEX ix_source_material_owner_id ON source_material (owner_id);


CREATE INDEX ix_source_material_grant_user_id ON source_material_grant (user_id);


CREATE INDEX ix_place_country_id ON place (country_id);


CREATE INDEX ix_nfc_tag_place_id ON nfc_tag (place_id);


CREATE INDEX ix_concept_field_id ON concept (field_id);


CREATE INDEX ix_concept_place_place_id ON concept_place (place_id);


CREATE INDEX ix_course_creator_id ON course (creator_id);


CREATE INDEX ix_course_country_id ON course (country_id);


CREATE INDEX ix_course_current_published_version_id ON course (current_published_version_id);


CREATE INDEX ix_course_field_field_id ON course_field (field_id);


CREATE INDEX ix_course_place_place_id ON course_place (place_id);


CREATE INDEX ix_course_version_concept_concept_id ON course_version_concept (concept_id);


CREATE INDEX ix_course_version_source_material_id ON course_version_source (material_id);


CREATE INDEX ix_course_entitlement_course_id ON course_entitlement (course_id);


CREATE INDEX ix_enrollment_user_id ON enrollment (user_id);


CREATE INDEX ix_enrollment_course_version_id ON enrollment (course_version_id);


CREATE INDEX ix_quiz_attempt_quiz_id ON quiz_attempt (quiz_id);


CREATE INDEX ix_question_response_question_id ON question_response (question_id);


CREATE INDEX ix_question_concept_concept_id ON question_concept (concept_id);


CREATE INDEX ix_course_completion_reward_course_id ON course_completion_reward (course_id);


CREATE INDEX ix_question_revision_user_id_next_review_at ON question_revision (user_id,next_review_at);


CREATE INDEX ix_question_revision_question_id ON question_revision (question_id);


CREATE INDEX ix_question_revision_event_revision_id_reviewed_at ON question_revision_event (revision_id,reviewed_at);


CREATE INDEX ix_wallet_transaction_wallet_id_created_at ON wallet_transaction (wallet_id,created_at);


CREATE INDEX ix_wallet_reservation_wallet_id_status_id_expires_at ON wallet_reservation (wallet_id,status_id,expires_at);


CREATE INDEX ix_course_interaction_user_id_created_at ON course_interaction (user_id,created_at);


CREATE INDEX ix_course_interaction_course_id_type_id_created_at ON course_interaction (course_id,type_id,created_at);


CREATE INDEX ix_user_course_preference_user_id_deferred_until ON user_course_preference (user_id,deferred_until);


CREATE INDEX ix_nfc_visit_user_id_place_id_visited_at ON nfc_visit (user_id,place_id,visited_at);


CREATE INDEX ix_nfc_visit_nfc_tag_id ON nfc_visit (nfc_tag_id);


CREATE INDEX ix_nfc_visit_reward_place_id ON nfc_visit_reward (place_id);


CREATE INDEX ix_user_badge_badge_id ON user_badge (badge_id);


CREATE INDEX ix_generation_job_user_id_created_at ON generation_job (user_id,created_at);


CREATE INDEX ix_generation_job_status_id_created_at ON generation_job (status_id,created_at);


CREATE INDEX ix_generation_job_source_material_id ON generation_job_source (material_id);


CREATE INDEX ix_course_review_course_version_id_created_at ON course_review (course_version_id,created_at);


CREATE INDEX ix_content_report_status_id_created_at ON content_report (status_id,created_at);


CREATE INDEX ix_content_report_course_version_id ON content_report (course_version_id);


CREATE INDEX ix_audit_event_entity_type_entity_id_created_at ON audit_event (entity_type,entity_id,created_at);


CREATE INDEX ix_friendship_requester_id ON friendship (requester_id);


CREATE INDEX ix_friendship_addressee_id ON friendship (addressee_id);


CREATE INDEX ix_user_block_blocked_user_id ON user_block (blocked_user_id);


CREATE INDEX ix_event_starts_at ON event (starts_at);


CREATE INDEX ix_event_place_id ON event (place_id);


CREATE INDEX ix_event_saved_user_id ON event_saved (user_id);


CREATE INDEX ix_event_participant_user_id ON event_participant (user_id);


CREATE INDEX ix_merchant_offer_merchant_id ON merchant_offer (merchant_id);


CREATE INDEX ix_merchant_redemption_offer_id_user_id ON merchant_redemption (offer_id,user_id);


CREATE INDEX ix_merchant_redemption_status_id_expires_at ON merchant_redemption (status_id,expires_at);


CREATE VIEW course_popularity_30d AS
SELECT e.course_id, count(DISTINCT e.user_id) AS distinct_completers
FROM course_completion cc JOIN enrollment e ON e.id=cc.enrollment_id
WHERE cc.completed_at >= now()-interval '30 days'
GROUP BY e.course_id;

CREATE VIEW wallet_available_balance AS
SELECT w.id AS wallet_id,w.user_id,w.balance,
 w.balance-coalesce((SELECT sum(r.amount) FROM wallet_reservation r
 WHERE r.wallet_id=w.id AND r.status_id='1cd2ee2f-16c3-576d-ac11-7655a065dd2d'),0) AS available_balance
FROM wallet w;

-- Reservations remain held until explicitly captured, released or marked expired.
-- A worker must expire abandoned reservations; capture rejects an expired deadline.
-- Unlock/generation/redemption writes must run atomically with their ledger operations.
-- No daily course reward quota, per-quiz pass gate or revision gate is modeled.
-- Archive courses instead of deleting them; retained foreign keys use NO ACTION.
-- Row visibility and private-source authorization must also be enforced by the backend.
COMMIT;
