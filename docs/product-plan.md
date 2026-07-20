# Product Plan

## Positioning

Fat Fitness Community is a personal weight-loss journey and peer-support platform.

Use this framing:

> I am not a coach or athlete. I am documenting my own weight-loss journey from 203 kg and building a community for people who want realistic, beginner-friendly support.

The product should share personal experience, lessons, experiments, failures, and community discussion. It should not present itself as medical advice, professional coaching, or a guaranteed weight-loss method.

Avoid claims like:

- "I will tell people how to lose weight."
- "You should use this medication/diet/training plan."
- "This is the correct way to lose weight."

Prefer language like:

- "This is what worked for me."
- "This is what failed for me."
- "This is what I am learning."
- "Talk to a qualified professional for medical decisions."

## Product Areas

### Public Website

Purpose: explain the project, build trust, and make the personal journey easy to understand.

Initial pages:

- Homepage
- Community
- Learn
- Disclaimer
- Contact later

Current structure:

- The homepage currently acts as the landing page, story page, and journal surface.
- Separate About / Journey and Blog pages are intentionally omitted for now to avoid duplication.
- Navigation should stay simple for now: `Home`, `Journal`, and `Community`.
- German user-facing copy should use proper German characters such as `ä`, `ö`, `ü`, and `ß`, not ASCII fallbacks like `ae`, `oe`, `ue`, or `ss`.
- `Journal` has a static overview page plus detail pages for `Food & Diet`, `Training`, and `Medical Journey`.
- `/community` is the static forum index for the future forum-style community.
- `/community/guidelines` is a static community guidelines page for safety and behavior rules.
- Community category routes show board-level thread lists and create-thread entry points.
- Community post detail routes read published top-level posts from the backend API.
- `/login` and `/register` are styled account pages connected to the local backend auth flow.
- `/dashboard` is a frontend account/session dashboard for the current signed-in user.
- Public pages now use a shared frontend shell with light/dark mode and a language switch foundation.
- Page copy/data should live in frontend content modules instead of long hardcoded text blocks in route TSX files.

### Homepage Story / Journal

This is public content rooted in personal experience.

Examples:

- My weight-loss journey from 203 kg
- Weekly progress updates
- What I ate this week
- Training as a very overweight beginner
- Mistakes I made
- GLP-1 experience: side effects, appetite, habits, mental side
- Product reviews for benches, dumbbells, food tracking apps, protein products

Current content approach:

- Homepage: project introduction, core story, key disclaimers, and journal direction.
- Journal content: updates, reflections, experiments, product reviews, lessons, and progress notes over time.
- Separate story/blog pages should only be introduced later if there is enough distinct content to justify them.

### Journal

This is the structured learning/content area. Public-facing language should use `Journal` instead of `Knowledge Base` or `Learn`, because the project is personal and beginner-friendly rather than an expert help center.

Use three main sections:

#### Food & Diet

Purpose: explain personal diet experience, food structure, supplements, and practical nutrition reflections without presenting a universal diet plan.

Possible content:

- Personal diet overview
- Current personal diet example captured in `docs/content-notes.md`
- What worked and what failed
- Simple meal ideas
- High-protein food list
- Supplements used as part of nutrition habits
- Product reviews for protein products, food tracking apps, and similar tools
- Later: a nutrition-target tool that helps generate similar meal structures for selected goals

Supplements rule:

- Put supplements under `Food & Diet` when they are general nutrition or habit topics, such as protein powder, electrolytes, fiber, creatine, vitamins, or meal replacements.
- Move or cross-reference supplements under `Medical Journey` when they are tied to blood tests, deficiencies, prescriptions, OP/surgery preparation or recovery, medication interactions, GLP-1 side effects, or doctor guidance.

#### Training

Purpose: explain personal training experience from a high starting weight and provide beginner-friendly exercise references.

Possible content:

- Current training situation
- Training 3-4 times per week
- Beginner exercise library
- Dumbbell workouts for overweight beginners
- Exercise photos later
- Gym anxiety / starting at high weight
- Equipment and tool reviews

