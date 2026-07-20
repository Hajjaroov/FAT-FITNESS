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

Response shape:

```json
{
  "userId": "2abda4f4-8f0d-4988-9b0e-1a76f43c83e2",
  "email": "new@example.com",
  "status": "PENDING_EMAIL_VERIFICATION",
  "message": "Account created. Verify email before posting or using account-only community features."
}
```

This endpoint is public. No raw verification token is ever returned: the verification link is delivered by email (Resend), and the database stores only the hashed token. In local development without a `RESEND_API_KEY`, the link is logged to the console instead of emailed.

### `POST /api/auth/verify-email`

Purpose:

- Verify a pending account with a raw email verification token.
- Hash the submitted token and compare it to stored token hashes.
- Reject unknown, expired, or already-consumed tokens.
- Mark the token as consumed.
- Mark the user account as `ACTIVE`.

Request shape:

```json
{
  "token": "raw-token-from-email-link"
}
```

Response shape:

```json
{
  "userId": "2abda4f4-8f0d-4988-9b0e-1a76f43c83e2",
  "email": "new@example.com",
  "status": "ACTIVE",
  "emailVerifiedAt": "2026-06-11T12:00:00Z",
  "message": "Email verified. Account-only community features can use this account when they are available."
}
```

This endpoint is public because email verification links must work before login exists. It does not create a session or issue JWTs.

### `POST /api/auth/resend-verification`

Purpose:

- Create a fresh email verification token for a pending account and send it via Resend.
- Keep the response safe for unknown or already-active emails.

Request shape:

```json
{
  "email": "new@example.com"
}
```

Response shape (always identical, regardless of whether the email exists):

```json
{
  "message": "If an unverified account exists for this email, a verification link will be sent."
}
```

This endpoint is public and rate-limited (5/hour per IP). It intentionally does not reveal whether an email address belongs to an account, and never returns a raw token.

### `POST /api/auth/login`

Purpose:

- Authenticate an active user with email and password.
- Reject unknown email or wrong password with `401`.
- Reject pending, banned, or deleted accounts with `403`.
- Issue a short-lived JWT access token.
- Create a refresh session and store only the hashed refresh token.

Request shape:

```json
{
  "email": "new@example.com",
  "password": "very-secret-password",
  "clientType": "WEB",
  "deviceLabel": "Chrome on Windows"
}
```

Response shape:

```json
{
  "userId": "2abda4f4-8f0d-4988-9b0e-1a76f43c83e2",
  "email": "new@example.com",
  "displayName": "New Member",
  "roles": ["USER"],
  "tokenType": "Bearer",
  "accessToken": "jwt-access-token",
  "accessTokenExpiresAt": "2026-06-11T12:15:00Z",
  "refreshToken": "raw-refresh-token",
  "refreshTokenExpiresAt": "2026-07-11T12:00:00Z"
}
```

This endpoint is public. For `WEB` clients, the backend sets the refresh token as an `HttpOnly` refresh cookie and returns `refreshToken: null` in JSON. For non-web API clients such as future mobile/desktop apps, the raw refresh token can still be returned in JSON so the client can store it in secure platform storage.

### `POST /api/auth/refresh`

Purpose:

- Rotate a refresh token.
- Reject unknown, expired, revoked, or non-active-user sessions.
- Issue a new short-lived JWT access token.
- Create a replacement refresh session and store only the hashed replacement token.
- Revoke the old refresh session and link it to the replacement session.

Request shape:

```json
{
  "refreshToken": "raw-refresh-token"
}
```

Web clients may also call this endpoint with no JSON body when the refresh cookie is present.

Response shape for JSON-token clients:

```json
{
  "tokenType": "Bearer",
  "accessToken": "new-jwt-access-token",
  "accessTokenExpiresAt": "2026-06-11T12:30:00Z",
  "refreshToken": "new-raw-refresh-token",
  "refreshTokenExpiresAt": "2026-07-11T12:15:00Z"
}
```

For web cookie refresh, the backend rotates the refresh session, sets a replacement `HttpOnly` refresh cookie, and returns `refreshToken: null`.

This endpoint is public because access tokens can expire before a user session should end. Reusing an old rotated refresh token returns `401`.

### `POST /api/auth/logout`

Purpose:

- Revoke a refresh session.
- Prevent the refresh token from being used again.
- Keep logout idempotent and non-revealing.

Request shape:

```json
{
  "refreshToken": "raw-refresh-token"
}
```

Web clients may also call this endpoint with no JSON body when the refresh cookie is present.

Response shape:

```json
{
  "message": "Logged out if the session existed."
}
```

This endpoint is public and intentionally returns success even when the refresh token is unknown or already revoked. Existing access tokens remain valid until their short expiry; logout revokes the ability to extend the session. Web logout also clears the refresh cookie.

### `POST /api/auth/forgot-password`

Purpose:

- Accept an email address and send a password reset link via Resend if the account is active.
- Always return the same safe response regardless of whether the email exists or the account status.
- Rate-limited: 5 attempts per IP per hour.

Request shape:

```json
{
  "email": "user@example.com"
}
```

Response shape (always identical):

```json
{
  "message": "If an active account exists for this email, a password reset link has been sent."
}
```

This endpoint is public. The reset token is stored hashed in `password_reset_tokens` and expires in 30 minutes.

### `POST /api/auth/reset-password`

Purpose:

- Accept a raw reset token plus a new password and update the account password hash.
- Reject unknown, expired, or already-used tokens with `400`.
- Reject non-active accounts with `403`.
- Mark the token as used and revoke all existing refresh sessions on success.
- Rate-limited: 10 attempts per IP per 15 minutes.

Request shape:

```json
{
  "token": "raw-reset-token-from-email-link",
  "newPassword": "new-secret-password",
  "confirmPassword": "new-secret-password"
}
```

Response shape:

