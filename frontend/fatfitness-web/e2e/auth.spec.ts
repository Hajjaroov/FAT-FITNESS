import { expect, test } from "@playwright/test";
import { e2eUser } from "./credentials";

// Exercises the login UI itself. One login per run — the backend allows
// 10 logins per 15 minutes per IP, shared with the API logins in helpers.ts.
test("signs in through the login form and lands in the community", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(e2eUser.email);
  await page.getByLabel("Password").fill(e2eUser.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/community");
  await expect(page.getByRole("link", { name: new RegExp(e2eUser.displayName) })).toBeVisible();
});
