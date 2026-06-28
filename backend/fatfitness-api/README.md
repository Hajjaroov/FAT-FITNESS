# fatfitness-api

Spring Boot 4.1 REST API for the Fat Fitness Community.

- **Port**: `8080`
- **Health check**: `GET http://localhost:8080/api/status`
- **Java**: 21
- **Database**: PostgreSQL 18 (via Docker Compose in `infrastructure/`)

---

## Commands

```bash
# Run locally (reads backend/fatfitness-api/.env automatically)
.\gradlew.bat bootRun

# Run tests
.\gradlew.bat test --no-daemon

# Build JAR
.\gradlew.bat build
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your local values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `FATFITNESS_JWT_SECRET` | Yes (prod) | HS256 signing secret — min 32 characters |
| `RESEND_API_KEY` | Yes (prod) | Resend API key for transactional email |
| `MAIL_FROM` | Yes (prod) | Verified sender address (e.g. `no-reply@fatfitness.de`) |
| `APP_BASE_URL` | Yes (prod) | Frontend origin used in email links |
| `FATFITNESS_OWNER_EMAIL` | Dev only | Seeds an OWNER account on startup |
| `FATFITNESS_OWNER_DISPLAY_NAME` | Dev only | Owner display name |
| `FATFITNESS_OWNER_COUNTRY_REGION_CODE` | Dev only | ISO country code |
| `FATFITNESS_OWNER_PASSWORD` | Dev only | Owner password (dev seed only) |
| `FATFITNESS_CORS_ALLOWED_ORIGINS` | Yes (prod) | Comma-separated allowed origins (default `http://localhost:3000`) |
| `FATFITNESS_REFRESH_COOKIE_SECURE` | Yes (prod) | `true` to mark refresh cookies HTTPS-only (default `false`) |
| `SPRING_PROFILES_ACTIVE` | Optional | Set to `dev` to enable Hibernate SQL logging |

> **Never commit `.env`.** It is git-ignored. Remove the owner seed before production.

---

## Package Structure

```
src/main/java/com/fatfitness/api/
│
├── auth/                        Authentication and session management
│   ├── bootstrap/                 Owner account seed on startup (dev only)
│   ├── controller/                Auth endpoints (register, login, refresh, logout, me,
│   │                              verify-email, resend-verification,
│   │                              forgot-password, reset-password)
│   ├── dto/                       Request/response records
│   ├── model/                     RefreshSession, PasswordResetToken entities
│   ├── repository/                JPA repositories
│   └── service/                   AuthRegistrationService, JwtAccessTokenService,
│                                  PasswordResetService, InMemoryRateLimiter, ...
│
├── community/                   Forum categories, posts, comments, reports, likes
│   ├── controller/                Public + authenticated forum endpoints
│   ├── dto/
│   ├── entity/                    ForumCategory, ForumPost, ForumComment,
│   │                              ForumPostReport, ForumCommentReport,
│   │                              PostLike, PostBookmark
│   ├── repository/
│   └── service/                   ForumCategoryService, ForumPostService,
│                                  ForumCommentService
│
├── config/                      Cross-cutting infrastructure
│   ├── SecurityConfig.java        Spring Security filter chain + CORS
│   ├── AuthProperties.java        fatfitness.auth.* config record
│   ├── EmailProperties.java       fatfitness.email.* config record
│   ├── MdcRequestFilter.java      Injects requestId into MDC + X-Request-Id header
│   └── AccessLogFilter.java       Logs METHOD /path STATUS Xms per request
│
├── email/
│   └── EmailService.java          Resend HTTP client + console fallback
│
├── moderation/                  Report review, content hide, lock, ban, audit
│   ├── controller/
│   ├── dto/
│   ├── entity/                    ModerationAction (audit log)
│   ├── repository/
│   └── service/                   ModerationReportService
│
├── status/
│   └── StatusController.java      GET /api/status health check
│
└── user/                        User accounts, profile, settings
    ├── controller/                Profile edit, change password, revoke sessions
    ├── dto/
    ├── entity/                    UserAccount (roles, status, soft-delete)
    ├── repository/
    └── service/                   UserProfileService, UserPublicDisplayNameService

src/main/resources/
├── db/migration/                Flyway migrations (applied in order)
│   ├── V1__create_user_auth_foundation.sql
│   ├── V2__create_forum_categories.sql
│   ├── V3__create_forum_posts_and_reports.sql
│   ├── V4__create_forum_comments_and_reports.sql
│   ├── V5__add_forum_report_resolution_metadata.sql
│   ├── V6__moderation_lock_and_ban.sql
│   ├── V7__likes_and_bookmarks.sql
│   ├── V8__password_reset_tokens.sql
│   ├── V9__add_avatar_to_users.sql
│   └── V10__add_edited_at_to_forum_content.sql   ← latest; next must be V11
├── application.yml              Main Spring config
├── application-dev.yml          Dev profile: Hibernate SQL + bind-param logging
└── logback-spring.xml           Logback: console + rolling file + error-only file

logs/                            Logback log files — git-ignored
├── app.log                      All levels, 30-day rolling retention
└── error.log                    Errors only, 60-day rolling retention
```

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create pending account + send verification email |
| POST | `/verify-email` | — | Activate account with token |
| POST | `/resend-verification` | — | Send fresh verification email |
| POST | `/login` | — | Issue JWT + refresh cookie |
| POST | `/refresh` | Cookie | Rotate refresh session |
| POST | `/logout` | Cookie | Revoke refresh session |
| GET | `/me` | Bearer | Return current user |
| POST | `/forgot-password` | — | Send password reset email |
| POST | `/reset-password` | — | Set new password, revoke all sessions |