```json
{
  "message": "Password updated. Please sign in with your new password."
}
```

This endpoint is public. After a successful reset all existing refresh sessions are revoked, so all devices must re-login.

### `GET /api/auth/me`

Purpose:

- Return the current authenticated account for a valid JWT bearer token.
- Reject missing or invalid access tokens with `401`.
- Reject valid tokens for accounts that are no longer active with `403`.

Request headers:

```http
Authorization: Bearer jwt-access-token
```

Response shape:

```json
{
  "userId": "2abda4f4-8f0d-4988-9b0e-1a76f43c83e2",
  "email": "new@example.com",
  "displayName": "New Member",
  "countryRegionCode": "DE",
  "status": "ACTIVE",
  "roles": ["USER"],
  "emailVerifiedAt": "2026-06-11T12:00:00Z",
  "lastLoginAt": "2026-06-11T12:05:00Z",
  "hasAvatar": false,
  "emailNotificationsPm": true
}
```

This is the first protected auth endpoint. It uses Spring Security bearer-token validation and then checks the persisted user status so banned or deleted accounts cannot keep using old access tokens until expiry for current-user reads.

### `PATCH /api/users/me/profile`

Purpose:

- Update the current user's display name and/or country/region.
- Requires an active account and a valid bearer token.

Request shape:

```json
{
  "displayName": "BigMo",
  "countryRegionCode": "DE"
}
```

Response shape:

```json
{
  "displayName": "BigMo",
  "countryRegionCode": "DE"
}
```

After success the frontend calls `refreshUser()` to re-fetch `GET /api/auth/me` and update the auth context.

### `PATCH /api/users/me/notifications`

Purpose:

- Update the current user's email notification preference for private messages.
- Requires an active account and a valid bearer token.

Request shape:

```json
{
  "emailNotificationsPm": false
}
```

Response shape:

```json
{
  "emailNotificationsPm": false
}
```

When `false`, no PM-notification emails are sent to this user (by `MessagingService.notifyRecipient` and the broadcast service), but messages still arrive in their inbox. An `OWNER` can still override this preference by setting `bypassEmailPreference: true` in a broadcast. Frontend toggle is in the Notifications section of `/settings`.

### `POST /api/users/me/change-password`

Purpose:

- Verify the current password, then update the password hash.
- Reject mismatched `newPassword`/`confirmPassword` with `400`.
- Reject wrong current password with `400`.
- Reject new password equal to the current one with `400`.
- Revoke all refresh sessions on success (forces re-login on all devices).

Request shape:

```json
{
  "currentPassword": "old-secret",
  "newPassword": "new-secret-min8",
  "confirmPassword": "new-secret-min8"
}
```

Response shape:

```json
{
  "message": "Password updated. You have been signed out of all devices."
}
```

### `POST /api/users/me/sessions/revoke-all`

Purpose:

- Revoke all active refresh sessions for the current user.
- Forces re-login on all devices including the current one.

Response shape:

```json
{
  "message": "All sessions have been signed out."
}
```

### `POST /api/users/me/avatar`

Purpose:

- Accept a multipart `avatar` file (field name `avatar`), JPEG or PNG, max 8 MB.
- Server-side resize to a 256×256 JPEG and store it as `bytea` in `user_avatars` (own table since V17; `users.has_avatar` flags existence for response mapping).
- Requires an active account and a valid bearer token.

Returns `204 No Content` on success. Empty file → `400`; unsupported type (anything but JPEG/PNG) → `415`. WebP is intentionally rejected because the JDK's bundled `ImageIO` cannot decode it.

### `GET /api/avatars/{userId}`

Purpose:

- Serve the stored JPEG bytes for any user who has uploaded an avatar.
- Public (no auth). `Content-Type: image/jpeg`, `Cache-Control: no-cache, private`, plus an `ETag` derived from the avatar's `updated_at`.
- Conditional GET: a request with a matching `If-None-Match` gets `304 Not Modified` with no body — the version check reads only `updated_at`, never the blob — so browsers revalidate cheaply on every render and a changed avatar still shows immediately.

Returns `404` when the user does not exist or has no avatar.

### `GET /api/users/{userId}/profile`

Purpose:

- Public (no auth) profile for any non-deleted user.

Response shape:

```json
{
  "userId": "2abda4f4-8f0d-4988-9b0e-1a76f43c83e2",
  "displayName": "New Member",
  "countryRegionCode": "DE",
  "hasAvatar": true,
  "joinedAt": "2026-06-11T12:00:00Z",
  "publicRoles": ["MODERATOR"],
  "threadCount": 4,
  "commentCount": 12,
  "likesReceived": 7,
  "recentThreads": [],
  "recentComments": []
}
```

`publicRoles` only ever exposes `OWNER`/`ADMIN`/`MODERATOR` (never `USER`). DELETED users → `404`. BANNED users → `200` with `displayName` `"Banned account"`, no country/avatar, and zeroed activity.

### Private messaging

Async one-to-one inbox backed by `V11__create_private_messaging.sql` (`conversations`, `conversation_participants`, `messages`). All endpoints require a valid bearer token for an `ACTIVE` (email-verified) account; all live under `/api/messages/**` (authenticated in `SecurityConfig`).

