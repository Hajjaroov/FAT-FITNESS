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
- Navigation should stay simple for now: `Home`, `Learn`, and `Community`.
- German user-facing copy should use proper German characters such as `ä`, `ö`, `ü`, and `ß`, not ASCII fallbacks like `ae`, `oe`, `ue`, or `ss`.
- `Learn` has a static overview page plus initial detail pages for `Food & Diet`, `Training`, and `Medical Journey`.
- `/community` is the static forum index for the future forum-style community.
- `/community/guidelines` is a static community guidelines page for safety and behavior rules.
- Community category routes are static empty board pages for planned forum boards.
- Community post detail routes are still placeholders until real forum mechanics are approved.
- `/login` and `/register` are styled static account-prep pages only.
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

### Learn

This is the structured learning/content area. Public-facing language should use `Learn` instead of `Knowledge Base`, because the project is personal and beginner-friendly rather than an expert help center.

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
- `/community/categories/[slug]` generates static empty board pages for the planned forum categories.
- It shows forum boards with topics/replies/latest columns.
- It does not allow posting, accounts, comments, persistence, or moderation actions yet.
- Post routes remain placeholders until implementation is intentionally approved.

### User Accounts

User accounts are the next planning milestone after the static community/forum shape and frontend auth placeholders.

Current state:

- `/login` and `/register` are static frontend pages.
- The pages show disabled form fields with a short account-unavailable message.
- Registration preview includes display name, email, searchable country/region picker, password, confirm password, and rules/privacy agreement.
- The country/region picker lets users search and select country/region names, keeps codes internal, shows up to 9 suggestions plus `Other`, and includes commonly missed entries such as Syria, Iran, Sudan, Palestine, Taiwan, and Kosovo.
- No credentials or account data are collected.
- Backend auth persistence foundation exists: users, role storage, email verification token storage, and refresh-token session storage.
- `POST /api/auth/register` exists as the first backend auth endpoint.
- Registration currently creates pending accounts and returns a development-only raw verification token for local testing.
- No frontend form submission, verify-email endpoint, real email delivery, token issuing, or real account session exists yet.

Approved auth direction:

- Use an API-first auth model because the Spring Boot API should serve the website now and mobile/desktop apps later.
- Use short-lived JWT access tokens for API authentication.
- Use refresh tokens with server-side session/device records so logout, bans, and token revocation are possible.
- Store refresh tokens hashed in the database, not as plaintext.
- Rotate refresh tokens on refresh.
- Web clients should use secure `HttpOnly`, `Secure`, `SameSite` cookies for refresh handling where possible.
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
- Agreement to community rules and privacy terms before posting opens.

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

Later, not MVP.

Possible tools:

- Weight tracker
- Progress photo timeline
- Workout log
- Meal log
- Habit tracker
- GLP-1 injection/side-effect journal
- Weekly check-in
- BMI/weight-loss calculator
- Goal planner

These tools involve sensitive health-related data, so they should be planned carefully before implementation.

## MVP Scope

Build in this order:

1. Homepage with integrated story and journal
2. Learn
3. Community
4. User accounts
5. Forum categories, posts, and comments
6. Likes/bookmarks
7. Reporting and moderation
8. PWA
9. Tracking tools
10. React Native / Expo mobile app later

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
- It should later be supported by real reporting, moderation actions, Terms of use, privacy pages, and medical disclaimer pages.

Community rules should include:

- No medical advice as fact
- No shaming
- No extreme diet promotion
- No steroid/supplement scams
- No harassment
- No "you must do X" coaching
- Encourage doctor consultation for medication topics

For GLP-1 content, personal experience is okay. Do not tell people whether they should use it, how to dose it, or how to get it.

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

Continue the user accounts foundation from the approved auth plan before implementing forum posting, comments, reports, or moderation mechanics.

Completed-enough checkpoints for now:

- Homepage owns the landing, personal story, and journal direction.
- Learn has static overview and detail pages for `Food & Diet`, `Training`, and `Medical Journey`.
- `/community` has been reworked into a static forum index with planned boards and zero-state forum metadata.
- `/community/guidelines` exists as the static behavior/safety page.
- `/community/categories/[slug]` generates static empty board pages.
- `/login` and `/register` exist as static disabled account-prep pages.
- Backend auth persistence foundation exists with Flyway migration, JPA entities, repositories, password hashing, and deleted/banned public display-name behavior.
- `POST /api/auth/register` exists and creates pending accounts with hashed password storage plus hashed email verification token storage.
- German user-facing copy should use proper German characters such as `ä`, `ö`, `ü`, and `ß`, not ASCII fallbacks like `ae`, `oe`, `ue`, or `ss`.

Approved auth implementation goals:

- Implement API-first auth endpoints and token issuing with short-lived JWT access tokens and refresh-token session records.
- Support web, mobile, and future desktop clients through the shared Spring Boot API.
- Require email verification before posting or other account-only community actions.
- Define roles before persistence: `OWNER`, `ADMIN`, `MODERATOR`, and `USER`.
- Define password hashing, email uniqueness, account status, and basic validation.
- Define soft-delete and banned-user display behavior before forum posts rely on authors.
- Define privacy/GDPR expectations before collecting real account data: deletion/export, visibility, moderation access, and country/region handling.
- Keep planned registration minimal: display name, email, country/region code from the picker, password confirmation validation, and rules/privacy agreement.
- Keep health-sensitive data out of initial registration.
- Do not add forum posts, comments, likes/bookmarks, reporting, moderation actions, tracking tools, or sensitive health data until accounts and privacy rules are intentionally designed.
- Do not frame diet, training, supplements, GLP-1, or OP/surgery topics as advice or guaranteed methods.

Content direction:

- Current Learn pages: overview, `Food & Diet`, `Training`, and `Medical Journey`.
- `Food & Diet` uses the diet and supplement source material in `docs/content-notes.md`.
- `Training` uses the extracted workout PDF source material in `docs/content-notes.md`, but exact current loads should be verified before publishing.
- `Training` can include exercise photo placeholders, but real images should be reviewed before publishing.
- `Medical Journey` can use the GLP-1 timeline in `docs/content-notes.md`, but must stay especially careful.
- Current Community page: static forum index with planned boards and zero-state forum metadata.
- Current Community Guidelines page: static rules, health-topic boundaries, and future moderation expectations.
- Current Community Category pages: static empty board pages for each planned forum category.
- Current Login/Register pages: static disabled account-prep pages.
- Photos and deeper tools can be added later after the static content is reviewed.
