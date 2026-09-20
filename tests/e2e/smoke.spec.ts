import { test, expect } from "@playwright/test";

test("register, log a workout, and see it on the PR dashboard", async ({ page }) => {
  const email = `e2e+${Date.now()}@example.com`;
  const password = "supersecret123";

  await test.step("register", async () => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("E2E Smoke");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("**/dashboard");
  });

  await test.step("start a blank workout", async () => {
    await page.goto("/workout/start");
    await page.getByRole("button", { name: /start empty workout/i }).click();
    await page.waitForURL(/\/workout\/[a-z0-9]{10,}$/i);
  });

  await test.step("add an exercise and log a set", async () => {
    await page.getByRole("button", { name: /add exercise/i }).click();
    await page.getByPlaceholder("Search exercises...").fill("Back Squat");
    await expect(page.getByText("Back Squat", { exact: true })).toBeVisible();
    await page.getByText("Back Squat", { exact: true }).click();

    await page.locator('input[id^="weight-"]').fill("100");
    await page.locator('input[id^="reps-"]').fill("5");
    await page.getByRole("button", { name: /log set/i }).click();
    await expect(page.getByText(/new pr/i)).toBeVisible({ timeout: 10_000 });
  });

  await test.step("finish the workout", async () => {
    await page.getByRole("button", { name: /finish workout/i }).click();
    await page.waitForURL("**/history");
    await expect(page.getByText("Back Squat")).toBeVisible();
  });

  await test.step("see the new PR on the dashboard", async () => {
    await page.goto("/prs");
    await expect(page.getByText("Back Squat").first()).toBeVisible();
    await expect(page.getByText("100 kg").first()).toBeVisible();
  });
});