### Users (`/api/users/me`)
| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/profile` | Bearer | Update display name + country/region |
| POST | `/change-password` | Bearer | Change password, revoke all sessions |
| POST | `/sessions/revoke-all` | Bearer | Revoke all refresh sessions |

### Community (`/api/community`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | — | List all active forum categories |
| GET | `/categories/{slug}` | — | Get category by slug |
| GET | `/posts` | — | List published posts (optional `?categorySlug`) |
| GET | `/posts/{id}` | — | Get post detail |
| POST | `/posts` | Bearer | Create post |
| POST | `/posts/{id}/reports` | Bearer | Report a post |
| POST | `/posts/{id}/like` | Bearer | Toggle like |
| POST | `/posts/{id}/bookmark` | Bearer | Toggle bookmark |
| GET | `/bookmarks` | Bearer | Get bookmarked posts |
| GET | `/posts/{id}/comments` | — | List comments |
| POST | `/posts/{id}/comments` | Bearer | Create comment |
| POST | `/comments/{id}/reports` | Bearer | Report a comment |
| POST | `/comments/{id}/like` | Bearer | Toggle comment like |

### Moderation (`/api/moderation`) — requires OWNER, ADMIN, or MODERATOR role
| Method | Path | Description |
|---|---|---|
| GET | `/reports` | List reports (`?status=`, `?targetType=`, `?limit=`) |
| POST | `/reports/posts/{id}/resolve` | Resolve or dismiss a post report |
| POST | `/reports/posts/{id}/hide` | Hide post content + resolve report |
| POST | `/reports/comments/{id}/resolve` | Resolve or dismiss a comment report |
| POST | `/reports/comments/{id}/hide` | Hide comment content + resolve report |
| POST | `/posts/{id}/lock` | Lock a thread |
| POST | `/users/{id}/ban` | Ban a user + revoke all sessions |

---

## Auth Flow

1. **Register** → pending account created, verification email sent via Resend.
2. **Verify email** → account becomes ACTIVE.
3. **Login** → JWT access token (15 min) returned in body; refresh token in `HttpOnly` cookie.
4. **Authenticated requests** → send `Authorization: Bearer <access_token>`.
5. **Refresh** → POST `/api/auth/refresh` with cookie → new JWT + rotated cookie.
6. **Logout** → refresh session revoked; cookie cleared.

Rate limits (in-memory sliding window, disabled in tests):
- Login: 10 attempts / 15 min per IP
- Resend verification: 5 / hour per IP
- Forgot password: 5 / hour per IP
- Reset password: 10 / 15 min per IP

---

## Logging

Log files are written to `logs/` relative to the working directory:

| File | Contents | Retention |
|---|---|---|
| `logs/app.log` | All levels (INFO+) | 30 days, 50 MB/file |
| `logs/error.log` | ERROR only | 60 days, 20 MB/file |

Every log line includes the `requestId` from MDC (injected by `MdcRequestFilter`).
The `AccessLogFilter` records `METHOD /path STATUS Xms` for every HTTP request.

To enable Hibernate SQL logging in development, add to `.env`:
```
SPRING_PROFILES_ACTIVE=dev
```

---

## Database

PostgreSQL 18 via Docker Compose (`infrastructure/docker-compose.yml`).

- Slow queries (>500 ms) are logged by PostgreSQL itself.
- Schema is managed exclusively via Flyway migrations — never edit an applied migration.
- Applied: **V1–V10**. Next migration must be **V11**.
- DDL changes in `docker-compose.yml` take effect after container recreation:
  ```bash
  docker compose down && docker compose up -d
  ```
