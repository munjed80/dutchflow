import { expect, test } from "@playwright/test";
import lessons from "../../src/data/lessons.json";
const key = "dutchflow-review-v1";

test("phrases from different lessons persist, form a recall session, and can be removed explicitly", async ({ page }) => {
  await page.goto("/review");
  await expect(page.getByText("اختر أول جملة للمراجعة")).toBeVisible();
  await page.evaluate(() => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["pharmacy"] })));
  for (const lesson of lessons.slice(0, 2)) {
    await page.goto(`/learn/${lesson.slug}`);
    const card = page.locator(".phrase-card").first();
    await card.getByRole("button", { name: "أضف للمراجعة", exact: true }).click();
    await expect(card.getByRole("button", { name: "ضمن قائمة المراجعة" })).toBeDisabled();
  }
  await page.getByRole("navigation", { name: "القائمة الرئيسية" }).getByRole("link", { name: "المراجعة", exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(page.locator(".review-list li")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".review-list li")).toHaveCount(2);
  await page.getByRole("button", { name: "ابدأ جلسة المراجعة" }).click();
  await expect(page.locator(".review-answer")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "تذكّرتها", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "أظهر الجملة", exact: true }).click();
  await expect(page.locator(".review-answer>p[lang=nl]")).toHaveText(lessons[0].phrases[0].dutch);
  await page.getByRole("button", { name: "تحتاج مراجعة أخرى", exact: true }).click();
  await page.getByRole("button", { name: "أظهر الجملة", exact: true }).click();
  await page.getByRole("button", { name: "تذكّرتها", exact: true }).click();
  await expect(page.locator(".review-score")).toHaveText("تذكّرت 1 من 2");
  await page.getByRole("button", { name: "راجع الجمل الصعبة مجدداً" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "1");
  await expect(page.locator(".review-answer")).toHaveCount(0);
  await page.getByRole("button", { name: "إنهاء الجلسة والعودة للقائمة" }).click();
  await expect(page.locator(".review-list li")).toHaveCount(2);
  await page.getByLabel("اختر الدرس").selectOption(lessons[1].slug);
  await expect(page.locator(".review-list li")).toHaveCount(1);
  await page.getByRole("button", { name: `أزل من المراجعة: ${lessons[1].phrases[0].dutch}`, exact: true }).click();
  await expect(page.getByLabel("اختر الدرس")).toHaveValue("");
  await expect(page.locator(".review-list li")).toHaveCount(1);
  await page.getByRole("button", { name: "إفراغ قائمة المراجعة", exact: true }).click();
  await page.getByRole("button", { name: "إلغاء", exact: true }).click();
  await expect(page.locator(".review-list li")).toHaveCount(1);
  await page.getByRole("button", { name: "إفراغ قائمة المراجعة", exact: true }).click();
  await page.getByRole("button", { name: "نعم، أفرغ القائمة", exact: true }).click();
  await expect(page.getByText("اختر أول جملة للمراجعة")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-progress-v1")!).completedLessons)).toEqual(["pharmacy"]);
});

test("corrupt storage requires explicit recovery and failed writes never claim success", async ({ page }) => {
  await page.goto("/review");
  await page.evaluate((key) => localStorage.setItem(key, "{broken"), key);
  await page.reload();
  await expect(page.locator(".review-practice").getByRole("alert")).toContainText("تعذّر قراءة");
  await page.getByRole("button", { name: "إفراغ قائمة المراجعة", exact: true }).click();
  await page.getByRole("button", { name: "نعم، أفرغ القائمة", exact: true }).click();
  await expect(page.getByText("اختر أول جملة للمراجعة")).toBeVisible();
  await page.goto("/learn/introductions");
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException("Full", "QuotaExceededError"); return original.call(this, name, value); };
    Reflect.set(window, "restoreReviewStorage", () => { Storage.prototype.setItem = original; });
  }, key);
  const card = page.locator(".phrase-card").first();
  await card.getByRole("button", { name: "أضف للمراجعة", exact: true }).click();
  await expect(card.getByRole("status")).toContainText("لم يُحفظ التغيير");
  await expect(card.getByRole("button", { name: "ضمن قائمة المراجعة" })).toHaveCount(0);
  await page.evaluate(() => Reflect.get(window, "restoreReviewStorage")());
  await card.getByRole("button", { name: "أضف للمراجعة", exact: true }).click();
  await expect(card.getByRole("button", { name: "ضمن قائمة المراجعة" })).toBeDisabled();
});

test("review syncs sequential tab changes, caps sessions, and fits mobile screens", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/review");
  const other = await context.newPage();
  await other.goto("/review");
  const ids = lessons.flatMap((lesson) => lesson.phrases.map((phrase) => phrase.id)).slice(0, 12);
  await other.evaluate(({ key, ids }) => localStorage.setItem(key, JSON.stringify({ version: 1, phraseIds: ids })), { key, ids });
  await expect(page.locator(".review-list li")).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "ابدأ جلسة المراجعة" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "10");
  await page.getByRole("button", { name: "أظهر الجملة", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await other.evaluate((key) => localStorage.removeItem(key), key);
  await expect(page.getByText("اختر أول جملة للمراجعة")).toBeVisible();
  await other.close();
});
