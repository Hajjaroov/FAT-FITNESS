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

- `backend/fitness-api/src/main/resources/db/migration`

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
- Knowledge base articles if not MDX-only
- Forum categories
- Forum posts
- Comments
- Likes
- Bookmarks
- Reports
- Moderation actions
- Weight logs later
- Progress image metadata later

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
