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
  "service": "fitness-api",
  "status": "UP",
  "timestamp": "2026-06-08T16:49:06.581076400Z"
}
```

This endpoint is public.

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
- `GET /api/knowledge-base/articles`
- `GET /api/knowledge-base/articles/{slug}`

These are future options only if separate content sections are intentionally introduced later.

For the current homepage content, prefer static frontend content unless there is a clear need for backend persistence.

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

Later only:

- Register/login
- Session or JWT/cookie strategy
- Roles: `USER`, `MODERATOR`, `ADMIN`
- Google login later

Do not add auth yet.

## Health And Safety API Guidance

Health-sensitive areas such as GLP-1, weight logs, progress photos, and side-effect journals require extra care.

Before implementing APIs for health-related user data:

- Define privacy expectations.
- Define deletion/export behavior.
- Define visibility rules.
- Define moderation and reporting paths.
- Avoid medical recommendation logic.