- `POST /api/messages` — start a new conversation. Rate-limited 20/hour per IP. Recipient must be `ACTIVE` (else `404`); messaging yourself → `400`. Returns the thread (`201`).
- `POST /api/messages/{id}/reply` — reply to a conversation. Rate-limited 60/10min per IP. Caller must be a participant (else `404`). Returns the new message (`201`).
- `GET /api/messages` — inbox list, newest first, excludes the caller's soft-deleted conversations.
- `GET /api/messages/{id}` — full thread (participants only, else `404`); opening marks it read.
- `GET /api/messages/unread-count` — `{ "count": N }` for the header badge.
- `DELETE /api/messages/{id}` — soft-delete the caller's side only (`204`); the other participant still sees it.
- `POST /api/messages/broadcast` — owner/admin only announcement to every member. Role-checked in the service (`OWNER` or `ADMIN`, else `403`). Requires `channel` (`"PM"`, `"EMAIL"`, or `"BOTH"`) and optional `bypassEmailPreference` (`true`/`false`, default `false`). Returns `{ "recipientCount": N }` (`201`).
  - `PM` — creates a 1-to-1 conversation per member (no email).
  - `EMAIL` — sends a direct email with the message body per member (no conversation).
  - `BOTH` — creates a conversation and sends a link email.
  - All email sends respect each recipient's `email_notifications_pm` preference unless `bypassEmailPreference: true` from an `OWNER` (silently ignored for `ADMIN`).
  Body shape: `{ "subject", "body", "channel", "bypassEmailPreference" }` (`bypassEmailPreference` can be omitted, treated as `false`).

Start request shape:

```json
{
  "recipientId": "uuid",
  "subject": "Subject line",
  "body": "Message text."
}
```

A conversation is unread for a participant when the latest message is newer than their `last_read_at` and was not sent by them. Opening the thread or replying stamps `last_read_at`. Replying also restores (un-deletes) both participant sides so a new message reappears in a recipient who had deleted the conversation. The recipient gets a best-effort Resend email (`EmailService.sendNewMessageEmail`) linking to `/messages/{id}`; the message body is not included in the email and a send failure never rolls back the saved message.

## API Principles

- REST API from Spring Boot backend.
- Frontend consumes API through `NEXT_PUBLIC_API_BASE_URL`.
- Keep response shapes explicit and typed in the frontend.
- Validate request bodies with Spring Validation when write endpoints are added.
- Keep public endpoints clearly separated from authenticated endpoints.
- Add auth-only API behavior in small, approved slices.
- Do not expose internal exception details to clients.

## Planned API Areas

Not all of these should be built now.

### `/myplan` — Personal Tracking Hub (Phases 1–3 COMPLETE)

Private endpoints — all require a valid bearer token for an active account. Grouped under `/api/myplan/**` (authenticated in `SecurityConfig`).

#### Weight goals

- `GET /api/myplan/weight/goals` — returns the user's start and goal weight. Returns `null` fields if not yet set.
- `PATCH /api/myplan/weight/goals` — sets start weight and goal weight. Both fields are required on every call (`UpdateWeightGoalsRequest` has `@NotNull` on both) — this is a full replace, not a partial update; the frontend always sends both values together.

Request shape:

```json
{
  "startWeight": 203.0,
  "goalWeight": 120.0
}
```

Response shape:

```json
{
  "startWeight": 203.0,
  "goalWeight": 120.0,
  "updatedAt": "2026-07-01T10:00:00Z"
}
```

#### Weight entries

- `GET /api/myplan/weight/entries` — returns all weight entries for the user, ordered by `entryDate` ascending (for the chart).
- `POST /api/myplan/weight/entries` — add a new entry. Rejects duplicate dates (`409`).

Request shape:

```json
{
  "entryDate": "2026-07-01",
  "weightKg": 157.0
}
```

Response shape (single entry):

```json
{
  "id": "uuid",
  "entryDate": "2026-07-01",
  "weightKg": 157.0,
  "createdAt": "2026-07-01T10:00:00Z"
}
```

List response is an array of the same shape. The frontend computes the "change from previous" column client-side from the ordered list.

#### Chart behaviour driven by this data

- No goals set → no chart rendered (frontend prompt to set start/goal first)
- Goals set, zero entries → chart frame with Y-axis (start weight top → goal weight bottom) and dashed goal `ReferenceLine`; no data points
- 1 entry → single dot; no line
- 2+ entries → line chart; X-axis from first to last `entryDate`

#### Future phases

**Phase 2 — Diet (`/myplan/diet`) — COMPLETE (V14)**

No dates, no daily targets. A personal, ordered list of titled Meals (default "Meal N", renamable), each holding food line-items (name, quantity, per-unit macros, snapshotted at add-time). Adding an item either picks a shared suggestion (macros multiply by quantity) or types a custom entry (which also auto-adds to the shared catalog). Meal/day totals are always computed client-side from the fetched data, never stored server-side. The shared catalog **starts empty** and grows only from user-added custom foods (no external bulk import — owner decision). Each food has a `name` (English, required) and an optional `nameDe` (German); `FoodCombobox` search matches either and ranks prefix/word-boundary matches ahead of a query merely appearing mid-string.

Implemented endpoints, all under `/api/myplan/diet/**` (inherits the existing blanket-authenticated `/api/myplan/**` rule in `SecurityConfig`, no config change needed):

