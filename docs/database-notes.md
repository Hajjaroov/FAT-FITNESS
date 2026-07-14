# Database Notes

## Current Database

Local development uses PostgreSQL through Docker Compose:

- Service: `postgres`
- Container: `fitness_postgres`
- Database: `fitness_db`
- Version: PostgreSQL 18

Compose file:

- `infrastructure/docker-compose.yml`

DB credentials are env-var only (no committed defaults, in either `docker-compose.yml` or the backend's `application.yml`) — `FATFITNESS_DB_USERNAME` / `FATFITNESS_DB_PASSWORD`. Copy `infrastructure/.env.example` to `infrastructure/.env` (gitignored) before running `docker compose up` from that directory, and set the same two vars in `backend/fatfitness-api/.env` for the backend to connect. Both must match the credentials already baked into the existing named volume — Postgres only applies `POSTGRES_USER`/`POSTGRES_PASSWORD` on first init of an empty data directory, so changing these values will not change an already-initialized DB role.

Current PostgreSQL 18 volume:

- `infrastructure_fitness_postgres_data_pg18`

Do not delete or recreate this volume unless the user explicitly approves cleanup.

## Migration Tool

Use Flyway for all schema changes.

Migration directory:

- `backend/fatfitness-api/src/main/resources/db/migration`

Rules:

- Do not use Hibernate auto-create/update for schema management.
- Keep `spring.jpa.hibernate.ddl-auto=validate`.
- Add the first migration only when the first real persisted feature is approved.
- Use small, reviewable migrations.

## Data Model Direction

Future relational data likely includes:

- Users
- Profiles
- Blog posts if not MDX-only
- Learn articles if not static/MDX-only
- Forum categories
- Forum posts
- Comments
- Likes
- Bookmarks
- Reports
- Moderation actions
- Weight logs later
- Progress image metadata later

Current user/auth state:

- `/login` and `/register` submit to the backend auth APIs for local account-flow testing.
- Register uses display name, email, searchable country/region picker, password, confirm password, and rules/privacy agreement.
- Login keeps the access token in React memory and uses the web refresh cookie for browser session restore.
- The shared site header can display the current browser session and trigger logout.
- `/dashboard` can display the current signed-in account summary from the existing auth session.
- The first auth Flyway migration exists.
- User/auth persistence includes users, role storage, email verification tokens, and refresh-token session records.
- JPA entities and repositories exist for the auth persistence foundation.
- `POST /api/auth/register` exists as the first backend auth endpoint.
- Registration stores a pending user, password hash, user role, and hashed email verification token.
- `POST /api/auth/verify-email` exists and marks valid tokens as consumed while activating the related user.
- `POST /api/auth/resend-verification` exists and creates fresh development verification tokens for pending accounts.
- `POST /api/auth/login` exists and creates hashed refresh-session records for active users.
- `POST /api/auth/refresh` exists and rotates refresh sessions by revoking/linking the old session and creating a replacement session.
- `POST /api/auth/logout` exists and revokes refresh sessions idempotently.
- `GET /api/auth/me` exists as the first protected endpoint and reads the current active user from the bearer-token subject.
- Web auth can now keep refresh tokens in an `HttpOnly` cookie while the database still stores only hashed refresh tokens.
- Backend startup can create or ensure a local owner user from environment variables without storing plaintext passwords.
- The local owner seed is development-only and must be removed or disabled before production/public launch.
- Bearer-token validation is wired for `/api/auth/me`, authenticated forum write/report endpoints, and moderator report-review endpoints. Real email delivery is not implemented yet.

Current community/forum state:

- The second Flyway migration creates `forum_categories`.
- The MVP board list is seeded as active forum categories with stable slugs and display order.
- `GET /api/community/categories` and `GET /api/community/categories/{slug}` read this category metadata.
- The third Flyway migration creates `forum_posts` and `forum_post_reports`.
- Active authenticated users can create top-level `PUBLISHED` forum posts.
- Public reads can list/read published posts.
- Active authenticated users can report published posts; duplicate reports from the same reporter/post pair are not duplicated.
- The fourth Flyway migration creates `forum_comments` and `forum_comment_reports`.
- Active authenticated users can create flat `PUBLISHED` comments on published, unlocked posts.
- Public reads can list published comments for published posts.
- Active authenticated users can report published comments; duplicate reports from the same reporter/comment pair are not duplicated.
- The fifth Flyway migration adds report resolution metadata to post and comment reports: `resolved_by_user_id` and `resolution_note`.
- Moderator report resolution uses existing report rows with `status`, `resolved_at`, `resolved_by_user_id`, and `resolution_note`.
- Report-scoped moderation hide actions now use the existing `HIDDEN` post/comment statuses and `hidden_at` timestamps; no new migration was needed for this slice.
- The sixth Flyway migration (`V6__moderation_lock_and_ban.sql`) creates `moderation_actions` for lock and ban audit logging.
- `POST /api/moderation/posts/{id}/lock` sets `is_locked = true` on the forum post and writes a `LOCK` row to `moderation_actions`.
- `POST /api/moderation/users/{id}/ban` sets the user status to `BANNED`, revokes all their refresh sessions, and writes a `BAN` row to `moderation_actions`.
- The seventh Flyway migration (`V7__likes_and_bookmarks.sql`) creates `post_likes`, `comment_likes`, and `post_bookmarks`. Each has a `(user_id, target_id)` unique constraint so a user can like/bookmark a given target at most once, plus FK constraints to `users` and the target table.
- The eighth Flyway migration (`V8__password_reset_tokens.sql`) creates `password_reset_tokens` with a `token_hash` unique constraint and FK to `users`. Tokens expire in 30 minutes and are marked used after a successful reset.
- The ninth Flyway migration (`V9__add_avatar_to_users.sql`) adds `avatar_jpeg BYTEA` to `users` for server-resized 256×256 JPEG avatars.
- The tenth Flyway migration (`V10__add_edited_at_to_forum_content.sql`) adds `edited_at TIMESTAMP WITH TIME ZONE` to `forum_posts` and `forum_comments`, set only when the body/title is edited (not on moderation hide/lock).
- `moderation_actions` also records `HIDE` rows (target type `POST`/`COMMENT`) when a report-scoped hide is performed, alongside `LOCK` and `BAN`.
- The eleventh Flyway migration (`V11__create_private_messaging.sql`) creates the async private-messaging tables:
  - `conversations` — `id`, `subject`, `created_at`.
  - `conversation_participants` — surrogate `id`, `conversation_id`, `user_id`, `last_read_at` (nullable), `deleted` (per-user soft hide). Unique `(conversation_id, user_id)`; index on `(user_id, deleted)`. A surrogate PK is used (not a composite key) for consistency with every other table's single-UUID `id`.
  - `messages` — `id`, `conversation_id`, `sender_user_id`, `body`, `sent_at`. Index on `(conversation_id, sent_at)`.
  - All have FK constraints to `conversations`/`users`. Messages are not soft-deleted; deletion is per-participant via `conversation_participants.deleted`.
- The twelfth Flyway migration (`V12__add_email_notifications_pm_to_users.sql`) adds `email_notifications_pm BOOLEAN NOT NULL DEFAULT TRUE` to the `users` table. This flag lets each user opt out of email alerts when they receive a private message. Default is opted-in (true). Existing rows inherit the default on migration.
- The latest applied migration is `V16`. The next new migration must be `V17`.
- The thirteenth Flyway migration (`V13__create_myplan_weight.sql`) creates two tables for the `/myplan` weight tracking feature: `user_weight_goals` (one row per user — `id`, `user_id` unique FK → users, `start_weight` DECIMAL(6,2) nullable, `goal_weight` DECIMAL(6,2) nullable, `created_at`, `updated_at`) and `weight_entries` (`id`, `user_id` FK → users, `entry_date` DATE, `weight_kg` DECIMAL(6,2) NOT NULL, `created_at`; unique `(user_id, entry_date)`; index on `(user_id, entry_date)`).
- The fourteenth Flyway migration (`V14__create_myplan_diet.sql`) is applied — `/myplan` Phase 2 (Diet), implemented end to end:
  - `foods` — shared/global catalog, **starts empty and grows only from user-added custom foods** (open add, any active user; no bulk/external seed — an SR Legacy USDA import was built and then rolled back after manual testing showed poor suggestion quality, see `docs/dev-agent-plan.md`): `id`, `created_by_user_id` **nullable** FK → users (attribution only; nullable to allow a future system-attributed row, though today every row has a real creator), `name` `VARCHAR(160)` NOT NULL (English, primary/required), `name_de` `VARCHAR(220)` nullable (German, optional — see the bilingual-naming note below), `unit_label` (free text, e.g. "100g", "1 egg, 57g" — deliberately holds both count and weight together where useful), `calories_per_unit`/`protein_per_unit`/`carbs_per_unit`/`fat_per_unit` DECIMAL, `created_at`, `updated_at`. Edit/delete is **moderator-only** (`OWNER`/`ADMIN`/`MODERATOR`) regardless of creator — not the creator-or-moderator pattern used elsewhere.
  - `diet_meals` — personal, private: `id`, `user_id` FK → users, `title` (default `"Meal N"`, freely renamable), `position` (reorderable), `created_at`, `updated_at`.
  - `diet_meal_items` — personal, private, belongs to a `diet_meals` row (`ON DELETE CASCADE`): `id`, `meal_id`, `food_id` nullable FK → `foods` **`ON DELETE SET NULL`** (traceability only — deleting a shared food must never delete a user's already-logged item), `name`, `unit_label`, `quantity`, and its own `calories_per_unit`/`protein_per_unit`/`carbs_per_unit`/`fat_per_unit` — macros are **snapshotted onto this row at add-time**, never live-joined against `foods`, so editing a shared food later never changes meals already logged with it.
  - `food_macro_checks` — moderator review queue for flagging/correcting a shared food's macros: `id`, `target_food_id` NOT NULL FK → `foods` `ON DELETE CASCADE`, `submitted_by_user_id` FK → users, `proposed_name`/`proposed_unit_label` nullable, `proposed_calories_per_unit`/etc. NOT NULL, `comment` nullable, `status` (`OPEN`/`RESOLVED`/`DISMISSED`, mirrors `ForumReportStatus`), `resolved_at`/`resolved_by_user_id`/`resolution_note`, `created_at`. **One *open* flag per user per food** (not one ever): `open_submitted_by_user_id` mirrors `submitted_by_user_id` while `status = OPEN` and is cleared to `NULL` when the check is resolved/dismissed; `UNIQUE (target_food_id, open_submitted_by_user_id)` then only blocks two simultaneously-open flags (NULLs never collide), so a user can flag the same food again later if it's edited wrong again after a prior flag was closed. This works around Postgres partial/filtered unique indexes (`CREATE UNIQUE INDEX ... WHERE ...`) not being supported by H2, which the test suite uses.
  - **Bilingual naming**: custom foods added via the diet form can optionally include a German name (`name_de`) alongside the required English `name`, so the shared catalog stays searchable in both languages without forcing a translation the user may not know. `FoodCombobox` matches/displays either. Full reasoning in `docs/dev-agent-plan.md`'s "Custom food entry: bilingual naming" section.
  - **Known limitation — one fixed `unit_label` per food row, no multi-unit picker.** Real trackers let one food carry several selectable units (e.g. "1 large egg" and "100g" both on the same entry), each converted from one canonical per-100g baseline. This schema only supports one unit per row. Trigger to revisit: the catalog accumulating near-duplicate entries for the same food to cover both a weight- and count-based version, or explicit user requests for a unit-switcher. Fix when needed: additive `food_portions` child table (`food_id`, `label`, `gram_weight`) alongside a single per-100g baseline on `foods` — not a rewrite, and `diet_meal_items` (which snapshot their own macros) are unaffected either way. Full reasoning in `docs/dev-agent-plan.md`'s Phase 2 section.
  - See `docs/dev-agent-plan.md` for the full design rationale (including why a fully autonomous AI moderator was considered and rejected in favor of a lightweight "look this up" search-link assist for human moderators, and why an external food database was tried and rolled back).

### V15 — `/myplan` Phase 3 (Workout) — implemented

The fifteenth Flyway migration (`V15__create_myplan_workout.sql`) creates three tables for `/myplan` Phase 3 (Workout), implemented end to end (design approved 2026-07-08, built 2026-07-10, then reshaped the same day after owner feedback — see the note below):

- `exercises` — shared catalog, mirrors `foods`: starts empty, open add by any active user (auto-created when a custom-named exercise is added to a plan day; deduplicated by case-insensitive `name`), edit/delete moderator-only. `id`, `created_by_user_id` nullable FK → users, `name` `VARCHAR(160)` NOT NULL (English, primary), `name_de` `VARCHAR(220)` nullable (German, optional — same bilingual pattern as `foods.name_de`), `photo_src` `VARCHAR(300)` nullable (path under `public/photos/exercises/`; always null for user-added entries today, reserved for the deferred owner-curated seeding — see `docs/dev-agent-plan.md`), `created_at`, `updated_at`. Index on `name`.
- `workout_plan_days` — **one plan per user** (not several), an ordered, renamable list of day blocks: `id`, `user_id` FK → users, `title` `VARCHAR(120)` (default `"Day N"`, e.g. "Upper A" / "Warm-Up Protocol"), `weekday` `VARCHAR(10)` **nullable** with a `CHECK` on `MONDAY`–`SUNDAY` (a block can be pinned to a day of the week or float free of one, like a warm-up protocol; rendered localized — Monday/Montag — from the enum value), `position`, `created_at`, `updated_at`. Mirrors `diet_meals` (max-position-derived numbering, reorder endpoint with duplicate-ID guard). **Max 50 blocks per user**, enforced in the service (400 beyond that) — a generous abuse-guard backstop, not a real usage ceiling (raised from an initial 8, which wrongly assumed one block per weekday).
- `workout_plan_day_exercises` — line items within a plan day (`ON DELETE CASCADE`): `id`, `plan_day_id`, `exercise_id` nullable FK → `exercises` **`ON DELETE SET NULL`** (traceability only, mirrors `diet_meal_items.food_id` — deleting a shared exercise never deletes a user's plan item), snapshotted `name` `VARCHAR(160)`, `sets` `VARCHAR(120)` NOT NULL — **free text, same shape as the Journal training pages** ("3 x 8-10", "2 minutes", "2 x 12-15 each side"; ranges, durations, and weights don't fit structured integer columns), `created_at`, `updated_at`. Items are ordered by `created_at` (no `position`), same as diet meal items.

**Reshape note (2026-07-10)**: the first cut of V15 also had a `workout_sessions` table (done-per-week marks keyed to Mondays) and structured `sets`/`reps`/`duration_seconds` integer columns. The owner reviewed the running page and cut the session log entirely ("it's not a record, it's just a workout plan maker") and pointed at the Journal training pages as the representation reference (weekday + block name + free-text sets). Since V15 was uncommitted, it was edited in place rather than adding a V16; the old-shape tables had already been applied to the local dev DB by a `bootRun`, so they were dropped and the `version = '15'` row deleted from `flyway_schema_history` (1 row of owner test data, wipe pre-approved) — the reshaped V15 applies cleanly on the next backend start.

### V16 — `/myplan` Phase 4 (GLP-1 log) — implemented

The sixteenth Flyway migration (`V16__create_myplan_glp1.sql`) creates one table for `/myplan` Phase 4, implemented end to end 2026-07-14:

- `medication_log_entries` — fully private per user (same privacy model as `weight_entries`/`diet_meals`; not a shared/catalog concept like `foods`/`exercises`, and no moderation surface): `id`, `user_id` FK → users, `entry_date` DATE NOT NULL, `dose_mg` DECIMAL(6,2) NOT NULL, `notes` `VARCHAR(1000)` nullable, `created_at`, `updated_at`. Index on `(user_id, entry_date)`. **No `medication_name` column** — considered (free text, since the drug varies per user: Mounjaro/Ozempic/Retatrutide/anything), then dropped entirely by the owner since the page itself is already scoped to "the GLP-1 log," making a per-entry drug tag redundant. **No unique constraint on `(user_id, entry_date)`** — unlike `weight_entries`, a log entry is an event, not a single daily measurement, so multiple entries per date are allowed (e.g. a same-day correction note).
- **No weight column on this table at all.** Logging a dose can optionally include a weight; the frontend achieves this by making an independent second call to the existing, unmodified `POST /api/myplan/weight/entries` endpoint for that date, rather than this feature owning its own copy of weight data. A `409` (weight already logged for that date) is caught client-side and silently ignored — the existing value stays authoritative. Displaying weight alongside a dose is a live join (by date) against the fetched `weight_entries` list at render time, not a stored/denormalized value, so the two can never drift out of sync. See `docs/dev-agent-plan.md` ("Phase 4 — GLP-1") for the full design discussion, including the "change since start" computation (also purely client-side, never persisted — reference point is `user_weight_goals.start_weight` if set, else the earliest `weight_entries` row, else no reference exists yet).

### Moderation audit table

The `V6__moderation_lock_and_ban.sql` migration creates `moderation_actions` with:

- `id` UUID primary key
- `moderator_user_id` UUID FK → `users` (who performed the action)
- `target_type` varchar(20) — `POST` or `USER`
- `target_id` UUID — the affected record
- `action` varchar(40) — `LOCK` or `BAN`
- `note` varchar(1000) nullable — optional moderator note
- `created_at` timestamp with time zone

This table is intentionally lightweight; it is a simple audit trail and does not replace any report or resolution rows already present for forum reports. Recording moderation actions centrally helps with review, appeals, and compliance.

Next user/auth step:
- Add bearer-token validation to future protected feature endpoints before connecting account-only frontend features.
- Keep local owner seed credentials outside Git; use environment variables for local development.
- `backend/fatfitness-api/.env` can hold local owner seed values for `bootRun`; it is ignored by Git and should stay local-only.
- Do not migrate seeded development owner rows into production data; delete them from any database that is not strictly local.
- Likes/bookmarks tables exist (`V7`). Keep health tracking, progress photo metadata, and other unapproved persisted features out until explicitly planned.

Future user/auth model direction:

- Store password hashes only, never plaintext passwords or password confirmations.
- Owner seed uses the same password hashing and role storage as normal accounts.
- Production owner/admin creation should be designed as a separate secure process before launch.
- Use a structured country/region code when possible for admin reporting and localization, not exact location.
- Support an `Other` country/region value instead of forcing an inaccurate choice.
- Keep country/region separate from sensitive health profile data.
- Keep health details out of the base user table; use separate optional profile/tool tables only after visibility, deletion/export, and moderation rules are defined.

Approved user/auth data direction:

- Use UUID primary keys for user-facing persisted entities.
- Store lowercase unique email.
- Store display name separately from email.
- Store `password_hash`, never raw passwords.
- Store country/region as a code from the frontend picker, including support for `OTHER`.
- Store account status values such as `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `BANNED`, and `DELETED`.
- Store timestamps such as `created_at`, `updated_at`, `email_verified_at`, `last_login_at`, and `deleted_at`.
- Support roles `OWNER`, `ADMIN`, `MODERATOR`, and `USER`.
- Prefer a join table for user roles so role changes remain flexible.
- Store email verification tokens hashed or store only a hashed selector/token value.
- Store refresh/session records with hashed refresh tokens, device/client metadata, expiry, revocation timestamp, and rotation/replacement tracking.

Deleted and banned account data direction:

- Use soft delete for user accounts at first.
- Public forum author display should show `Deleted account` for deleted users.
- Public forum author display should show `Banned account` for banned users.
- Keep retained user rows for audit, moderation history, and relational integrity.
- Normal admin/moderator product views should not expose deleted-user personal profile details.
- Site owner/database owner can access retained records when needed.
- Define GDPR export, deletion, anonymization, and permanent purge policy before public launch.

## Sensitive Data

Treat these as sensitive:

- Weight logs
- Progress photos
- GLP-1 notes
- Side-effect journals
- Health-related posts
- Private journey logs

Before implementing sensitive data:

- Decide visibility defaults.
- Decide deletion/export behavior for GDPR.
- Decide moderation visibility.
- Decide whether data is public, private, or limited to trusted users.

## Images

Do not store image binaries in PostgreSQL.

Use object storage later and store metadata only:

- URL or storage key
- Owner user ID
- Related post/log ID
- Visibility
- Upload timestamp
- Moderation status

Possible storage providers:

- Cloudflare R2
- AWS S3
- Supabase Storage
- DigitalOcean Spaces

## Search

Use PostgreSQL search for MVP.

Do not add Meilisearch, Typesense, or Algolia until search becomes an actual product need.
