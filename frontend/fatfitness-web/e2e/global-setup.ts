import { execSync } from "node:child_process";
import { apiBaseUrl, e2eUser } from "./credentials";

// Seeds the e2e test account: registers through the real backend API (so the
// password is hashed by the backend itself), then activates it directly in the
// dev DB — email verification tokens are only ever delivered by email, so the
// verified state is set via docker exec psql instead.
export default async function globalSetup() {
  let status: Response;
  try {
    status = await fetch(`${apiBaseUrl}/api/status`);
  } catch {
    throw new Error(
      `Backend is not reachable at ${apiBaseUrl}. Start Postgres (docker compose) and the backend (gradlew bootRun) before running e2e tests.`,
    );
  }
  if (!status.ok) {
    throw new Error(`Backend status check failed: HTTP ${status.status}`);
  }

  const register = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: e2eUser.displayName,
      email: e2eUser.email,
      countryRegionCode: "DE",
      password: e2eUser.password,
      confirmPassword: e2eUser.password,
      acceptedCommunityRules: true,
      acceptedPrivacyPolicy: true,
    }),
  });
  // 201 = first run; 409 = account already seeded by a previous run.
  if (register.status !== 201 && register.status !== 409) {
    throw new Error(`Seeding the e2e user failed: HTTP ${register.status}`);
  }

  execSync(
    `docker exec fitness_postgres psql -U fitness_user -d fitness_db -c "update users set status='ACTIVE', email_verified_at=coalesce(email_verified_at, now()) where email='${e2eUser.email}';"`,
    { stdio: "pipe" },
  );
}