#### Medical Journey

Purpose: document personal medical context without giving medical advice.

Possible content:

- GLP-1 experience from a personal perspective
- OP/surgery situation and reflections, if relevant
- Shot timeline and weight reached at different points
- Side effects and questions to discuss with a qualified professional
- Things learned from doctor conversations
- Weight tracking basics where it connects to medical context

Learn content must be careful with health claims. It can organize personal learning and general educational information, but it should avoid giving medical instructions, dosing instructions, or claims that one method is correct for everyone.

### Community

Start with a forum-style community.

Current state:

- `/community` is a static forum index page.
- `/community/guidelines` is a static guidelines page.
- `/community/categories/[slug]` generates category pages for the planned forum boards and loads published threads from the API.
- It shows forum boards with topics/replies/latest columns.
- Backend forum categories are persisted and exposed through public read-only API endpoints.
- Backend can create and read top-level posts and accept post reports for active authenticated users.
- Backend can create and read flat comments and accept comment reports for active authenticated users.
- Backend can list, resolve/dismiss, hide reported post/comment content, lock posts, and ban users for active `OWNER`, `ADMIN`, or `MODERATOR` accounts.
- The frontend can list/read published posts, create top-level threads for signed-in verified users, report published threads, list replies, create replies, and report replies.
- The frontend `/admin` page can list, filter, hide reported content, lock threads, ban users, resolve, and dismiss post/comment reports for moderator roles.
- Post detail pages use SVG icon buttons (thumbs-up for like, bookmark for save) with counts; like/bookmark state restores correctly after page refresh when auth resolves.
- Thread report uses a modal overlay instead of a sidebar form; comment report uses an inline modal per comment.
- Likes/bookmarks UI is wired; backend endpoints exist.

### User Accounts

User accounts are the current foundation milestone after the static community/forum shape.

Current state:

- `/login` and `/register` are frontend account pages connected to the backend auth APIs.
- `/login` submits credentials, keeps the JWT access token in React memory, restores through the web refresh cookie, and can log out.
- The shared site header shows sign-in/signed-in/logout state from the frontend auth provider.
- The signed-in header name links to `/dashboard`, which shows the current account summary and logout.
- `/register` submits display name, email, searchable country/region picker, password, confirm password, and rules/privacy agreement.
- `/dashboard` is frontend-only and uses the current auth provider; it does not add profile editing or collect health details.
- The country/region picker lets users search and select country/region names, keeps codes internal, shows up to 9 suggestions plus `Other`, and includes commonly missed entries such as Syria, Iran, Sudan, Palestine, Taiwan, and Kosovo.
- Backend auth persistence foundation exists: users, role storage, email verification token storage, and refresh-token session storage.
- `POST /api/auth/register` creates a pending account and sends a real verification email via Resend; no raw dev token is returned in the response.
- `POST /api/auth/verify-email` activates pending accounts with valid unexpired tokens.
- `POST /api/auth/resend-verification` sends a fresh verification email without revealing whether the address exists.
- `POST /api/auth/login` issues JWT access tokens and refresh sessions; web clients receive refresh tokens through `HttpOnly` cookies.
- `POST /api/auth/refresh` rotates refresh-session records.
- `POST /api/auth/logout` revokes refresh sessions idempotently.
- `GET /api/auth/me` is the protected current-user endpoint.
- `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` exist with rate limiting; frontend pages `/forgot-password` and `/reset-password` are connected.
- `/verify-email` reads `?token=` and shows success or error state.
- Web refresh-token handling uses an `HttpOnly` cookie; future mobile/desktop clients use JSON refresh tokens with secure platform storage.
- Local development can seed one active `OWNER` account from environment variables without committing credentials.
- The local owner seed is only for development. It must be removed or disabled before public launch, and any seeded dev owner must not be copied into production data.
- Rate limiting is applied to login (10/15 min), resend-verification (5/hour), forgot-password (5/hour), and reset-password (10/15 min). Disabled in tests via `fatfitness.auth.rate-limit.enabled=false`.
- `/settings` page has three sections: Profile (display name + country/region edit), Change password, and Active sessions (sign out all devices). Linked from `/dashboard`.
- `PATCH /api/users/me/profile`, `POST /api/users/me/change-password`, and `POST /api/users/me/sessions/revoke-all` are authenticated endpoints backing the settings page.
- Flyway migrations V1–V18 are applied; next new migration is V19. (See `docs/database-notes.md` for the current migration history — this section predates several later milestones.)

