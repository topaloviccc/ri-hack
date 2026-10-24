--liquibase formatted sql
--changeset outthere:001-worldlearn-frontend
-- Selected worldlearn.sql tables; CHECKs, triggers and validation functions omitted.
-- Media/auth dependencies and generated PostGIS point omitted (decimal coordinates retained).


CREATE TABLE country (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
iso_code char(2) NOT NULL UNIQUE ,
label varchar(120) NOT NULL UNIQUE
);

CREATE TABLE field (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(100) NOT NULL UNIQUE
);

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

INSERT INTO publication_status(id,label) VALUES ('9c74f449-1cb8-5745-a7f4-6cc7ef718481','TO BE REVIEWED');

INSERT INTO publication_status(id,label) VALUES ('aa7192b0-4b5d-5230-b311-25aa6b0e59ff','PUBLISHED');

CREATE TABLE enrollment_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);

INSERT INTO enrollment_status(id,label) VALUES ('ebb792f8-19ba-5fd7-aebe-726b1a3071d2','NOT_STARTED');

INSERT INTO enrollment_status(id,label) VALUES ('fdb32e85-e734-5588-95c5-05a95c04ae49','IN_PROGRESS');

INSERT INTO enrollment_status(id,label) VALUES ('5bcd61ef-8dc7-53af-bc13-ee46134bbcc6','COMPLETED');

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

CREATE TABLE friendship_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);

INSERT INTO friendship_status(id,label) VALUES ('083f8160-cb30-54c4-9839-900c3ee65c68','PENDING');

INSERT INTO friendship_status(id,label) VALUES ('1fd341a9-517a-5e85-b681-2f558ce03441','ACCEPTED');

INSERT INTO friendship_status(id,label) VALUES ('b3027644-3190-5092-bcb0-ac9d116a4711','DECLINED');

INSERT INTO friendship_status(id,label) VALUES ('3c25464b-a108-576d-b534-e1f5a5bc851f','CANCELLED');

CREATE TABLE event_status (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
label varchar(80) NOT NULL UNIQUE
);

INSERT INTO event_status(id,label) VALUES ('7d68ee58-6327-5512-a0a0-e7fab2f3e0e2','SCHEDULED');

INSERT INTO event_status(id,label) VALUES ('7c4370d5-e633-50c9-b9c0-35619a148e8f','CANCELLED');

INSERT INTO event_status(id,label) VALUES ('4500a14c-e12c-5a76-86e4-bc6def720902','COMPLETED');

