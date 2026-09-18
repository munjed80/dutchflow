import { expect, test } from "@playwright/test";
import lessons from "../../src/data/lessons.json";

test("catalogue search and module filters work together and can be cleared", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.locator(".catalogue-item")).toHaveCount(lessons.length);
  await page.getByLabel("ابحث عن درس").fill("الصيدلية");
  await expect(page.locator(".catalogue-item")).toHaveCount(1);
  await expect(page.locator(".catalogue-item")).toHaveAttribute("href", "/learn/pharmacy");
  await page.getByLabel("ابحث عن درس").fill("APOTHEEK");
  await expect(page.locator(".catalogue-item")).toHaveCount(1);
  await page.getByRole("button", { name: "المواعيد والخدمات", exact: true }).click();
  await page.getByLabel("ابحث عن درس").fill("");
  await expect(page.locator(".catalogue-item")).toHaveCount(lessons.filter((lesson) => lesson.moduleId === "appointments").length);
  await page.getByLabel("ابحث عن درس").fill("not-a-lesson");
  await expect(page.getByRole("heading", { name: "لا توجد دروس مطابقة" })).toBeVisible();
  await page.getByRole("button", { name: "اعرض كل الدروس" }).click();
  await expect(page.locator(".catalogue-item")).toHaveCount(lessons.length);
});

test("legacy progress survives lesson reordering and uses the expanded denominator", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("dutchflow-progress-v1", JSON.stringify({
      completedLessons: ["introductions", "doctor-appointment", "at-the-shop"],
    }));
  });
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(lessons.length));
  await expect(page.locator(".completion-dot.done")).toHaveCount(3);
  await page.goto("/learn");
  await expect(page.locator(".catalogue-complete")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "تابع هذا الدرس" })).toHaveAttribute("href", "/learn/personal-details");
});

test("a lesson can be completed and retried without an incorrect success message", async ({ page }) => {
  await page.goto("/learn/personal-details");
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.getByText("اختر إجابة لكل سؤال أولاً.")).toBeVisible();
  const questions = page.locator(".quiz-question");
  for (let index = 0; index < 3; index += 1) await questions.nth(index).getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".retry-message")).toContainText("1 من 3");
  await questions.nth(0).getByRole("radio").nth(1).check();
  await questions.nth(2).getByRole("radio").nth(2).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress");
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await page.goto("/learn/personal-details");
  for (let index = 0; index < 3; index += 1) await page.locator(".quiz-question").nth(index).getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".retry-message")).toContainText("1 من 3");
  await expect(page.locator(".success-message")).toHaveCount(0);
  await page.getByRole("navigation", { name: "التنقل بين الدروس" }).getByRole("link", { name: /الدرس التالي/ }).click();
  await expect(page).toHaveURL(/\/learn\/spelling-your-name$/);
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  await expect(page.locator(".retry-message")).toHaveCount(0);
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
});

test("all authored lesson routes render their goals and grammar, and unknown lessons return 404", async ({ page }) => {
  for (const lesson of lessons) {
    const response = await page.goto(`/learn/${lesson.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
    await expect(page.locator(".lesson-goal")).toContainText(lesson.goal);
    await expect(page.locator(".grammar-card")).toContainText(lesson.grammar.example);
  }
  await expect(page.getByRole("navigation", { name: "التنقل بين الدروس" }).getByRole("link", { name: "شاهد تقدمك" })).toHaveAttribute("href", "/progress");
  expect((await page.goto("/learn/does-not-exist"))?.status()).toBe(404);
});

test("mobile pages fit the viewport, homepage stays concise, and paid checkout stays disabled", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/learn", "/learn/pharmacy", "/progress", "/exams"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (path === "/") await expect(page.locator(".lesson-tile")).toHaveCount(3);
  }
  await expect(page.getByRole("button", { name: "متاح قريباً" })).toBeDisabled();
  expect(errors).toEqual([]);
});