Approved auth direction:

- Use an API-first auth model because the Spring Boot API should serve the website now and mobile/desktop apps later.
- Use short-lived JWT access tokens for API authentication.
- Use refresh tokens with server-side session/device records so logout, bans, and token revocation are possible.
- Store refresh tokens hashed in the database, not as plaintext.
- Rotate refresh tokens on refresh.
- Web clients should use `HttpOnly`, `SameSite` cookies for refresh handling, with `Secure` enabled in production.
- Mobile and desktop clients should use secure platform storage for refresh tokens and send access tokens with `Authorization: Bearer <token>`.
- Do not store access or refresh tokens in browser `localStorage`.

Approved registration direction:

- Signup should be open.
- Users must confirm their email before they can post or use account-only community actions.
- Registration remains minimal and should not collect health-sensitive details.
- Initial roles should be `OWNER`, `ADMIN`, `MODERATOR`, and `USER`.
- Account statuses should include at least `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `BANNED`, and `DELETED`.
- Real email delivery should be added later with a provider such as Resend, using environment variables for secrets and a verified sending domain or subdomain.
- The current raw development verification token response must be removed before production email verification is enabled.

Deleted and banned account display:

- Public forum display for deleted users should show `Deleted account`.
- Public forum display for banned users should show `Banned account`.
- Posts/comments can remain visible by default unless moderation removes them.
- User rows should be soft-deleted with a deleted status and timestamp instead of immediate hard deletion.
- Normal admin/moderator views should not expose deleted-user personal profile details.
- Retained deleted-user records are for the site owner/database owner and required audit/data-integrity needs.
- GDPR deletion/export and any permanent purge policy must be defined before launch.

Purpose before real auth:

- Make the future account flow visible.
- Keep login/register familiar for end users instead of exposing development notes.
- Keep privacy expectations visible before user data is collected.

Planned minimal registration information:

- Display name: public forum name.
- Email: login and account communication.
- Country / region: searchable picker for coarse location, future admin/community insight, and localization.
- Password and confirm password: confirmation is UI validation only and should never be stored separately.
- Agreement to community rules and privacy terms before posting.

Country / region UX:

- Use a searchable text input backed by a maintained country/region list, not an open free-text field.
- Users search and select by country/region name; internal codes must not be shown in the end-user dropdown.
- Show up to 9 matching country/region suggestions plus `Other`.
- Include commonly missed countries and regions such as Syria, Iran, Sudan, Palestine, Taiwan, and Kosovo.
- Store a country/region code later when auth exists; `Other` can be used when someone does not find the right entry.

Do not collect during basic registration:

- Exact address, city, or GPS location.
- Starting weight, current weight, GLP-1 use, OP/surgery status, diet, exercise ability, photos, or medical history.
- Goals or sensitive profile details unless they become clearly optional profile/tool fields later.

Optional profile/badge direction later:

- Goals such as weight loss, muscle gain, or maintenance can become optional profile badges or preferences later.
- GLP-1 and OP/surgery flags are health-sensitive optional profile flags, not registration fields.
- These fields need privacy controls before they are implemented.

Forum categories for MVP:

- Introductions
- Weight-loss journey logs
- Training at high bodyweight
- Diet and meal ideas
- GLP-1 experience
- Questions and support
- Progress wins
- Equipment and tools

MVP community features:

- Categories
- Posts
- Comments
- Likes/bookmarks
- Reporting
- Moderator/admin actions

Not MVP:

- Infinite feed
- Algorithmic ranking
- Karma
- DMs
- Groups
- Stories
- Subreddits
- Native mobile app

### Personal Tools

Built as `/myplan` (see `docs/dev-agent-plan.md` for full implementation detail):

- Weight tracker — DONE (goals + entries + chart, V13)
- Meal log — DONE (`/myplan/diet`, shared food catalog, macro totals, V14)
- Workout log — DONE, built as a weekly **plan maker**, not a session-by-session log (`/myplan/workout`, V15)
- GLP-1 injection/side-effect journal — DONE (`/myplan/glp1`, dose + optional weight + notes, V16)

Not built, no current plan (raise as a new planning discussion if wanted):

- Progress photo timeline
- Habit tracker
- Weekly check-in
- BMI/weight-loss calculator
- Goal planner (beyond the existing start/goal weight fields)

These tools involve sensitive health-related data, so any of the remaining ones should be planned carefully before implementation.

## MVP Scope

Build in this order:

1. Homepage with integrated story and journal
2. Learn
3. Community
4. User accounts
5. Forum categories, posts, and comments
6. Likes/bookmarks
7. Reporting and moderation
8. PWA — DONE (installable shell + push notifications, V18)
9. Tracking tools — DONE (`/myplan`: weight, diet, workout plan maker, GLP-1 log)

The first useful version is:

> A personal weight-loss journey homepage with a focused support forum for overweight beginners, GLP-1 users, and people starting from zero.

## Community Safety

Moderation is required from the beginning of community work.

Risk areas:

- Dangerous dieting advice
- Eating disorder behavior
- Medical misinformation
- Body shaming
- Scam supplement promotion
- Prescription medication misuse
- Before/after photo abuse
- Harassment

Minimum moderation features:

- Report post/comment
- Hide/delete content
- Ban user
- Lock thread
- Pin post
- Moderator notes
- Community rules page
- Medical disclaimer

Current static safety page:

- `/community/guidelines` defines practical community behavior rules before posting exists.
- It is not a complete legal terms page.
- It is now supported by real reporting and backend report resolution, but still needs content moderation actions, Terms of use, privacy pages, and medical disclaimer pages.

Community rules should include:

- No medical advice as fact
- No shaming
- No extreme diet promotion
- No steroid/supplement scams
- No harassment
- No "you must do X" coaching
- Encourage doctor consultation for medication topics

For GLP-1 content, personal experience is okay. Do not tell people whether they should use it, how to dose it, or how to get it.

### Moderation Acceptance Criteria (lock/ban) — implemented

- `POST /api/moderation/posts/{postId}/lock` sets the post to `LOCKED`; locked posts reject new comments.
- `POST /api/moderation/users/{userId}/ban` sets account status to `BANNED`.
- Banning a user revokes all refresh sessions (`revokedAt` set via bulk update) and `POST /api/auth/refresh` returns `403 Forbidden` for that user.
- Both endpoints require `OWNER`, `ADMIN`, or `MODERATOR` role (verified against the persisted user record).
- Both endpoints write an audit row to `moderation_actions` with the action, target, and moderator ID.

## Legal And Trust Pages

Plan early, especially for Germany/EU.

Needed before a public community launch:

- Impressum
- Datenschutzerklaerung
- Cookie policy if non-essential cookies are used
- Terms of use
- Community guidelines
- Medical disclaimer
- Content moderation policy
- GDPR data deletion/export process

Treat weight logs, progress photos, GLP-1 notes, and health-related community posts as sensitive data.

## Main Product Risks

- Building too much before anyone uses it
- Making the community too complex
- Letting medical/diet misinformation become a problem
- Not having moderation tools
- Treating mobile apps as necessary too early
- Spending months on infrastructure instead of content and users

The personal story is the strongest asset. The technology should support that, not dominate it.

## Current Product Milestone

**This section is a historical snapshot from the auth-hardening milestone and is not maintained per-release.** For current state, always check `docs/dev-agent-plan.md`'s "Current State" and "Next Milestone" sections instead — as of 2026-07-19, PWA (installable shell + push notifications, V18) is complete and `/myplan` (weight, diet, workout, GLP-1) is feature-complete; the project has no open milestone and no mobile app is planned.

Completed-enough checkpoints for now (as of the auth-hardening milestone; superseded by `docs/dev-agent-plan.md` for anything after):

- Homepage owns the landing, personal story, and journal direction.
- Learn has static overview and detail pages for `Food & Diet`, `Training`, and `Medical Journey`.
- `/community` has been reworked into a static forum index with planned boards and zero-state forum metadata.
- `/community/guidelines` exists as the static behavior/safety page.
- `/community/categories/[slug]` generates category pages and loads published threads from the API.
- Backend forum category persistence exists with seeded MVP boards and public read-only endpoints.
- Backend forum post persistence exists for top-level posts and post reports.
- Backend forum comment persistence exists for flat comments and comment reports.
- Backend moderation report review/resolution and report-scoped content hiding exist for post and comment reports.
- Frontend community pages can list/read published posts, let signed-in verified users create top-level threads, and support reply list/create/report flows on post detail pages.
- `/login` and `/register` exist as working frontend account pages for the local backend auth flow.
- Backend auth persistence foundation exists with Flyway migration, JPA entities, repositories, password hashing, and deleted/banned public display-name behavior.
- `POST /api/auth/register` creates pending accounts and sends a real verification email via Resend; no raw token in the response.
- `POST /api/auth/verify-email` consumes valid verification tokens while activating accounts.
- `POST /api/auth/resend-verification` sends a fresh verification email without revealing whether the email exists.
- `POST /api/auth/login` exists for active users and creates hashed refresh-session records.
- `POST /api/auth/refresh` exists and rotates refresh-session records.
- `POST /api/auth/logout` exists and revokes refresh-session records.
- `GET /api/auth/me` exists and is protected by bearer-token validation.
- Web refresh-token cookie handling exists for login, refresh, and logout.
- Backend startup can seed an active owner account for local development when all owner seed variables are configured.
- Frontend login/register form submission and in-memory access-token session restore exist.
- Shared header account session visibility and logout exist.
- `/dashboard` shows loading, signed-out, and signed-in account states using the existing auth provider.
- Real email delivery is implemented via Resend; no dev token is returned in any response. `POST /api/auth/register` sends a verification email; `POST /api/auth/resend-verification` resends without leaking existence.
- `/verify-email` reads `?token=` from the URL and shows success or error state.
- `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` exist with IP-based rate limiting; `/forgot-password` and `/reset-password` frontend pages are connected.
- `InMemoryRateLimiter` applies sliding-window rate limits: login (10/15 min), resend-verification (5/hour), forgot-password (5/hour), reset-password (10/15 min). Disabled in tests.
- `/settings` page covers display name/country edit, change password, and sign out all devices.
- `PATCH /api/users/me/profile`, `POST /api/users/me/change-password`, `POST /api/users/me/sessions/revoke-all` back the settings page. `CountryCombobox` accepts an `initialCode` prop.
- `AuthProvider` exposes `refreshUser()` to re-fetch `/api/auth/me` and update context after a profile edit.
- Three-pill desktop nav (nav / utility / auth) and mobile burger panel with full nav, locale, theme, and auth. Locale is EN/DE toggle; no native `<select>`. Auth pill shows person icon + display name.
- Successful login redirects to `/community`.
- Journal detail pages are complete: `Food & Diet` (supplement modal with photo, brand, detail, key facts for 8 supplements), `Training` (desktop carousels with thumbnail strip, warm-up and exercise photo system), `Medical Journey` (compact stats row, full GLP-1 log table).
- Weight chart uses a dual chart pattern for responsive layout (mobile angled labels, desktop original horizontal layout).
- German user-facing copy should use proper German characters such as `ä`, `ö`, `ü`, and `ß`, not ASCII fallbacks like `ae`, `oe`, `ue`, or `ss`.

Approved auth implementation goals (all complete):

- Implement API-first auth endpoints with short-lived JWT access tokens, bearer-token validation, and refresh-token session records.
- Support web, mobile, and future desktop clients through the shared Spring Boot API.
- Require email verification before posting or other account-only community actions.
- Auth hardening is complete: rate limiting on login/resend/forgot/reset, and forgot-password/reset-password flow.
- Define roles before persistence: `OWNER`, `ADMIN`, `MODERATOR`, and `USER`.
- Keep owner creation local and credential-safe during development by using environment variables, not committed passwords.
- Replace the development owner seed with a deliberate secure owner/admin setup before launch.
- Define password hashing, email uniqueness, account status, and basic validation.
- Define soft-delete and banned-user display behavior before forum posts rely on authors.
- Define privacy/GDPR expectations before collecting real account data: deletion/export, visibility, moderation access, and country/region handling.
- Keep planned registration minimal: display name, email, country/region code from the picker, password confirmation validation, and rules/privacy agreement.
- Keep health-sensitive data out of initial registration.
- Do not add likes/bookmarks, tracking tools, or sensitive health data until each next slice is intentionally approved.
- Do not frame diet, training, supplements, GLP-1, or OP/surgery topics as advice or guaranteed methods.

Content direction:

- Current Journal pages: overview, `Food & Diet`, `Training`, and `Medical Journey`.
- `Food & Diet` is live with diet stats, meals, and 8 clickable supplement cards (modal with photo, brand, detail, key facts). Source material in `docs/content-notes.md`.
- `Training` is live with desktop carousels (warm-up and per-day exercise carousels with thumbnail strip) and photo system. Exact current loads should be verified with the owner before publishing.
- `Medical Journey` is live with compact stats row and full GLP-1 log table. Stays personal and non-prescriptive per content rules.
- Current Community page: static forum index with planned boards and zero-state forum metadata.
- Current Community Guidelines page: static rules, health-topic boundaries, and future moderation expectations.
- Current Community Category pages: category thread-list pages for each planned forum category.
- Current Community API: `GET /api/community/categories` and `GET /api/community/categories/{slug}` return the seeded board metadata.
- Current Forum Post API: active authenticated users can create top-level posts and report published posts; public users can list/read published posts.
- Current Forum Comment API: active authenticated users can create flat comments and report published comments; public users can list published comments for published posts.
- Current Moderation API: active `OWNER`, `ADMIN`, or `MODERATOR` users can list open/all reports and resolve or dismiss post/comment reports.
- Current Community UI: frontend post lists, category thread lists, post detail rendering, signed-in create-thread form, signed-in report form, reply list, signed-in reply form, signed-in reply report form, and `/admin` report dashboard with hide/resolve/dismiss actions are connected to the API.
- Current Community UI: likes and bookmarks are wired with SVG icon buttons; like/bookmark state restores on refresh via auth-aware fetch; report is a modal on threads and an inline modal on comments; comment report button is right-aligned.
- Current theme system: dark mode uses `.dark` class on `<html>` (not `data-theme` attribute), applied by a blocking `<script>` in `layout.tsx` before hydration; `ThemeProvider` and `LocaleProvider` both use a `hasHydrated` guard to prevent stored preferences from being overwritten on mount.
- Current Login/Register pages: working auth forms with real Resend email delivery. No dev token in any response.
- Current shared header: three-pill desktop layout + mobile burger panel; shows session state, links signed-in users to `/dashboard`, supports logout.
- Current Dashboard page: frontend-only account/session summary for the current browser session.
- Current Owner seed: backend startup can create or ensure a local `OWNER` account from `FATFITNESS_OWNER_EMAIL`, `FATFITNESS_OWNER_DISPLAY_NAME`, `FATFITNESS_OWNER_COUNTRY_REGION_CODE`, and `FATFITNESS_OWNER_PASSWORD`.
- Launch cleanup: remove or disable the owner seed and delete any seeded development owner from non-local databases before the site is public.
- Photos and deeper tools can be added later after the static content is reviewed.
