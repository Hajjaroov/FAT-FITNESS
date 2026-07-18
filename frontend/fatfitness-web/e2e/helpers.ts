import type { Page } from "@playwright/test";
import { apiBaseUrl, e2eUser } from "./credentials";

// Logs the e2e user in through the backend API. page.request shares the
// context's cookie jar, so the HttpOnly refresh cookie lands in the browser
// and the app's mount-time session restore picks it up on the next goto.
//
// Deliberately NOT a shared storageState: the backend rotates refresh tokens
// and rejects reuse after revoke, so a saved cookie is single-use — every
// authenticated spec needs its own fresh login. Keep total logins per run
// modest: the backend allows 10 per 15 minutes per IP.
export async function loginViaApi(page: Page) {
  const response = await page.request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      email: e2eUser.email,
      password: e2eUser.password,
      clientType: "WEB",
      deviceLabel: "Playwright e2e",
    },
  });
  if (!response.ok()) {
    throw new Error(`e2e login failed: HTTP ${response.status()}`);
  }
}
