# Tech Stack

## Chosen Architecture

Use a separated full-stack architecture:

```text
Next.js Web App
        |
        | REST API
        v
Spring Boot Backend
        |
        v
PostgreSQL
```

Later, a React Native / Expo app can use the same Spring Boot API.

## Frontend

Use:

- Next.js
- TypeScript
- React
- App Router
- Tailwind CSS

Frontend rules:

- Consume the backend through `NEXT_PUBLIC_API_BASE_URL`.
- Keep API calls centralized in `src/lib/api.ts`.
- Keep API base configuration in `src/lib/config.ts`.
- Keep placeholder pages minimal until a route gets an approved milestone.
- Start content as static frontend content unless backend persistence is needed.
- Use shared frontend styling primitives and CSS variables for light/dark theme support.
- Keep public copy/data in `src/content` modules instead of embedding long text directly in route components.
- Use the lightweight local language foundation for now; do not add an i18n package until routing, SEO, or translation workflow needs justify it.
- Keep available languages in `src/content/site.ts` as dropdown options; adding a language also requires matching content dictionaries.

## Backend

Use:

- Spring Boot
- Java 21
- Spring Web MVC
- Spring Data JPA
- Spring Security
- Validation
- Flyway
- PostgreSQL driver
- Lombok where useful

Backend rules:

- Expose REST APIs.
- Use feature-based package structure.
- Use `com.fatfitness.api` as the Java base package.
- Keep `/api/status` public and minimal.
- Authentication is now planned as an API-first token model for web, mobile, and possible desktop clients.
- Use short-lived JWT access tokens plus refresh-token session records when auth is implemented.
- Store refresh tokens hashed and support revocation/rotation.
- Do not couple backend auth to Next.js-only sessions.
- Do not add entities until a feature needs persistence.
- Add tests for endpoint behavior and security/CORS expectations.

## Database

Use:

- PostgreSQL 18
- Flyway migrations

Database rules:

- Use PostgreSQL for relational product data.
- Use Flyway for schema changes.
- Do not use MongoDB for this app by default.
- Do not store images in PostgreSQL.
- Store image metadata in PostgreSQL and files in object storage later.

## Content

Start with:

- Static pages
- Local typed content modules in the frontend
- MDX later for Learn content if static pages become hard to maintain

Do not add a CMS yet.

Possible later CMS options:

- Sanity
- Strapi
- Directus
- Payload CMS

## Images And Storage

Later, use object storage for:

- Avatars
- Blog images
- Food photos
- Progress photos
- Community uploads

Possible providers:

- Cloudflare R2
- AWS S3
- Supabase Storage
- DigitalOcean Spaces

Progress photos are sensitive. Add privacy controls before allowing uploads.

## Search

MVP:

- Basic PostgreSQL search is enough.

Later:

- Meilisearch
- Typesense
- Algolia

Do not add a search engine yet.

## Notifications

MVP:

- No complex notification system.

Later:

- In-app notifications
- Email notifications
- Push notifications
- Weekly digest

## Mobile

Do not build mobile now.

Recommended path:

1. PWA support in the Next.js app
2. React Native / Expo later
3. Native Kotlin/Swift only if there is a strong future reason

## Deployment Direction

Simple product-first path:

- Frontend: Vercel
- Backend: Render, Railway, Fly.io, Hetzner, or DigitalOcean
- Database: managed PostgreSQL
- Images: Cloudflare R2 or Supabase Storage

Learning/portfolio path later:

- Dockerized frontend and backend
- VPS such as Hetzner
- Caddy or Nginx
- PostgreSQL backups
- GitHub Actions CI/CD

Do not make DevOps the main project before the product has useful content.
