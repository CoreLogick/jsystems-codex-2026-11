import { expect, test } from "@playwright/test";

test("new deck shell validates and preserves locale on the real app", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sessionPosts = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
    if (message.type() === "warning") warnings.push(message.text());
  });
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/sessions") sessionPosts++;
  });

  await page.setViewportSize({ width: 1280, height: 900 });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/new$/);
  await expect(page.getByRole("heading", { name: "Create a revision deck" })).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  const images = page.getByRole("main").getByRole("img");
  await expect(images).toHaveCount(5);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.screenshot({ path: testInfo.outputPath("new-deck-en.png"), fullPage: true });

  await page.getByLabel("Grade", { exact: true }).selectOption("");
  await page.getByLabel("Material type", { exact: true }).selectOption("");
  await page.getByRole("button", { name: "Create deck", exact: true }).click();
  for (const message of ["Enter a book name.", "Enter a chapter.", "Select a grade.", "Select a material type."]) {
    await expect(page.getByRole("alert").filter({ hasText: message })).toBeVisible();
  }
  expect(sessionPosts).toBe(0);
  await expect(page.getByLabel("Grade", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Material type", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await page.screenshot({ path: testInfo.outputPath("new-deck-errors.png"), fullPage: true });

  await page.getByLabel("Book name", { exact: true }).fill("Synthetic Devices");
  await page.getByLabel("Book name", { exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Chapter name or number", { exact: true })).toBeFocused();
  await page.getByLabel("Chapter name or number", { exact: true }).fill("Unit 1");
  await page.getByRole("button", { name: "PL", exact: true }).click();
  await expect(page.getByLabel("Nazwa podręcznika", { exact: true })).toHaveValue("Synthetic Devices");
  await expect(page.getByLabel("Rozdział - nazwa lub numer", { exact: true })).toHaveValue("Unit 1");
  await expect(page.getByRole("alert").filter({ hasText: "Wpisz nazwę podręcznika." })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pl");
  await page.screenshot({ path: testInfo.outputPath("new-deck-pl.png"), fullPage: true });

  await page.reload();
  await expect(page.getByRole("heading", { name: "Utwórz prezentację powtórkową" })).toBeVisible();
  await expect(page.locator("output")).toHaveText("English");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const image of await images.all()) await image.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("new-deck-mobile-pl.png"), fullPage: true });
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
  expect(sessionPosts).toBe(0);
});
