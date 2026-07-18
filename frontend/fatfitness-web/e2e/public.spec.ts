import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home page renders the hero and navigates to the journal", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Realistic support for people who do not see themselves in polished fitness culture.",
      }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Journal", exact: true }).first().click();
    await page.waitForURL("**/journal");
    await expect(page.getByRole("link", { name: "Food & Diet" })).toBeVisible();
  });

  test("journal food page shows the diet daily totals", async ({ page }) => {
    await page.goto("/journal/food-and-diet");

    await expect(page.getByText("1810 kcal", { exact: true })).toBeVisible();
    await expect(page.getByText("29.4 g", { exact: true })).toBeVisible();
  });
});
