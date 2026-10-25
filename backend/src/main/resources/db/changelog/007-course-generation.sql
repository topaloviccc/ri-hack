--liquibase formatted sql
--changeset outthere:007-course-generation
INSERT INTO field(label) VALUES ('Nature & Wildlife'),('Culture & Traditions'),
 ('Monuments & Architecture'),('History'),('Food & Drink'),('Arts & Music'),('Sport & Games')
 ON CONFLICT(label) DO NOTHING;

CREATE TABLE course_generation (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES app_user(id),
 query varchar(200) NOT NULL,
 query_key varchar(200) NOT NULL,
 state varchar(20) NOT NULL DEFAULT 'QUEUED'
   CHECK (state IN ('QUEUED','RUNNING','READY','REFUSED','FAILED')),
 attempts integer NOT NULL DEFAULT 0,
 lease_until timestamptz,
 lease_token uuid,
 message text,
 draft_json jsonb,
 course_id uuid REFERENCES course(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,query_key)
);
CREATE INDEX ix_course_generation_queue ON course_generation(state,lease_until,created_at);
CREATE UNIQUE INDEX uq_course_generation_active_user ON course_generation(user_id)
 WHERE state IN ('QUEUED','RUNNING');

-- Provider identities and attribution come from geocoding, never from model coordinates.
ALTER TABLE place ADD COLUMN geocoder_id text UNIQUE;
ALTER TABLE place ADD COLUMN geocoder_attribution text;
