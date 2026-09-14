import { expect, test } from "@playwright/test";
import lessons from "../../src/data/lessons.json";

test("writing corrections and retries preserve the first attempt and separate text help", async ({ page }) => {
  const lesson = lessons[0];
  await page.goto(`/learn/${lesson.slug}`);
  await page.evaluate(() => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["pharmacy"] })));
  await page.getByRole("link", { name: "ابدأ تدريب الكتابة" }).click();
  await expect(page.locator(".writing-model")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "قارن مع صيغة الدرس" })).toBeDisabled();
  for (const [index, phrase] of lesson.phrases.entries()) {
    if (index === 2) {
      await page.getByRole("button", { name: "أظهر صيغة الدرس للمساعدة" }).click();
      await expect(page.locator(".writing-model")).toHaveText(phrase.dutch);
    }
    const input = page.getByRole("textbox", { name: "إجابتك بالهولندية" });
    await input.fill(index === 1 ? "Ik" : `  ${phrase.dutch.toUpperCase()}  `);
    await page.getByRole("button", { name: "قارن مع صيغة الدرس" }).click();
    await expect(input).toBeDisabled();
    if (index === 1) {
      await expect(page.getByText("إجابتك تختلف عن صيغة الدرس.", { exact: true })).toBeVisible();
      await expect(page.locator(".writing-tokens mark").first()).toBeVisible();
      await page.getByRole("button", { name: "أعد كتابة الجملة", exact: true }).click();
      await expect(input).toBeFocused();
      await expect(input).toHaveValue("");
      await input.fill(phrase.dutch);
      await page.getByRole("button", { name: "قارن مع صيغة الدرس" }).click();
      await expect(page.getByText("نجحت في المراجعة. تبقى نتيجة المحاولة الأولى كما هي.")).toBeVisible();
    }
    await expect(page.getByText("إجابتك تطابق صيغة الدرس.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: index === lesson.phrases.length - 1 ? "اعرض ملخّص الكتابة" : "الجملة التالية", exact: true }).click();
  }
  await expect(page.locator(".writing-score")).toHaveText("3 من 4 جمل مطابقة دون مساعدة");
  await expect(page.getByText("أظهرت الصيغة قبل الإجابة في 1 من الجمل.")).toBeVisible();
  await page.getByText("جمل للمراجعة (2)").click();
  await expect(page.locator(".writing-review li")).toHaveCount(2);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
  await page.getByRole("button", { name: "أضف هذه الجمل للمراجعة" }).click();
  await expect(page.getByRole("button", { name: "ضمن قائمة المراجعة" })).toBeDisabled();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-review-v1")!).phraseIds)).toEqual([lesson.phrases[1].id, lesson.phrases[2].id]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-progress-v1")!).completedLessons)).toEqual(["pharmacy"]);
  await page.getByRole("button", { name: "أعد تدريب الكتابة" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByRole("textbox")).toHaveValue("");
  await expect(page.locator(".writing-model")).toHaveCount(0);
});

test("mobile text help, input limits, reload and route changes keep writing sessions independent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const lesson = lessons[1];
  await page.goto(`/learn/${lesson.slug}/writing`);
  const input = page.getByRole("textbox");
  await input.fill(" ");
  await expect(page.getByRole("button", { name: "قارن مع صيغة الدرس" })).toBeDisabled();
  await input.fill("x".repeat(600));
  await expect(input).toHaveValue("x".repeat(500));
  await page.getByRole("button", { name: "قارن مع صيغة الدرس" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(input).toHaveValue("");
  await expect(page.locator(".writing-feedback")).toHaveCount(0);
  for (const [index, phrase] of lesson.phrases.entries()) {
    await page.getByRole("button", { name: "أظهر صيغة الدرس للمساعدة" }).click();
    await input.fill(phrase.dutch);
    await page.getByRole("button", { name: "قارن مع صيغة الدرس" }).click();
    await page.getByRole("button", { name: index === lesson.phrases.length - 1 ? "اعرض ملخّص الكتابة" : "الجملة التالية", exact: true }).click();
  }
  await expect(page.getByText("كانت الجولة كلها بمساعدة النص؛ لا توجد نتيجة مستقلة.")).toBeVisible();
  await expect(page.locator(".writing-score")).toHaveText("0 من 0 جمل مطابقة دون مساعدة");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "عد إلى الدرس ←" }).click();
  await expect(page).toHaveURL(new RegExp(`/learn/${lesson.slug}$`));
  await page.getByRole("link", { name: "ابدأ تدريب الكتابة" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
});

test("all lessons expose a writing route and unknown lessons return 404", async ({ request }) => {
  for (const lesson of lessons) expect((await request.get(`/learn/${lesson.slug}/writing`)).status()).toBe(200);
  expect((await request.get("/learn/unknown/writing")).status()).toBe(404);
});
