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
  "hasAvatar": false
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
- Server-side resize to a 256×256 JPEG and store it as `bytea` in `users.avatar_jpeg`.
- Requires an active account and a valid bearer token.

Returns `204 No Content` on success. Empty file → `400`; unsupported type (anything but JPEG/PNG) → `415`. WebP is intentionally rejected because the JDK's bundled `ImageIO` cannot decode it.

### `GET /api/avatars/{userId}`

Purpose:

- Serve the stored JPEG bytes for any user who has uploaded an avatar.
- Public (no auth). `Content-Type: image/jpeg`, `Cache-Control: no-store`.

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

`GET /api/community/bookmarks` returns the current user's bookmarked posts as a list of post objects (same shape as `GET /api/community/posts`). This backs the saved-threads list on `/dashboard`.

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
- `POST /api/users/me/change-password`
- `POST /api/users/me/sessions/revoke-all`
- `POST /api/users/me/avatar`
- `GET /api/avatars/{id}`
- `GET /api/users/{id}/profile`

Next slices:

- Content work (Learn pages, homepage journal) — frontend-only.
- Weight tracking — new migration (next is V11) + backend endpoint + private weight log UI.

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
