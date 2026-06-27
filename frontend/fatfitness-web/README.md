# fatfitness-web

Next.js 16 (App Router) frontend for the Fat Fitness Community — a personal weight-loss journal and peer-support forum.

- **Dev server**: `http://localhost:3000`
- **Backend API**: configured via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`)

---

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run lint     # ESLint
```

---

## Environment

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## Directory Structure

```
src/
├── app/                         Next.js App Router
│   ├── _components/             Shared page-level components
│   │   ├── SiteHeader.tsx         Three-pill desktop nav + mobile burger panel
│   │   ├── PageShell.tsx          Page wrapper (header + footer)
│   │   ├── ThemeProvider.tsx      Dark/light mode (.dark class, hasHydrated guard)
│   │   ├── LocaleProvider.tsx     EN/DE locale (hasHydrated guard)
│   │   ├── AuthProvider.tsx       JWT session, refresh, logout
│   │   ├── WeightChart.tsx        Recharts weight progress (dual responsive chart)
│   │   ├── WarmupCarousel.tsx     Training warm-up carousel (desktop)
│   │   ├── ExerciseCarousel.tsx   Training exercise carousel (desktop)
│   │   ├── FoodAndDietView.tsx    Food & Diet page with supplement modals
│   │   └── AdminModerationView.tsx  /admin report dashboard
│   │
│   ├── api/log/route.ts         Client log ingest endpoint (rate-limited 30/min/IP)
│   │
│   ├── community/               Forum pages
│   │   ├── page.tsx               Forum index
│   │   ├── guidelines/            Community guidelines
│   │   ├── categories/[slug]/     Category thread list
│   │   └── posts/[id]/            Post detail + comments
│   │
│   ├── journal/                 Journal pages
│   │   ├── page.tsx               Overview (weight chart + stats)
│   │   ├── food-and-diet/         Diet stats, meals, supplement modals
│   │   ├── training/              Workout schedule + carousels
│   │   └── medical-journey/       GLP-1 timeline + log table
│   │
│   ├── admin/                   Moderation dashboard (OWNER/ADMIN/MODERATOR only)
│   ├── dashboard/               Signed-in account summary
│   ├── settings/                Profile edit, change password, active sessions
│   ├── login/
│   ├── register/
│   ├── verify-email/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── impressum/
│   ├── privacy/
│   ├── globals.css              CSS variables, site-* utility classes, dark variant
│   └── layout.tsx               Blocking theme script in <head> + provider tree
│
├── content/                     All EN + DE page copy — edit here, not in TSX
│   ├── journal.ts                 Journal overview, food/diet, training, medical,
│   │                              supplements (rich objects with photos + facts)
│   ├── home.ts                    Homepage
│   ├── community.ts               Community / forum copy
│   ├── auth.ts                    Login, register, verify, forgot/reset password
│   ├── account.ts                 Dashboard, settings
│   ├── admin.ts                   Moderation dashboard
│   ├── settings.ts                Settings page copy
│   ├── site.ts                    Shared labels, nav links, footer
│   └── countries.ts               Country/region list (searchable picker)
│
├── lib/
│   ├── api.ts                   All backend fetch calls; ApiError class
│   ├── logger.ts                Browser-safe client logger → POST /api/log
│   ├── server-logger.ts         Winston server-only logger (server-only import guard)
│   ├── config.ts                NEXT_PUBLIC_API_BASE_URL
│   ├── utils.ts                 Shared helpers
│   └── validators.ts            Form validation helpers
│
└── types/
    ├── auth.ts                  Auth request/response types
    ├── community.ts             Forum post, comment, report types
    ├── moderation.ts            Moderation report types
    └── api.ts                   Shared API types

public/
└── photos/
    ├── exercises/               Exercise photos (set photoSrc in journal.ts)
    ├── warmup/                  Warm-up photos
    └── supplements/             Supplement product photos (7 PNG + 1 JPG)

logs/                            Winston log files — git-ignored
├── app-YYYY-MM-DD.log           All levels, 30-day retention
├── error-YYYY-MM-DD.log         Errors only, 60-day retention
└── client-YYYY-MM-DD.log        Browser errors from /api/log, 30-day retention
```

---

## Key Conventions

### Dark mode
`.dark` class on `<html>` applied by a blocking `<script>` in `layout.tsx` before hydration. Never `data-theme`. `ThemeProvider` uses a `hasHydrated` guard so the stored preference is never overwritten on mount.

### Locale (EN / DE)
`LocaleProvider` stores `"en"` or `"de"` in `localStorage`. Same `hasHydrated` guard pattern. German copy always uses proper characters: **ä ö ü ß** — never `ae oe ue ss`.

### Content
All user-facing copy lives in `src/content/*.ts` as `{ en: {...}, de: {...} }` objects. Use `useLocalizedContent(copy)` in any client component to get the active locale's object. Never put long text strings directly in route or view TSX files.

### Photos
Drop images in `public/photos/<category>/`. Set `photoSrc: "/photos/<category>/filename.ext"` on the relevant item in `src/content/journal.ts`. To bust a stale dev cache, stop the server, delete `.next/dev/cache/images/`, and restart.

### Logging
- **Server-side** (API routes): import `serverLogger` from `@/lib/server-logger`.
- **Client-side**: import `logger` from `@/lib/logger`. Calls are fire-and-forget — they POST to `/api/log` and never block the UI.
- Log files are written to `logs/` relative to the Next.js working directory.
