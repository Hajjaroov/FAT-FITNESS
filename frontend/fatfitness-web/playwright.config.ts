import { defineConfig, devices } from "@playwright/test";

// End-to-end smoke tests against the real local stack. Requirements:
// - Postgres + backend running (global-setup fails fast with a clear message if not)
// - Frontend dev server on :3000 (reused if already running, started otherwise)
// Authenticated specs log in via the API per spec (see e2e/helpers.ts) — a
// shared storageState cannot work because refresh tokens are single-use
// (rotation with reuse-after-revoke rejection on the backend).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    locale: "en-US",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
