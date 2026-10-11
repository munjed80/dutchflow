import { expect, test } from "@playwright/test";
import sets from "../../src/data/a2-recycling.json";

test("cross-unit retrieval keeps models hidden, resets answers and leaves progress untouched", async ({ page }) => {
  await page.goto("/a2");
  await page.evaluate(() => localStorage.setItem("dutchflow-progress-v1", JSON.stringify(["introductions"])));
  const before = await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"));
  await page.getByRole("link", { name: "استرجاع وتطبيق", exact: true }).click();
  await page.getByRole("link", { name: `ابدأ: ${sets[0].title} ←`, exact: true }).click();
  await expect(page.locator(".production-model").first()).toBeHidden();
  await expect(page.locator(".production-cue")).toHaveCount(1);
  await page.locator("#production-0").fill("Mijn eigen antwoord.");
  await page.getByText("قارن بمثال وراجع إجابتك", { exact: true }).first().click();
  await expect(page.locator(".production-model").first()).toHaveText(sets[0].tasks[0].model);
  await expect(page.locator("#production-0")).toHaveValue("Mijn eigen antwoord.");
  await page.locator('a[rel="next"]').click();
  await expect(page.locator("#production-0")).toHaveValue("");
  await expect(page.locator(".production-model").first()).toBeHidden();
  await page.locator("#production-0").fill("Temporary text");
  await page.reload();
  await expect(page.locator("#production-0")).toHaveValue("");
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBe(before);
  const missing = await page.goto("/a2-recycling/not-a-set");
  expect(missing?.status()).toBe(404);
});

test("all recycling routes expose help links and remain usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const set of sets) {
    await page.goto(`/a2-recycling/${set.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(set.title);
    await expect(page.getByRole("textbox")).toHaveCount(2);
    await page.locator("#production-0").fill("woord ".repeat(100));
    await expect(page.locator("#production-0")).toHaveAttribute("maxlength", "500");
    await page.locator(".recycling-help summary").click();
    for (const anchor of set.anchors) await expect(page.locator(`.recycling-help a[href="/learn/${anchor.lessonSlug}"]`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await expect(page.getByRole("link", { name: "المراجعة الختامية المتكاملة ←" })).toBeVisible();
  await page.goto(`/learn/${sets[0].anchors[0].lessonSlug}`);
  await page.locator(`a[href="/a2-recycling/${sets[0].slug}"]`).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(sets[0].title);
});
