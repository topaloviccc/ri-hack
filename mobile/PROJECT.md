# PROJECT.md — what we're building

Hackathon topic: *promoting learning in the age of AI*.
Full reference: `../Learning_Product_Specification.docx` (v0.2). UI reference: `../ui-mock/ui.md` + images.

> **The spec is reference only.** Build a feature only when it is explicitly requested. Deferred items live in `BACKLOG.md`.
>
> **Core idea (overrides the spec):** every course is a *concept strongly tied to one country* (bull riding → Spain), optionally linked to real *locations* connected to it (bullrings in Seville and Ronda). Concepts belong to a whole country; only locations are pins on the map. Focus: nature & biology, cultural specifics, monuments.

## Product in one paragraph
A mobile-first app for building general and specific knowledge: short courses, active study and quizzes,
a personal knowledge map, and optional real-world discovery (local events, NFC/QR visits). Travel is an
extension, not a requirement. Users are general learners; reviewers, local contributors, partners and
admins are role capabilities added later.

## Built so far (mobile)
Core records and mutations now use the Spring Boot backend. Images and unsupported
extra details remain explicitly labelled demo content; expert applications and the
weekly challenge remain demos. The table below records prototype feature coverage;
see [API.md](API.md) for the current source of each field and run configuration.

| Area | State |
|---|---|
| Tabs: Home · Scroll · Calendar · Network · Courses | ✅ |
| Home: "Continue with…", "Most Popular" (by learner count), "Recommended for you" | ✅ mock data |
| Scroll: full-screen reels; swipe right = less like this (local), swipe left = details | ✅ mock data |
| Events: city picker + "my location", calendar with event dots, day list, event details + Register link | ✅ mock data |
| Network: friends strip, feed, weekly challenge, suggested friends; Leaderboards (friends, weekly); People search; send friend request | ✅ mock data |
| Courses: Map (SVG world, tap country → site pins + country card, clustering, location sheet) · Countries (A–Z → Country page) · Fields (by subject) | ✅ mock data |
| Course details, Profile (own + others, one view), Settings (System/Light/Dark, persisted) | ✅ mock data |
| Shared coins: posted/held/available balances and course unlocks with a celebration | Connected backend |
| Benefits: server search/filters/sort, offer details, direct coupon activation with random code, and My Coupons | Connected backend; sample partners labelled Demo |
| Expert requests: Settings › Become an expert (field, title, certificate upload) and request status list | ✅ mock data |

## Domain (as used in the app today)
- **Course**: a concept tied to one country — title, image, subject (Nature & Wildlife, Culture & Traditions, Monuments & Architecture, History, Food & Drink, Arts & Music, Sport & Games), description, learner count, estimated minutes, difficulty, 0–n locations, progress for owned in-progress courses. No ratings or reviews. The UI still says "course".
- **Location**: a real site (monument, nature, museum, venue, historic site) with town, country, coordinates and photo; shared between courses. These are the map waypoints.
- **Country**: production ISO 3166-1 alpha-2 code, English display name, hosted image flag URL and course/location counts; introduction text remains demo content.
- **Event** (`LearningEvent`): title, category, start time, city, venue, coordinates, image, description, organizer, price (null = free), language, registration URL. Seed cities are in Montenegro.
- **User**: name, handle, avatar, country, bio, stats (completed, streak, countries), country badges, in-progress/completed course ids, relation to me (me/friend/requested/none).
- **Network**: feed of friends' completions, one weekly challenge, weekly friends leaderboard.

## Spec features not started (pick from here when asked)
F1 accounts/onboarding · F2 search · F3 lesson player · F4 quizzes (pass > 80%) · F5 completion timing ·
F6 earning coins · F7 spaced repetition, streaks · F8 knowledge map · F9 NFC visits/badges · F10 local stories ·
F11–F13 AI generation/assistant · F14 expert review · F15 friends/leaderboards · F16 public commercial partner onboarding · F17 full event model.

## Backend
Spring Boot modular monolith with PostgreSQL, JDBC and Liquibase. The frontend now
connects its schema-backed reads and mutations to that API. Authentication, AI,
bucket integration and other features outside the schema/frontend intersection are
excluded. Viewer context is configured with `EXPO_PUBLIC_USER_ID`; see `API.md`.
