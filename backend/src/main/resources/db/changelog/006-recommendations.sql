--liquibase formatted sql
--changeset outthere:006-recommendations
INSERT INTO field(id,label) VALUES
 ('8e67f922-b9b2-941d-6795-c6447544374e','Nature & Wildlife'),
 ('20272133-51ab-446f-c5cc-cd23b589d553','Culture & Traditions'),
 ('fd2d398e-df50-3da4-267c-ebe59b457aee','Monuments & Architecture'),
 ('1a3627f6-bcca-9aaf-036f-568d05ee284e','History'),
 ('a35a1f45-d111-afb2-20b6-dd469fc38047','Food & Drink'),
 ('2291755b-ddd5-248b-e57c-2a186caf809c','Arts & Music'),
 ('15299291-a174-20fc-23c4-c98af4882c6a','Sport & Games')
ON CONFLICT DO NOTHING;

ALTER TABLE app_user ADD COLUMN interests_set_at timestamptz;
-- Existing learners keep their current experience; new accounts see onboarding.
UPDATE app_user SET interests_set_at=now();

CREATE TABLE course_feedback (
 user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
 course_id uuid NOT NULL REFERENCES course(id) ON DELETE CASCADE,
 opened boolean NOT NULL DEFAULT false,
 dwell_ms integer NOT NULL DEFAULT 0 CHECK (dwell_ms BETWEEN 0 AND 120000),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,course_id)
);

-- Small catalogue: persist real semantic vectors here and rank in Java, without
-- requiring a database extension or a separate vector service.
CREATE TABLE course_embedding (
 course_id uuid PRIMARY KEY REFERENCES course(id) ON DELETE CASCADE,
 model varchar(250) NOT NULL,
 content_hash varchar(32) NOT NULL,
 embedding real[],
 attempts integer NOT NULL DEFAULT 0,
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
