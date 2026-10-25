--liquibase formatted sql
--changeset outthere:008-generation-repair
ALTER TABLE course_generation ADD COLUMN repair_attempts integer NOT NULL DEFAULT 0
 CHECK (repair_attempts BETWEEN 0 AND 1);