- `GET /api/myplan/diet/foods` — list the full shared food catalog (any active user). `FoodResponse` includes `name`, `nameDe` (nullable), `unitLabel`, and the four macros.
- `PATCH /api/myplan/diet/foods/{id}` / `DELETE /api/myplan/diet/foods/{id}` — moderator-only (`OWNER`/`ADMIN`/`MODERATOR`), regardless of who created the entry. `UpdateFoodRequest` accepts an optional `nameDe` alongside the required `name`/`unitLabel`/macros.
- `GET/POST /api/myplan/diet/meals`, `PATCH/DELETE /api/myplan/diet/meals/{id}`, `PATCH /api/myplan/diet/meals/reorder` — personal, private
- `POST /api/myplan/diet/meals/{mealId}/items`, `PATCH/DELETE /api/myplan/diet/meals/{mealId}/items/{itemId}` — personal, private; adding an item with no `foodId` reuses an existing shared food if one already matches by case-insensitive `name`+`unitLabel`, otherwise creates a new `Food` row (any active user can do this — open add). `AddDietMealItemRequest.nameDe` is optional (no `@NotBlank`) and only takes effect when creating a brand-new shared food (ignored when `foodId` is set, and ignored when an existing food is reused by name+unit); `name` stays the required/primary field, English-first by design (see `docs/dev-agent-plan.md`, "Custom food entry: bilingual naming"). All diet request DTOs validate field length/range (`@Size`/`@DecimalMax`) against the underlying column widths, so oversized or out-of-range input is a clean `400` rather than a database-constraint `500`.
- `POST /api/myplan/diet/macro-checks` — any active user flags an existing shared food with proposed corrected macros + optional comment. **One *open* flag per user per food** — a user can flag the same food again later once their prior flag on it has been resolved/dismissed (`409` only while a flag from them on that food is still `OPEN`).
- `GET /api/myplan/diet/macro-checks` / `POST /api/myplan/diet/macro-checks/{id}/resolve` — moderator-only; resolve = `APPLY` (edits the target food with final values, including an optional `finalNameDe` to correct the German name) or `DISMISS`; requires the check to be `OPEN` (`409` otherwise, same rule as existing forum report resolution). For a bad food name/entry that isn't worth correcting, a moderator can instead call the existing `DELETE /api/myplan/diet/foods/{id}` directly from the Macro Checks admin page — this cascades to remove every check referencing that food, including the one being viewed.

