import { expect, test } from "@playwright/test";
import { loginViaApi } from "./helpers";

// Runs as the seeded e2e user; the GLP-1 log is private to that account, so
// repeated runs never touch the owner's own data.
test("logs a GLP-1 dose and sees it in the entry list", async ({ page }) => {
  const uniqueNote = `e2e smoke run ${Date.now()}`;

  await loginViaApi(page);
  await page.goto("/myplan/glp1");
  await expect(page.getByRole("heading", { name: "My GLP-1 Log" })).toBeVisible();

  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByLabel("Dose (mg)").fill("2.5");
  await page.getByLabel("Notes (optional)").fill(uniqueNote);
  await page.getByRole("button", { name: "Add entry" }).click();

  await expect(page.getByText(uniqueNote)).toBeVisible();
});
