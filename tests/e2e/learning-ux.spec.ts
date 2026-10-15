import { expect, test } from "@playwright/test";
import a2Lessons from "../../src/data/a2-lessons.json";

for (const level of ["A1", "A2"]) test(`${level}: the next lesson leads the mobile catalogue and skill resources keep their level`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(level === "A1" ? "/learn" : "/learn?level=A2");
  const next = page.getByRole("link", { name: "تابع هذا الدرس" });
  await expect(next).toBeVisible();
  const bounds = await next.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThan(844);
  const resources = page.locator(".learning-resources");
  await expect(resources).not.toHaveAttribute("open", "");
  const summary = resources.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  const navigation = page.getByRole("navigation", { name: `موارد التعلّم ${level}` });
  await expect(navigation).toBeVisible();
  for (const path of ["reading", "vocabulary", "scenarios", "grammar"]) {
    await expect(navigation.locator(`a[href="/${path}${level === "A2" ? "?level=A2" : ""}"]`)).toBeVisible();
  }
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await navigation.getByRole("link", { name: /المفردات/ }).click();
  await expect(page).toHaveURL(level === "A1" ? "/vocabulary" : "/vocabulary?level=A2");
});

test("catalogue with delayed or failed progress stays browsable and retries with account state", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  let fail = true;
  await page.route("**/api/progress", async (route) => {
    if (fail) { await pending; await route.fulfill({ status: 503, body: "Unavailable" }); }
    else await route.fulfill({ json: { enabled: true, user: { id: "ux-account", name: "Learner", email: "learner@example.test" }, completedLessons: [a2Lessons[0].slug] } });
  });
  await page.addInitScript(() => {
    localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["introductions", "a2-yesterday-and-today", "a2-a-day-at-work"] }));
  });
  await page.goto("/learn?level=A2");
  const banner = page.locator(".continue-banner").first();
  await expect(banner.getByRole("status")).toBeVisible();
  await expect(banner.getByRole("link")).toHaveCount(0);
  await expect(page.locator(".catalogue-item")).toHaveCount(48);
  release();
  await expect(banner.getByRole("alert")).toBeVisible();
  await expect(page.locator(".catalogue-complete")).toHaveCount(0);
  await expect(page.locator(".module-count").first()).not.toContainText("أكملت");
  await page.getByLabel("ابحث عن درس").fill(a2Lessons[0].dutchTitle);
  await expect(page.locator(".catalogue-item")).toHaveCount(1);
  fail = false;
  await banner.getByRole("button", { name: "أعد تحميل التقدّم" }).click();
  await expect(banner.getByRole("link")).toHaveAttribute("href", `/learn/${a2Lessons[1].slug}`);
  await expect(page.locator(".catalogue-complete")).toHaveCount(1);
});

test("lesson contents, skip link and missing-answer focus work with keyboard without losing answers", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/learn/${a2Lessons[0].slug}`);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "انتقل إلى المحتوى" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const contents = page.getByRole("navigation", { name: "أجزاء هذا الدرس" });
  for (const link of await contents.getByRole("link").all()) {
    const href = await link.getAttribute("href");
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(href!)).toBeFocused();
    await expect(page.locator(href!)).toBeInViewport();
  }
  const questions = page.locator(".quiz-question");
  await questions.first().getByRole("radio").first().check();
  await expect(page.locator(".quiz-answer-count")).toHaveText(`أجبت عن 1 من ${a2Lessons[0].questions.length} أسئلة`);
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(questions.nth(1).getByRole("radio").first()).toBeFocused();
  await expect(questions.nth(1)).toHaveAttribute("aria-describedby", "quiz-missing-answers");
  await expect(page.locator("#quiz-missing-answers")).toBeVisible();
  await contents.getByRole("link", { name: "الجمل", exact: true }).click();
  await contents.getByRole("link", { name: "اختبار الدرس", exact: true }).click();
  await expect(questions.first().getByRole("radio").first()).toBeChecked();
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1);
  await expect(page.locator(".success-message")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "استكشف مفردات الدروس الأخرى ←" })).toHaveAttribute("href", "/vocabulary?level=A2");
  await page.getByRole("link", { name: "↑ العودة إلى أجزاء الدرس" }).click();
  await expect(contents).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
});