API areas: `foods` (shared), `diet_meals` + `diet_meal_items` (private), `food_macro_checks` (moderator review queue, mirrors `forum_post_reports`' `ForumReportStatus` pattern rather than extending the existing moderation system). See `docs/database-notes.md` for the full schema and `docs/dev-agent-plan.md` for the full design rationale (including the rejected fully-autonomous-AI-moderator idea in favor of a lightweight "look this up" web-search link for human moderators).

**Phase 3 — Workout (`/myplan/workout`) — COMPLETE (V15)**

A pure **plan maker, not a log** (no dates, no done-marks, no session tracking — the owner cut the originally built weekly done/not-done toggle after seeing it). One weekly plan per user (not several), as up to 8 ordered blocks, each with a title ("Upper A", "Warm-Up Protocol") and an **optional day of the week** (`weekday`: `MONDAY`–`SUNDAY` or null for a block that isn't pinned to a day, rendered localized — Monday/Montag — like the rest of the UI). Each block holds exercise line-items: a catalog-linked name plus a **free-text `sets` field** ("3 x 8-10", "2 minutes" — same representation as the Journal training pages). The shared `exercises` catalog starts **empty** and grows only from user-added custom entries, exactly like `foods`: open add (auto-created when adding a custom-named exercise to a day, deduplicated by case-insensitive name), edit/delete moderator-only, optional German `nameDe`. Owner-curated seeding (photos from the Journal) stays deferred — see `docs/dev-agent-plan.md`.

Implemented endpoints, all under `/api/myplan/workout/**` (inherits the blanket-authenticated `/api/myplan/**` rule in `SecurityConfig`):

- `GET /api/myplan/workout/exercises` — list the shared exercise catalog (any active user). `ExerciseResponse`: `id`, `name`, `nameDe` (nullable), `photoSrc` (nullable).
- `PATCH/DELETE /api/myplan/workout/exercises/{id}` — moderator-only (`OWNER`/`ADMIN`/`MODERATOR`), regardless of creator. Deleting an exercise leaves users' plan items intact (their `exerciseId` becomes null; the item keeps its snapshotted name).
- `GET /api/myplan/workout/plan` — the user's plan blocks (ordered), each with `id`, `title`, `weekday` (nullable), `position`, `exercises`, `updatedAt`.
- `POST /api/myplan/workout/plan/days` — add a block: `{ "title"?, "weekday"? }` (title defaults to `"Day N"` from max position; unknown weekday values → `400`). `400` when the plan already has 50 blocks (a generous abuse-guard, not a real usage ceiling).
- `PATCH /api/myplan/workout/plan/days/{id}` — update: `{ "title", "weekday"? }` — a full replace; omitting `weekday` clears it (the block goes back to floating free of a day).
- `DELETE /api/myplan/workout/plan/days/{id}` — delete (cascades the block's items).
- `PATCH /api/myplan/workout/plan/days/reorder` — `{ "orderedDayIds": [...] }`; must match the user's existing blocks exactly, duplicates rejected with `400`.
- `POST /api/myplan/workout/plan/days/{dayId}/exercises` — add a line item: `{ exerciseId?, name, nameDe?, sets }` (`sets` is required free text, max 120 chars). No `exerciseId` → reuses a catalog exercise by case-insensitive name or creates one (open add).
- `PATCH/DELETE /api/myplan/workout/plan/days/{dayId}/exercises/{itemId}` — update (`{ name, sets }`) / remove.

See `docs/database-notes.md` for the V15 schema (including the reshape note) and `docs/dev-agent-plan.md` for the design decisions (plan maker not log, one plan per user, empty catalog, deferred seeding).

**Phase 4 — GLP-1 / Medication (`/myplan/glp1`) — COMPLETE (V16)**

A private medication log connected to the Weight feature rather than duplicating it. An entry is just **date + dose (mg) + optional notes** — no medication-name field (dropped after being sketched as free text; the page itself is already scoped to "the GLP-1 log", so tagging each entry with a drug name was redundant). No medical advice or dosing suggestions anywhere in the copy.

- Optionally logging a weight alongside a dose does **not** store a weight on this feature's own table — it makes an independent call to the existing `POST /api/myplan/weight/entries` for that date (a `409` if one already exists is caught and ignored client-side; the existing value wins). Displaying weight per entry is a live join by date against the fetched weight history, not a stored copy.
- "Change since start" is computed client-side per entry, never persisted: reference point is `user_weight_goals.start_weight` if set, else the earliest `weight_entries` row, else no reference exists yet (shown as "First entry", not `0 kg`).
- Multiple entries per date are allowed (no uniqueness constraint, unlike `weight_entries`) — a log entry is an event, not a single daily measurement.
- Fully private, no shared/catalog concept, no moderation surface (same privacy model as `weight_entries`/`diet_meals`).

Implemented endpoints, all under `/api/myplan/glp1/**` (inherits the blanket-authenticated `/api/myplan/**` rule in `SecurityConfig`):

- `GET /api/myplan/glp1/entries` — the user's entries, oldest-first (chronological, normal reading order for a dated log). `MedicationLogEntryResponse`: `id`, `entryDate`, `doseMg`, `notes` (nullable), `updatedAt`.
- `POST /api/myplan/glp1/entries` — add an entry: `{ entryDate, doseMg, notes? }`.
- `PATCH /api/myplan/glp1/entries/{id}` — full replace of the same fields.
- `DELETE /api/myplan/glp1/entries/{id}` — remove.

See `docs/database-notes.md` for the V16 schema and `docs/dev-agent-plan.md` for the full design discussion (weight-connection architecture, the "change since start" fallback chain, and the dropped medication-name field).

### Push Notifications (PWA, V18)

Web Push subscriptions backed by `V18__create_push_subscriptions.sql` (`push_subscriptions`). All endpoints live under `/api/push/**` (authenticated in `SecurityConfig`).

- `POST /api/push/subscriptions` — `{ endpoint, p256dh, auth }`. Upserts by `endpoint` (`201`): re-subscribing the same browser replaces its row; an endpoint that moved to another user is reassigned rather than duplicated.
- `DELETE /api/push/subscriptions` — `{ endpoint }`. Idempotent (`204`); only deletes a row owned by the caller.

`MessagingService.notifyRecipient` (new messages) and `broadcast` (`PM`/`BOTH` channels) call `PushNotificationService.notifyNewMessage`, which sends `{ title, body, conversationId }` to every subscription of the recipient via `nl.martijndwars:web-push`, on a dedicated single-thread executor — never the caller's request thread, and never throws back into a `@Transactional` caller (same reasoning as the after-commit broadcast-email pattern in the 2026-07-18 performance pass). Push fires regardless of `emailNotificationsPm` — having a subscription is itself the opt-in. A `404`/`410` response from the push service deletes the expired subscription row.

Requires `FATFITNESS_VAPID_PUBLIC_KEY`, `FATFITNESS_VAPID_PRIVATE_KEY`, `FATFITNESS_VAPID_SUBJECT` (no committed defaults, fail-fast like `FATFITNESS_JWT_SECRET`) — generate a key pair once with `npx web-push generate-vapid-keys`. Frontend needs the public key as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (not secret).

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

Current implemented read-only endpoints:

- `GET /api/community/categories`
- `GET /api/community/categories/{slug}`
- `GET /api/community/posts`
- `GET /api/community/posts/{id}`
- `GET /api/community/posts/{id}/comments`

These return the seeded MVP forum board metadata, published top-level posts, and published flat comments. They are public and do not require authentication.

`GET /api/community/categories` response shape:

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000101",
    "slug": "introductions",
    "name": "Introductions",
    "description": "Who you are, where you are starting, and what kind of support helps.",
    "displayOrder": 10
  }
]
```

Current implemented authenticated write endpoints:

- `POST /api/community/posts`
- `POST /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/reports`
- `POST /api/community/comments/{id}/reports`

`POST /api/community/posts` requires a valid bearer token for an active account. The account must already be email-verified because only `ACTIVE` accounts pass the write check.

Request shape:

```json
{
  "categorySlug": "introductions",
  "title": "Starting here",
  "body": "This is my first forum post.",
  "acceptedCommunityGuidelines": true
}
```

Response shape:

```json
{
  "id": "29ddcb03-e6d1-4ce1-bbc3-d1f7648aa7c8",
  "categorySlug": "introductions",
  "categoryName": "Introductions",
  "title": "Starting here",
  "body": "This is my first forum post.",
  "authorId": "6fdc43ff-7674-4935-9420-61b77b09d083",
  "authorDisplayName": "Forum Member",
  "authorHasAvatar": false,
  "status": "PUBLISHED",
  "locked": false,
  "createdAt": "2026-06-12T15:00:00Z",
  "updatedAt": "2026-06-12T15:00:00Z",
  "editedAt": null,
  "likeCount": 0,
  "likedByCurrentUser": null,
  "bookmarkedByCurrentUser": null
}
```

`likedByCurrentUser` and `bookmarkedByCurrentUser` are `null` for anonymous reads and `true`/`false` when a valid bearer token is sent. `editedAt` is `null` until the title/body is edited.

`POST /api/community/posts/{id}/reports` requires a valid bearer token for an active account. Reports are idempotent per post/reporter pair and start with status `OPEN`.

Request shape:

```json
{
  "reason": "medical_misinformation",
  "details": "This needs a moderator look."
}
```

Response shape:

```json
{
  "id": "d91c70ca-f85b-4cd2-8fbb-b03715f26290",
  "postId": "29ddcb03-e6d1-4ce1-bbc3-d1f7648aa7c8",
  "reason": "medical_misinformation",
  "details": "This needs a moderator look.",
  "status": "OPEN",
  "createdAt": "2026-06-12T15:05:00Z"
}
```

`GET /api/community/posts/{id}/comments` returns published flat comments for a published post.

Response shape:

```json
[
  {
    "id": "a96737f7-9254-4cc7-bc8a-e7f6f5291435",
    "postId": "29ddcb03-e6d1-4ce1-bbc3-d1f7648aa7c8",
    "body": "A first reply on this thread.",
    "authorId": "6fdc43ff-7674-4935-9420-61b77b09d083",
    "authorDisplayName": "Forum Member",
    "authorHasAvatar": false,
    "status": "PUBLISHED",
    "createdAt": "2026-06-12T15:10:00Z",
    "updatedAt": "2026-06-12T15:10:00Z",
    "editedAt": null,
    "likeCount": 0,
    "likedByCurrentUser": null
  }
]
```

As with posts, `likedByCurrentUser` is `null` for anonymous reads and a boolean when a bearer token is sent; `editedAt` is `null` until the comment is edited.

`POST /api/community/posts/{id}/comments` requires a valid bearer token for an active account. The account must already be email-verified because only `ACTIVE` accounts pass the write check. Locked posts reject new comments.

Request shape:

```json
{
  "body": "A first reply on this thread.",
  "acceptedCommunityGuidelines": true
}
```

Response shape:

```json
{
  "id": "a96737f7-9254-4cc7-bc8a-e7f6f5291435",
  "postId": "29ddcb03-e6d1-4ce1-bbc3-d1f7648aa7c8",
  "body": "A first reply on this thread.",
  "authorId": "6fdc43ff-7674-4935-9420-61b77b09d083",
  "authorDisplayName": "Forum Member",
  "authorHasAvatar": false,
  "status": "PUBLISHED",
  "createdAt": "2026-06-12T15:10:00Z",
  "updatedAt": "2026-06-12T15:10:00Z",
  "editedAt": null,
  "likeCount": 0,
  "likedByCurrentUser": null
}
```

`POST /api/community/comments/{id}/reports` requires a valid bearer token for an active account. Reports are idempotent per comment/reporter pair and start with status `OPEN`.

Request shape:

```json
{
  "reason": "unsafe_advice",
  "details": "This needs a moderator look."
}
```

Response shape:

```json
{
  "id": "5303ca87-292a-4b53-8a9e-58c3b5400ae6",
  "commentId": "a96737f7-9254-4cc7-bc8a-e7f6f5291435",
  "reason": "unsafe_advice",
  "details": "This needs a moderator look.",
  "status": "OPEN",
  "createdAt": "2026-06-12T15:12:00Z"
}
```

Community write APIs include top-level posts, flat comments, reporting hooks, likes, bookmarks, report-scoped hide, lock, and ban actions. The frontend can list/read published posts, create top-level threads for signed-in verified users, like/bookmark posts, submit reports, list/create/report replies, and use `/admin` to hide reported content, lock threads, ban users, resolve, or dismiss reports.

`GET /api/community/posts/{id}` accepts an optional `Authorization: Bearer` header. When a valid token is provided, the response includes `likedByCurrentUser` and `bookmarkedByCurrentUser` boolean fields. The frontend must wait for auth state to resolve and pass the access token before fetching so these fields are returned correctly (otherwise the backend sees an anonymous request and always returns `false`).

### Editing and deleting posts and comments

Authenticated endpoints. The author OR any `OWNER`/`ADMIN`/`MODERATOR` may edit or delete; anyone else gets `403`.

- `PATCH /api/community/posts/{id}` — edit a post's title and/or body
- `DELETE /api/community/posts/{id}` — soft-delete a post (`204 No Content`)
- `PATCH /api/community/comments/{id}` — edit a comment body
- `DELETE /api/community/comments/{id}` — soft-delete a comment (`204 No Content`)

Editing the body/title stamps `editedAt` (returned in `ForumPostResponse`/`ForumCommentResponse`); moderation hide/lock does not. Soft-deleted content is removed from public reads. Post edit request shape:

```json
{
  "title": "Updated title",
  "body": "Updated body text."
}
```

### Likes and bookmarks

Backed by the `V7__likes_and_bookmarks.sql` migration (`post_likes`, `comment_likes`, `post_bookmarks`). All four endpoints require a valid bearer token for an active account. Toggle endpoints are idempotent: calling them adds the reaction if absent and removes it if present, returning the resulting state.

- `POST /api/community/posts/{id}/like`
- `POST /api/community/comments/{id}/like`
- `POST /api/community/posts/{id}/bookmark`
- `GET /api/community/bookmarks`

`POST /api/community/posts/{id}/like` and `POST /api/community/comments/{id}/like` accept no body and return the new like state plus the live count:

```json
{
  "liked": true,
  "likeCount": 4
}
```

`POST /api/community/posts/{id}/bookmark` accepts no body and returns the new bookmark state:

```json
{
  "bookmarked": true
}
```

Toggle behavior is split by direction: **removing** an existing bookmark works regardless of post status (so users can unsave a post that was later hidden or removed by moderation); **adding** a new bookmark is still restricted to `PUBLISHED` posts (→ `404` otherwise).

`GET /api/community/bookmarks` returns the current user's bookmarked posts as a list of post objects (same shape as `GET /api/community/posts`), **including posts with non-`PUBLISHED` status**. The `status` field in each response object lets the frontend distinguish live from removed posts. This backs the saved-threads list on `/dashboard`.

### Moderation

Current implemented moderator endpoints:

- `GET /api/moderation/reports`
- `POST /api/moderation/reports/posts/{id}/resolve`
- `POST /api/moderation/reports/posts/{id}/hide`
- `POST /api/moderation/reports/comments/{id}/resolve`
- `POST /api/moderation/reports/comments/{id}/hide`
- `POST /api/moderation/posts/{id}/lock` — locks a forum post so new comments are rejected; records a `LOCK` row in `moderation_actions`
- `POST /api/moderation/users/{id}/ban` — sets account status to `BANNED`, revokes all refresh sessions, and records a `BAN` row in `moderation_actions`

These require a valid bearer token for an active account with role `OWNER`, `ADMIN`, or `MODERATOR`. Role checks are performed against the persisted user record, not only the JWT claim.

Authorization and idempotency rules:

- **Ban respects role hierarchy.** A ban is rejected with `403` unless the actor's highest role outranks the target's (`OWNER` > `ADMIN` > `MODERATOR` > `USER`). A moderator cannot ban another moderator, an admin, the owner, or themselves.
- **Resolve/hide require an open report.** Resolving or hiding a report that is already `RESOLVED`/`DISMISSED` returns `409 Conflict`, preserving the original resolver/timestamp/note.
- **Hide is audited.** `hide` writes a `HIDE` row to `moderation_actions` (target type `POST`/`COMMENT`), alongside the existing `LOCK` and `BAN` audit rows.

`GET /api/moderation/reports` lists reports from both post and comment report tables.

Supported query parameters:

- `targetType`: optional `POST` or `COMMENT`.
- `status`: optional `OPEN`, `RESOLVED`, `DISMISSED`, or `ALL`. Default is `OPEN`.
- `limit`: optional, clamped by the backend.

Response shape:

```json
[
  {
    "id": "d91c70ca-f85b-4cd2-8fbb-b03715f26290",
    "targetType": "POST",
    "targetId": "29ddcb03-e6d1-4ce1-bbc3-d1f7648aa7c8",
    "postId": "29ddcb03-e6d1-4ce1-bbc3-d1f7648aa7c8",
    "targetTitle": "Starting here",
    "targetPreview": "This is my first forum post.",
    "contentAuthorUserId": "6fdc43ff-7674-4935-9420-61b77b09d083",
    "contentAuthorDisplayName": "Forum Member",
    "reporterUserId": "fcbfa3cb-55ae-4744-a50a-294e22f8105b",
    "reporterDisplayName": "Forum Member",
    "reason": "medical_misinformation",
    "details": "This needs a moderator look.",
    "status": "OPEN",
    "createdAt": "2026-06-12T15:05:00Z",
    "resolvedAt": null,
    "resolvedByUserId": null,
    "resolvedByDisplayName": null,
    "resolutionNote": null
  }
]
```

Resolving a post or comment report uses the same request body:

```json
{
  "status": "RESOLVED",
  "resolutionNote": "Reviewed and handled."
}
```

`status` must be `RESOLVED` or `DISMISSED`. `resolutionNote` is optional.

Hiding a reported post or comment uses the report-scoped hide endpoints:

```json
{
  "resolutionNote": "Hidden after review."
}
```

The backend marks the target post/comment as `HIDDEN`, which removes it from public reads, and marks the related report as `RESOLVED`. `resolutionNote` is optional.

Lock and ban endpoints accept no request body and return `200` on success. Banning a user revokes all their refresh sessions; subsequent `POST /api/auth/refresh` calls return `403 Forbidden` for that account. Both actions write an audit row to `moderation_actions`.

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
- Web clients use `HttpOnly`, `SameSite` refresh cookies for refresh handling; production should enable `Secure`.
- Mobile and desktop clients should use secure platform storage for refresh tokens.
- API requests should use `Authorization: Bearer <accessToken>`.
- Do not store tokens in browser `localStorage`.
- Ban, delete, logout, and password-change flows should be able to revoke sessions.

Current implemented endpoints (full list; `GET /api/status` is documented separately above):

- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/community/categories`
- `GET /api/community/categories/{slug}`
- `GET /api/community/posts`
- `GET /api/community/posts/{id}`
- `GET /api/community/posts/{id}/comments`
- `POST /api/community/posts`
- `POST /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/reports`
- `POST /api/community/comments/{id}/reports`
- `PATCH /api/community/posts/{id}`
- `DELETE /api/community/posts/{id}`
- `PATCH /api/community/comments/{id}`
- `DELETE /api/community/comments/{id}`
- `POST /api/community/posts/{id}/like`
- `POST /api/community/comments/{id}/like`
- `POST /api/community/posts/{id}/bookmark`
- `GET /api/community/bookmarks`
- `GET /api/moderation/reports`
- `POST /api/moderation/reports/posts/{id}/resolve`
- `POST /api/moderation/reports/posts/{id}/hide`
- `POST /api/moderation/reports/comments/{id}/resolve`
- `POST /api/moderation/reports/comments/{id}/hide`
- `POST /api/moderation/posts/{id}/lock`
- `POST /api/moderation/users/{id}/ban`
- `PATCH /api/users/me/profile`
- `PATCH /api/users/me/notifications`
- `POST /api/users/me/change-password`
- `POST /api/users/me/sessions/revoke-all`
- `POST /api/users/me/avatar`
- `GET /api/avatars/{id}`
- `GET /api/users/{id}/profile`
- `GET /api/myplan/weight/goals`
- `PATCH /api/myplan/weight/goals`
- `GET /api/myplan/weight/entries`
- `POST /api/myplan/weight/entries`
- `GET /api/myplan/diet/foods`
- `PATCH /api/myplan/diet/foods/{id}` (moderator-only)
- `DELETE /api/myplan/diet/foods/{id}` (moderator-only)
- `GET /api/myplan/diet/meals`
- `POST /api/myplan/diet/meals`
- `PATCH /api/myplan/diet/meals/{id}`
- `DELETE /api/myplan/diet/meals/{id}`
- `PATCH /api/myplan/diet/meals/reorder`
- `POST /api/myplan/diet/meals/{mealId}/items`
- `PATCH /api/myplan/diet/meals/{mealId}/items/{itemId}`
- `DELETE /api/myplan/diet/meals/{mealId}/items/{itemId}`
- `POST /api/myplan/diet/macro-checks`
- `GET /api/myplan/diet/macro-checks` (moderator-only)
- `POST /api/myplan/diet/macro-checks/{id}/resolve` (moderator-only)
- `GET /api/myplan/workout/exercises`
- `PATCH /api/myplan/workout/exercises/{id}` (moderator-only)
- `DELETE /api/myplan/workout/exercises/{id}` (moderator-only)
- `GET /api/myplan/workout/plan`
- `POST /api/myplan/workout/plan/days`
- `PATCH /api/myplan/workout/plan/days/{id}`
- `DELETE /api/myplan/workout/plan/days/{id}`
- `PATCH /api/myplan/workout/plan/days/reorder`
- `POST /api/myplan/workout/plan/days/{dayId}/exercises`
- `PATCH /api/myplan/workout/plan/days/{dayId}/exercises/{itemId}`
- `DELETE /api/myplan/workout/plan/days/{dayId}/exercises/{itemId}`
- `GET /api/myplan/glp1/entries`
- `POST /api/myplan/glp1/entries`
- `PATCH /api/myplan/glp1/entries/{id}`
- `DELETE /api/myplan/glp1/entries/{id}`
- `POST /api/push/subscriptions`
- `DELETE /api/push/subscriptions`

Next slices:

- `/myplan` (Phases 1–4) and the PWA milestone (installable shell + push notifications) are complete. See `docs/dev-agent-plan.md`, "Product Direction".
- Content work (Learn pages) — owner-driven, deferred until web platform is feature-complete.

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

Current frontend auth state:

- `/login` submits to `POST /api/auth/login` for verified active accounts.
- The frontend keeps the JWT access token in React memory only and restores sessions through the web refresh cookie.
- `/login` can show the active browser session and call logout.
- The shared site header shows session-checking, sign-in, signed-in, and logout controls.
- The signed-in header name links to `/dashboard`.
- `/register` submits to `POST /api/auth/register` with display name, email, searchable country/region picker, password, confirm password, and rules/privacy agreement.
- Registration currently shows the development-only email verification token and can submit it to `POST /api/auth/verify-email` for local testing.
- `/dashboard` uses the frontend auth provider and `GET /api/auth/me` state to show the current account summary; it does not add new API endpoints.
- Frontend auth forms do not use `localStorage`.
- Community post detail pages can list published replies, let signed-in verified users post replies, and let signed-in verified users report replies.
- `/admin` uses the frontend auth provider and moderation APIs to list, filter, hide reported content, resolve, and dismiss reports for users with `OWNER`, `ADMIN`, or `MODERATOR` roles.
- No real email delivery or production-ready account settings UI exists yet.

Current backend auth state:

- Auth persistence foundation exists with users, user roles, email verification tokens, and refresh-token session records.
- Password hashing support exists.
- `POST /api/auth/register` exists as a backend-only development slice.
- Register creates a pending account, hashes the password, stores a hashed email verification token, and returns the raw verification token only in the development response.
- `POST /api/auth/verify-email` exists and activates pending accounts with valid, unexpired, unused verification tokens.
- `POST /api/auth/resend-verification` exists and creates a fresh development token only for pending accounts while keeping unknown/active-account responses non-revealing.
- `POST /api/auth/login` exists and issues a short-lived JWT access token plus a refresh session; web clients receive the refresh token as an `HttpOnly` cookie while non-web clients can use JSON refresh tokens.
- `POST /api/auth/refresh` exists and rotates refresh tokens by revoking/linking the old session and creating a replacement session, including cookie rotation for web clients.
- `POST /api/auth/logout` exists and revokes refresh sessions while keeping unknown/already-revoked tokens non-revealing, and clears the web refresh cookie.
- `GET /api/auth/me` exists as the first protected endpoint and returns the current active user for a valid bearer token.
- Backend startup can seed one local `OWNER` account from environment variables; this is not exposed as an API endpoint.
- Bearer-token validation is wired for `/api/auth/me`, authenticated community writes/reports, and moderator report-review endpoints. Email sending does not exist yet.

JWT configuration:

- Access tokens are signed with a local HMAC secret from `fatfitness.auth.jwt.secret`.
- Access tokens are validated by Spring Security resource-server support for protected endpoints.
- Local development uses the fallback secret from `application.yml`.
- Production must set `FATFITNESS_JWT_SECRET`; do not commit production secrets.
- Access-token TTL is configured by `fatfitness.auth.jwt.access-token-ttl`.
- Refresh-token TTL is configured by `fatfitness.auth.refresh-token-ttl`.
- Web refresh-cookie name/path/security/SameSite behavior is configured by `fatfitness.auth.refresh-cookie`.

Owner seed configuration:

- `FATFITNESS_OWNER_EMAIL`
- `FATFITNESS_OWNER_DISPLAY_NAME`
- `FATFITNESS_OWNER_COUNTRY_REGION_CODE`
- `FATFITNESS_OWNER_PASSWORD`

All four values must be present for the backend to seed an owner. If the account is missing, startup creates it as `ACTIVE` with `USER` and `OWNER` roles. If the account already exists and is pending or active, startup ensures the `OWNER` role. Banned or deleted accounts are not silently restored.

For local development, Gradle `bootRun` loads these values from `backend/fatfitness-api/.env` if that file exists. The real `.env` file is ignored by Git; `backend/fatfitness-api/.env.example` is the tracked template.

This owner seed is development-only. Before public launch, remove or disable the seed path and delete any seeded development owner from databases that are not strictly local. Production owner/admin setup should be handled through a deliberate secure process later.

Email provider:

- Real email delivery is implemented via Resend (`EmailService`) for verification and password-reset emails.
- Provider config comes from environment variables (`RESEND_API_KEY`, `MAIL_FROM`, `APP_BASE_URL`); never commit email provider keys.
- Prefer a separate API key for Fat Fitness instead of sharing a portfolio-site key long term.
- Use a verified sending domain or subdomain before public launch.
- No raw verification/reset token is returned in any API response; when `RESEND_API_KEY` is blank (local dev) the link is logged to the console instead of sent.

## Health And Safety API Guidance

Health-sensitive areas such as GLP-1, weight logs, progress photos, and side-effect journals require extra care.

Before implementing APIs for health-related user data:

- Define privacy expectations.
- Define deletion/export behavior.
- Define visibility rules.
- Define moderation and reporting paths.
- Avoid medical recommendation logic.
