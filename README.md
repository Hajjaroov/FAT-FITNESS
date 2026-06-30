# Fat Fitness Community

A personal weight-loss journey site and beginner-friendly peer-support forum.

> "I am not a coach or athlete. I am documenting my own weight-loss journey from 203 kg and building a community for people who want realistic, beginner-friendly support."

---

## What this is

| Area | Description |
|---|---|
| **Journal** | Personal diet, training, and medical (GLP-1) journey made public |
| **Community** | Forum-style peer-support for overweight beginners |
| **Messages** | Private async one-to-one inbox between members, with email notifications |
| **Accounts** | Registration, email verification, login, profile settings |
| **Admin** | Moderation dashboard for report review, content hide, thread lock, user ban |

This is not a coaching product or medical advice platform. All content is personal experience shared as-is.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Spring Boot 4.1, Java 21, Gradle |
| Database | PostgreSQL 18 via Docker Compose |
| Migrations | Flyway (V1–V11 applied; next is V12) |
| Auth | JWT access tokens + HttpOnly refresh cookie + Resend email |
| Logging | Logback (backend) · Winston (frontend) · PostgreSQL slow-query log |

---

## Repository Layout

```
fat-fitness/
├── backend/
│   └── fatfitness-api/       Spring Boot REST API (port 8080)
├── docs/
│   ├── dev-agent-plan.md     Agent handoff + current state (git-ignored)
│   ├── product-plan.md       Product decisions and direction
│   ├── tech-stack.md         Architecture notes
│   ├── api-notes.md          API design notes
│   ├── database-notes.md     Schema notes
│   └── content-notes.md      Raw personal content for journal pages
├── frontend/
│   └── fatfitness-web/       Next.js web app (port 3000)
├── infrastructure/
│   └── docker-compose.yml    PostgreSQL 18 container
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Docker Desktop** — for the PostgreSQL container
- **Java 21** — for the Spring Boot backend
- **Node.js 20+** — for the Next.js frontend

---

## Local Development

### 1 — Start the database

```bash
cd infrastructure
docker compose up -d
```

PostgreSQL 18 will be available at `localhost:5432`.

### 2 — Start the backend

```bash
cd backend/fatfitness-api
./gradlew bootRun       # Windows: .\gradlew.bat bootRun
```

The API will be available at `http://localhost:8080`.

Copy `.env.example` to `.env` and fill in your local values before the first run:

```bash
cp backend/fatfitness-api/.env.example backend/fatfitness-api/.env
```

### 3 — Start the frontend

```bash
cd frontend/fatfitness-web
npm install
npm run dev
```

The site will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/fatfitness-api/.env`)

| Variable | Required | Description |
|---|---|---|
| `FATFITNESS_JWT_SECRET` | Yes (prod) | HS256 signing secret, min 32 chars |
| `RESEND_API_KEY` | Yes (prod) | Resend API key for email delivery |
| `MAIL_FROM` | Yes (prod) | Verified sender address |
| `APP_BASE_URL` | Yes (prod) | Frontend origin (e.g. `https://fatfitness.de`) |
| `FATFITNESS_OWNER_EMAIL` | Dev only | Seed the first owner account on startup |
| `FATFITNESS_OWNER_DISPLAY_NAME` | Dev only | Owner display name |
| `FATFITNESS_OWNER_COUNTRY_REGION_CODE` | Dev only | ISO country code |
| `FATFITNESS_OWNER_PASSWORD` | Dev only | Owner password (dev seed only) |
| `FATFITNESS_CORS_ALLOWED_ORIGINS` | Yes (prod) | Comma-separated allowed origins (default `http://localhost:3000`) |
| `FATFITNESS_REFRESH_COOKIE_SECURE` | Yes (prod) | Set `true` so refresh cookies are HTTPS-only (default `false`) |
| `SPRING_PROFILES_ACTIVE` | Optional | Set to `dev` to enable Hibernate SQL logging |

### Frontend (`frontend/fatfitness-web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (default: `http://localhost:8080`) |

---

## Acceptance Checks

Run these before committing meaningful changes:

```bash
# Backend
cd backend/fatfitness-api
.\gradlew.bat test --no-daemon

# Frontend
cd frontend/fatfitness-web
npm run lint
npm run build
```

---

## Key URLs (local)

| URL | Description |
|---|---|
| `http://localhost:3000` | Frontend |
| `http://localhost:3000/journal` | Journal overview |
| `http://localhost:3000/community` | Forum index |
| `http://localhost:3000/messages` | Private message inbox |
| `http://localhost:3000/settings` | Account settings (profile, password, sessions, avatar) |
| `http://localhost:3000/dashboard` | Signed-in account dashboard |
| `http://localhost:3000/admin` | Moderation dashboard (OWNER/ADMIN/MODERATOR) |
| `http://localhost:8080/api/status` | Backend health check |

---

## Production Notes

- Remove or disable the owner seed before public launch.
- Set `FATFITNESS_REFRESH_COOKIE_SECURE=true` and `FATFITNESS_CORS_ALLOWED_ORIGINS` to the production frontend origin(s).
- Confirm `RESEND_API_KEY`, `MAIL_FROM`, and `APP_BASE_URL` are set.
- Do **not** activate the `dev` Spring profile in production.
- Ensure the process user has write access to the `logs/` directories.
- Flyway migrations V1–V11 are applied. The next migration must be **V12**.
- Review GDPR / data deletion requirements before collecting real user data.
