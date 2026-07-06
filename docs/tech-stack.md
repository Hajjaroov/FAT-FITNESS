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
- Frontend auth keeps JWT access tokens in React memory only and restores web sessions through the backend `HttpOnly` refresh cookie.
- Do not store access or refresh tokens in browser `localStorage`.
- Shared header session controls read from the frontend auth provider.
- `/dashboard` uses the existing frontend auth provider for account/session visibility and stays frontend-only for now.
- Community pages consume the forum APIs for published post lists, category thread lists, post detail reads, signed-in create-thread forms, signed-in post reports, reply lists, signed-in reply forms, and signed-in reply reports.
- `/admin` consumes moderation APIs for role-gated report list/filter/hide/resolve/dismiss/lock/ban workflows.
- Pass `accessToken` to API calls that return user-specific fields such as `likedByCurrentUser` and `bookmarkedByCurrentUser`; wait for `authStatus !== "checking"` before fetching so the backend can identify the current user.

## Dark Mode Architecture

Tailwind CSS v4 uses `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css`. This requires the `.dark` CSS class on `<html>` — **not** a `data-theme` attribute. The attribute approach does not override `@media (prefers-color-scheme: dark)`, causing dark utilities to bleed into light mode when the OS is dark.

Implementation:

- `globals.css`: `@custom-variant dark (&:where(.dark, .dark *))` and `:root.dark { … }` for dark CSS variable overrides.
- `layout.tsx`: Blocking `<script>` in `<head>` reads `localStorage` and calls `document.documentElement.classList.add('dark')` before React hydrates, preventing a flash of unstyled content.
- `ThemeProvider.tsx`: Reads the class back from the DOM on first rAF tick (`classList.contains("dark")`), sets `hasHydrated`, then on subsequent changes calls `classList.toggle("dark")` and writes to `localStorage`. The `hasHydrated` guard prevents the `useState("light")` default from overwriting the stored value on first render.
- `LocaleProvider.tsx`: Same `hasHydrated` pattern applied to locale persistence so navigating to the landing page does not reset the chosen language.

Rules:

- Do not use `data-theme` or `dataset.theme` for the app theme — use `.dark` class on `<html>` exclusively.
- Any new provider that reads a persisted user preference on mount must use the `hasHydrated` pattern to avoid overwriting stored state before the async read fires.

## Light Mode Contrast

The app's warm cream surface (`#fffaf1` / `--color-surface`) makes Tailwind `*-100` background shades nearly invisible. Use `*-200` or stronger for badge/pill backgrounds in light mode. In `AdminModerationView.tsx`, status badge classes use explicit `bg-amber-200`, `bg-emerald-100`, `bg-slate-200` for light mode with `dark:bg-*-500/15` overrides for dark mode.

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
- Use `HttpOnly`, `SameSite` refresh cookies for web clients; enable `Secure` in production.
- Keep JSON refresh tokens available for future non-web clients that use secure platform storage.
- Do not couple backend auth to Next.js-only sessions.
- Do not add entities until a feature needs persistence.
- Add tests for endpoint behavior and security/CORS expectations.
- Forum category metadata is now persisted with Flyway and exposed through public read-only REST endpoints.
- Forum top-level posts and post reports are persisted with Flyway; authenticated write endpoints use bearer-token validation.
- Forum flat comments and comment reports are persisted with Flyway; authenticated write endpoints use bearer-token validation.
- Moderator report review/resolution/hide endpoints use bearer-token validation plus persisted role checks for `OWNER`, `ADMIN`, and `MODERATOR`.
- Email verification uses real delivery via Resend: registration emails a verification link and stores only the hashed token; no raw token is returned in any response. Without a `RESEND_API_KEY` (local dev), the link is logged to the console instead.
- `POST /api/auth/verify-email` consumes valid verification tokens and activates pending accounts.
- `POST /api/auth/resend-verification` creates a fresh verification token and emails it, without revealing whether the email exists.
- `POST /api/auth/login` issues Spring Security JWT access tokens and stores hashed refresh-session records.
- `POST /api/auth/refresh` rotates refresh-session records and revokes old refresh tokens.
- `POST /api/auth/logout` revokes refresh sessions idempotently.
- Web login/refresh/logout can use an `HttpOnly` refresh cookie and CORS credentials from the local frontend origin.
- `GET /api/auth/me` is protected by Spring Security bearer-token validation and returns the current active user.
- JWT signing uses `spring-security-oauth2-jose`; bearer-token validation uses `spring-security-oauth2-resource-server`; production must provide `FATFITNESS_JWT_SECRET`.
- Local owner seeding is available through `FATFITNESS_OWNER_EMAIL`, `FATFITNESS_OWNER_DISPLAY_NAME`, `FATFITNESS_OWNER_COUNTRY_REGION_CODE`, and `FATFITNESS_OWNER_PASSWORD`; do not commit real owner credentials.
- `backend/fatfitness-api/.env` is loaded by Gradle `bootRun` for local backend development; `.env.example` documents the available local values.
- The owner seed is development-only. Remove or disable it before production launch and do not migrate seeded dev owner rows into production.
- Add real transactional email later through a provider such as Resend, using environment variables for secrets and a verified sending domain or subdomain.
- Remove dev-only raw verification token responses before production launch.

## Testing

Backend (in place):

- MockMvc-based integration tests — every feature gets its own `*ControllerTests` class hitting the real Spring context and a real Postgres transaction (rolled back per test via class-level `@Transactional`), not isolated unit tests of services/repositories.
- Run with `.\gradlew.bat test --no-daemon` from `backend/fatfitness-api/`. 203 tests passing as of `/myplan` Phase 2 (Diet, V14) — see `docs/dev-agent-plan.md`'s "Backend Test Coverage" section for what each class covers.
- Auth helper pattern: a private `registerVerifyAndLogin(email)` (and `registerVerifyAddRoleAndLogin(email, role)` for moderator/owner-role tests) drives the real register → verify-email → login endpoints to get a bearer token, rather than mocking authentication.

Frontend (planned, not started):

- No test framework exists yet — no Jest/Vitest/Playwright, no `test` script in `package.json`.
- Agreed direction: **Vitest + React Testing Library** first, for component-level tests (fast, Vite-native tooling, officially supported for Next.js App Router, does not change Next's own Turbopack build). **Playwright** later, for full browser end-to-end flows (e.g. login → add a meal → see totals update).
- Start with component tests for the `/myplan` Diet phase (`MyPlanDietView.tsx`, `FoodCombobox.tsx`, `AdminMacroChecksView.tsx`) once picked up, then expand coverage to the rest of the frontend.
- Deliberately deferred to its own separate session/commit rather than bundled into the Diet feature commit. Do not set this up proactively — wait for it to be explicitly requested.

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
- The `/myplan/diet` shared food catalog starts empty and grows only from user-added custom foods — no bulk/external data import. A USDA SR Legacy bulk import was researched and built, then rolled back after manual testing showed poor suggestion quality; see `docs/dev-agent-plan.md` for the full history.

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
