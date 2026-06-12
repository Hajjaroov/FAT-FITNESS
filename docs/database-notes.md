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
- Bearer-token validation is wired for `/api/auth/me`; broader protected feature endpoints and real email delivery are not implemented yet.

Current community/forum state:

- The second Flyway migration creates `forum_categories`.
- The MVP board list is seeded as active forum categories with stable slugs and display order.
- `GET /api/community/categories` and `GET /api/community/categories/{slug}` read this category metadata.
- Forum posts, comments, likes/bookmarks, reports, and moderation actions do not have tables yet.

Next user/auth step:

- Add a real email provider later, likely Resend, with keys supplied through environment variables and no secrets committed to Git.
- Add password reset data model and rate-limiting strategy before public launch.
- Add bearer-token validation to future protected feature endpoints before connecting account-only frontend features.
- Keep local owner seed credentials outside Git; use environment variables for local development.
- `backend/fatfitness-api/.env` can hold local owner seed values for `bootRun`; it is ignored by Git and should stay local-only.
- Do not migrate seeded development owner rows into production data; delete them from any database that is not strictly local.
- Start the first approved forum write-flow planning step only after category API review.
- Keep forum posts/comments out of the first auth migration.

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
