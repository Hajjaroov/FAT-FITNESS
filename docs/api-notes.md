# API Notes

## Current API

### `GET /api/status`

Purpose:

- Verify backend availability.
- Verify frontend-to-backend connection.
- Verify CORS from local Next.js frontend.

Response shape:

```json
{
  "service": "fatfitness-api",
  "status": "UP",
  "timestamp": "2026-06-08T16:49:06.581076400Z"
}
```

This endpoint is public.

### `POST /api/auth/register`

Purpose:

- Create a minimal user account.
- Store the password as a hash.
- Start the account as `PENDING_EMAIL_VERIFICATION`.
- Create an email verification token record.

Request shape:

```json
{
  "displayName": "New Member",
  "email": "new@example.com",
  "countryRegionCode": "DE",
  "password": "very-secret-password",
  "confirmPassword": "very-secret-password",
  "acceptedCommunityRules": true,
  "acceptedPrivacyPolicy": true
}
```

Current development-only response shape:

```json
{
  "userId": "2abda4f4-8f0d-4988-9b0e-1a76f43c83e2",
  "email": "new@example.com",
  "status": "PENDING_EMAIL_VERIFICATION",
  "message": "Account created. Verify email before posting or using account-only community features.",
  "devEmailVerificationToken": "raw-dev-only-token",
  "verificationExpiresAt": "2026-06-12T12:00:00Z"
}
```

This endpoint is public. The raw `devEmailVerificationToken` exists only so local development can continue before an email provider is configured. The database stores the hashed token, not the raw token.

## API Principles

- REST API from Spring Boot backend.
- Frontend consumes API through `NEXT_PUBLIC_API_BASE_URL`.
- Keep response shapes explicit and typed in the frontend.
- Validate request bodies with Spring Validation when write endpoints are added.
- Keep public endpoints clearly separated from authenticated endpoints later.
- Do not add auth-only API behavior until authentication is planned.
- Do not expose internal exception details to clients.

## Planned API Areas

Not all of these should be built now.

### Public Content

Likely later endpoints:

- `GET /api/content/journey`
- `GET /api/blog/posts`
- `GET /api/blog/posts/{slug}`
- `GET /api/learn/sections`
- `GET /api/learn/sections/{slug}`
- `GET /api/learn/articles`
- `GET /api/learn/articles/{slug}`

These are future options only if separate content sections are intentionally introduced later.

For the current homepage content, prefer static frontend content unless there is a clear need for backend persistence.

Planned Learn sections:

- `food-and-diet`
- `training`
- `medical-journey`

Supplements usually belong under `food-and-diet`. Cross-reference or move them under `medical-journey` when they are tied to blood tests, deficiencies, prescriptions, OP/surgery preparation or recovery, medication interactions, GLP-1 side effects, or doctor guidance.

### Community

Likely MVP endpoints later:

- `GET /api/community/categories`
- `GET /api/community/categories/{slug}`
- `GET /api/community/posts`
- `POST /api/community/posts`
- `GET /api/community/posts/{id}`
- `POST /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/reports`

Community APIs must include moderation/reporting from the first community milestone.

### Moderation

Likely endpoints later:

- `GET /api/moderation/reports`
- `POST /api/moderation/reports/{id}/resolve`
- `POST /api/moderation/posts/{id}/hide`
- `POST /api/moderation/posts/{id}/lock`
- `POST /api/moderation/users/{id}/ban`

### Users And Auth

Approved next implementation area:

- Register/login
- API-first JWT access tokens with refresh-token sessions
- Roles: `OWNER`, `ADMIN`, `MODERATOR`, `USER`
- Google login later

Auth model:

- Use short-lived JWT access tokens for API authentication.
- Use refresh tokens backed by server-side session/device records.
- Store refresh tokens hashed in the database.
- Rotate refresh tokens when they are used.
- Web clients may use secure `HttpOnly`, `Secure`, `SameSite` cookies for refresh handling.
- Mobile and desktop clients should use secure platform storage for refresh tokens.
- API requests should use `Authorization: Bearer <accessToken>`.
- Do not store tokens in browser `localStorage`.
- Ban, delete, logout, and password-change flows should be able to revoke sessions.

Current implemented auth endpoint:

- `POST /api/auth/register`

Next auth endpoint slice:

- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Planned registration shape when auth is approved:

- `displayName`
- `email`
- `countryCode` or coarse `countryRegion` from the frontend country/region picker
- `password`
- accepted community rules / privacy terms flags

Do not send or store `confirmPassword` as account data. Use it only for client-side or request validation.

Registration policy:

- Signup is open.
- Accounts start as `PENDING_EMAIL_VERIFICATION`.
- Users must verify email before posting or using account-only community actions.
- Basic account statuses should include `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `BANNED`, and `DELETED`.

Deleted and banned account API behavior:

- Public author display for deleted users should return `Deleted account`.
- Public author display for banned users should return `Banned account`.
- Normal admin/moderator APIs should not expose deleted-user personal profile details by default.
- Owner-level or direct database access may retain deleted-user records for audit/data-integrity needs.
- GDPR export/deletion and permanent purge behavior must be designed before launch.

Country/region API direction:

- Prefer structured country/region codes over raw free text.
- Support the frontend `Other` value for people whose location is not represented well by the list.
- Do not infer exact location from IP address for this basic registration flow.

Do not include sensitive health/profile fields in the initial register endpoint. Weight, GLP-1 status, OP/surgery status, photos, goals, diet, and training details should be optional profile/tool data only after privacy and visibility rules are planned.

Current frontend-only state:

- `/login` and `/register` exist as disabled static pages.
- Register previews display name, email, searchable country/region picker, password, confirm password, and rules/privacy agreement.
- They do not submit credentials and do not call an API.

Current backend auth state:

- Auth persistence foundation exists with users, user roles, email verification tokens, and refresh-token session records.
- Password hashing support exists.
- `POST /api/auth/register` exists as a backend-only development slice.
- Register creates a pending account, hashes the password, stores a hashed email verification token, and returns the raw verification token only in the development response.
- No verify-email endpoint, resend endpoint, login endpoint, JWT issuing, refresh flow, email sending, or frontend form submission exists yet.

Email provider direction:

- Real email delivery should be added later through a dedicated provider integration, likely Resend if the existing account/domain setup fits.
- Use environment variables for provider keys, for example `RESEND_API_KEY`; never commit email provider keys.
- Prefer a separate API key for Fat Fitness instead of sharing a portfolio-site key long term.
- Use a verified sending domain or subdomain before public launch.
- Remove the raw `devEmailVerificationToken` response before production email verification is enabled.

## Health And Safety API Guidance

Health-sensitive areas such as GLP-1, weight logs, progress photos, and side-effect journals require extra care.

Before implementing APIs for health-related user data:

- Define privacy expectations.
- Define deletion/export behavior.
- Define visibility rules.
- Define moderation and reporting paths.
- Avoid medical recommendation logic.
