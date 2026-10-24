--liquibase formatted sql

--changeset test:codebook-tables
CREATE TABLE codebook_course_levels (
    id BIGINT PRIMARY KEY,
    label VARCHAR(255) NOT NULL CHECK (label ~ '[^[:space:]]')
);

CREATE TABLE codebook_empty (
    id BIGINT PRIMARY KEY,
    label VARCHAR(255) NOT NULL CHECK (label ~ '[^[:space:]]')
);

CREATE TABLE codebook_hidden (
    id BIGINT PRIMARY KEY,
    label VARCHAR(255) NOT NULL CHECK (label ~ '[^[:space:]]')
);
