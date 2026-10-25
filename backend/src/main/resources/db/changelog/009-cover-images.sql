--liquibase formatted sql
--changeset outthere:009-cover-images
ALTER TABLE course ADD COLUMN cover_image jsonb;
ALTER TABLE place ADD COLUMN cover_image jsonb;
CREATE TABLE cover_image_job (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 course_id uuid UNIQUE REFERENCES course(id) ON DELETE CASCADE,
 place_id uuid UNIQUE REFERENCES place(id) ON DELETE CASCADE,
 state varchar(20) NOT NULL DEFAULT 'QUEUED'
   CHECK (state IN ('QUEUED','RUNNING','READY','NOT_FOUND','FAILED')),
 attempts integer NOT NULL DEFAULT 0,
 priority integer NOT NULL DEFAULT 0,
 lease_token uuid,
 available_at timestamptz NOT NULL DEFAULT now(),
 message text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((course_id IS NOT NULL) <> (place_id IS NOT NULL))
);
CREATE INDEX ix_cover_image_job_queue ON cover_image_job(state,available_at);