CREATE TABLE app_user (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
first_name varchar(100) NOT NULL,
last_name varchar(100) NOT NULL,
username varchar(50) NOT NULL ,
email varchar(255) NOT NULL ,
country_id uuid REFERENCES country(id),
avatar_url text,
timezone varchar(80) NOT NULL DEFAULT 'UTC',
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

CREATE TABLE user_interest (
user_id uuid NOT NULL REFERENCES app_user(id),
field_id uuid NOT NULL REFERENCES field(id),
weight numeric(6,3) NOT NULL DEFAULT 1 ,
PRIMARY KEY(user_id,field_id)
);

CREATE TABLE place (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
name varchar(200) NOT NULL,
description text,
country_id uuid NOT NULL REFERENCES country(id),
address text,
latitude numeric(9,6) ,
longitude numeric(9,6) ,
created_at timestamptz NOT NULL DEFAULT now(),
archived_at timestamptz
);

CREATE TABLE course (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
creator_id uuid NOT NULL REFERENCES app_user(id),
title varchar(220) NOT NULL,
description text,
country_id uuid REFERENCES country(id),
difficulty_id uuid NOT NULL DEFAULT '08000e35-c398-5283-8335-920c4f7ad08d' REFERENCES difficulty(id),
estimated_minutes integer ,
price_coins bigint NOT NULL DEFAULT 0 ,
reward_coins bigint NOT NULL DEFAULT 0 ,
visibility_id uuid NOT NULL DEFAULT 'e3a2ac10-28f9-5101-b32e-b2e70aecfaff' REFERENCES visibility(id),
current_published_version_id uuid,
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
version_number integer NOT NULL ,
title varchar(220) NOT NULL,
description text,
objectives_json jsonb NOT NULL DEFAULT '[]'::jsonb ,
difficulty_id uuid NOT NULL DEFAULT '08000e35-c398-5283-8335-920c4f7ad08d' REFERENCES difficulty(id),
estimated_minutes integer ,
publication_status_id uuid NOT NULL DEFAULT '9c74f449-1cb8-5745-a7f4-6cc7ef718481' REFERENCES publication_status(id),
human_verified boolean,
created_by uuid NOT NULL REFERENCES app_user(id),
created_at timestamptz NOT NULL DEFAULT now(),
published_at timestamptz,
UNIQUE(course_id,version_number), UNIQUE(id,course_id)
);

CREATE TABLE lesson (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
course_version_id uuid NOT NULL REFERENCES course_version(id),
position integer NOT NULL ,
title varchar(220) NOT NULL,
content_json jsonb NOT NULL DEFAULT '{}'::jsonb ,
UNIQUE(course_version_id,position), UNIQUE(id,course_version_id)
);

CREATE TABLE wallet (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL UNIQUE REFERENCES app_user(id),
balance bigint NOT NULL DEFAULT 0 ,
UNIQUE(id,user_id)
);

CREATE TABLE wallet_transaction (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
wallet_id uuid NOT NULL REFERENCES wallet(id),
type_id uuid NOT NULL REFERENCES wallet_transaction_type(id),
amount bigint NOT NULL ,
idempotency_key text NOT NULL,
reverses_transaction_id uuid UNIQUE,
metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb ,
created_at timestamptz NOT NULL DEFAULT now(),
UNIQUE(wallet_id,idempotency_key), UNIQUE(id,wallet_id),
FOREIGN KEY(reverses_transaction_id,wallet_id) REFERENCES wallet_transaction(id,wallet_id)
);

CREATE TABLE course_entitlement (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES app_user(id),
course_id uuid NOT NULL REFERENCES course(id),
acquired_at timestamptz NOT NULL DEFAULT now(),
acquisition_kind varchar(20) NOT NULL ,
acquisition_transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
paid_coins bigint NOT NULL DEFAULT 0 ,
promised_reward_coins bigint NOT NULL ,
UNIQUE(user_id,course_id), UNIQUE(id,user_id,course_id)
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
FOREIGN KEY(course_version_id,course_id) REFERENCES course_version(id,course_id)
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

CREATE TABLE course_completion (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
enrollment_id uuid NOT NULL UNIQUE REFERENCES enrollment(id),
completed_at timestamptz NOT NULL DEFAULT now(),
quiz_count integer NOT NULL ,
aggregate_percentage numeric(12,8) NOT NULL ,
score_sum_numerator numeric NOT NULL ,
score_sum_denominator numeric NOT NULL
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

CREATE TABLE friendship (
id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
requester_id uuid NOT NULL REFERENCES app_user(id),
addressee_id uuid NOT NULL REFERENCES app_user(id),
friendship_status_id uuid NOT NULL DEFAULT '083f8160-cb30-54c4-9839-900c3ee65c68' REFERENCES friendship_status(id),
created_at timestamptz NOT NULL DEFAULT now(),
responded_at timestamptz
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
ends_at timestamptz NOT NULL ,
timezone varchar(80) NOT NULL DEFAULT 'UTC',
capacity integer ,
is_free boolean NOT NULL DEFAULT true,
status_id uuid NOT NULL DEFAULT '7d68ee58-6327-5512-a0a0-e7fab2f3e0e2' REFERENCES event_status(id),
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE course ADD CONSTRAINT fk_course_current_version FOREIGN KEY(current_published_version_id,id) REFERENCES course_version(id,course_id) DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX uq_username_ci ON app_user (lower(username));

CREATE UNIQUE INDEX uq_email_ci ON app_user (lower(email));

CREATE UNIQUE INDEX uq_friendship_pair ON friendship (least(requester_id,addressee_id),greatest(requester_id,addressee_id));

CREATE INDEX ix_app_user_country_id ON app_user (country_id);

CREATE INDEX ix_user_interest_field_id ON user_interest (field_id);

CREATE INDEX ix_place_country_id ON place (country_id);

CREATE INDEX ix_course_creator_id ON course (creator_id);

CREATE INDEX ix_course_country_id ON course (country_id);

CREATE INDEX ix_course_current_published_version_id ON course (current_published_version_id);

CREATE INDEX ix_course_field_field_id ON course_field (field_id);

CREATE INDEX ix_course_place_place_id ON course_place (place_id);

CREATE INDEX ix_course_entitlement_course_id ON course_entitlement (course_id);

CREATE INDEX ix_enrollment_user_id ON enrollment (user_id);

CREATE INDEX ix_enrollment_course_version_id ON enrollment (course_version_id);

CREATE INDEX ix_wallet_transaction_wallet_id_created_at ON wallet_transaction (wallet_id,created_at);

CREATE INDEX ix_user_course_preference_user_id_deferred_until ON user_course_preference (user_id,deferred_until);

CREATE INDEX ix_friendship_requester_id ON friendship (requester_id);

CREATE INDEX ix_friendship_addressee_id ON friendship (addressee_id);

CREATE INDEX ix_event_starts_at ON event (starts_at);

CREATE INDEX ix_event_place_id ON event (place_id);
