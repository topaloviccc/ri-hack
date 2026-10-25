--liquibase formatted sql
--changeset outthere:004-course-learning
-- Learning tables from worldlearn.sql. CHECKs and validation triggers remain omitted.
-- Product policy: every question counts equally; best submitted attempt per quiz;
-- all quizzes submitted and correct_count / question_count >= 0.8 passes.
CREATE TABLE question_type (id integer PRIMARY KEY, label varchar(80) NOT NULL UNIQUE);
INSERT INTO question_type(id,label) VALUES
 (1,'SINGLE_CHOICE'),(2,'MULTIPLE_CHOICE'),(3,'TRUE_FALSE'),(4,'SHORT_ANSWER'),(5,'MATCHING');

CREATE TABLE quiz (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 course_version_id uuid NOT NULL REFERENCES course_version(id),
 lesson_id uuid UNIQUE,
 title varchar(220),
 UNIQUE(id,course_version_id),
 FOREIGN KEY(lesson_id,course_version_id) REFERENCES lesson(id,course_version_id)
);
CREATE UNIQUE INDEX uq_quiz_final_per_version ON quiz(course_version_id) WHERE lesson_id IS NULL;

CREATE TABLE question (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 quiz_id uuid NOT NULL REFERENCES quiz(id),
 question_type_id integer NOT NULL REFERENCES question_type(id),
 prompt text NOT NULL, explanation text,
 grading_json jsonb NOT NULL DEFAULT '{}'::jsonb,
 position integer NOT NULL,
 points numeric(8,2) NOT NULL DEFAULT 1,
 UNIQUE(quiz_id,position), UNIQUE(id,quiz_id)
);
CREATE TABLE answer_option (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 question_id uuid NOT NULL REFERENCES question(id),
 answer_text text NOT NULL,
 is_correct boolean NOT NULL DEFAULT false,
 position integer NOT NULL,
 UNIQUE(question_id,position)
);
CREATE TABLE quiz_attempt (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 enrollment_id uuid NOT NULL, course_version_id uuid NOT NULL, quiz_id uuid NOT NULL,
 attempt_number integer NOT NULL,
 started_at timestamptz NOT NULL DEFAULT now(), submitted_at timestamptz,
 earned_points numeric(10,2), possible_points numeric(10,2),
 assisted boolean NOT NULL DEFAULT false,
 UNIQUE(enrollment_id,quiz_id,attempt_number), UNIQUE(id,quiz_id),
 FOREIGN KEY(enrollment_id,course_version_id) REFERENCES enrollment(id,course_version_id),
 FOREIGN KEY(quiz_id,course_version_id) REFERENCES quiz(id,course_version_id)
);
CREATE TABLE question_response (
 attempt_id uuid NOT NULL, question_id uuid NOT NULL, quiz_id uuid NOT NULL,
 response_json jsonb NOT NULL, is_correct boolean NOT NULL,
 possible_points numeric(8,2) NOT NULL, earned_points numeric(8,2) NOT NULL,
 PRIMARY KEY(attempt_id,question_id),
 FOREIGN KEY(attempt_id,quiz_id) REFERENCES quiz_attempt(id,quiz_id),
 FOREIGN KEY(question_id,quiz_id) REFERENCES question(id,quiz_id)
);
CREATE TABLE course_completion_quiz_result (
 completion_id uuid NOT NULL REFERENCES course_completion(id),
 quiz_id uuid NOT NULL REFERENCES quiz(id), attempt_id uuid NOT NULL,
 PRIMARY KEY(completion_id,quiz_id),
 FOREIGN KEY(attempt_id,quiz_id) REFERENCES quiz_attempt(id,quiz_id)
);
CREATE TABLE course_completion_reward (
 user_id uuid NOT NULL REFERENCES app_user(id), course_id uuid NOT NULL REFERENCES course(id),
 completion_id uuid NOT NULL UNIQUE REFERENCES course_completion(id),
 transaction_id uuid UNIQUE REFERENCES wallet_transaction(id), amount bigint NOT NULL,
 PRIMARY KEY(user_id,course_id)
);
CREATE INDEX ix_quiz_attempt_enrollment ON quiz_attempt(enrollment_id,quiz_id);
