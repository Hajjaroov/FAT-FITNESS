# Database Notes

## Current Database

Local development uses PostgreSQL through Docker Compose:

- Service: `postgres`
- Container: `fitness_postgres`
- Database: `fitness_db`
- User: `fitness_user`
- Version: PostgreSQL 18

Compose file:

- `infrastructure/docker-compose.yml`

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
- The latest applied migration is `V10`. The next new migration must be `V11`.

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
