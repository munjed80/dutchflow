import { expect, test } from "@playwright/test";
import readings from "../../src/data/readings.json";
import packs from "../../src/data/a1-practice.json";

test("reading remediation uses only checked mistakes, deduplicates lessons and clears stale advice", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const reading = readings.find((item) => item.slug === "a-morning-routine")!;
  await page.goto(`/reading/${reading.slug}`);
  const quiz = page.locator(".reading-quiz");
  const review = quiz.locator(".practice-review");
  await expect(review).toHaveCount(0);
  await quiz.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(review).toHaveCount(0);
  for (const [index, question] of reading.questions.entries()) {
    await page.locator(`#${question.id}-${index < 2 ? (question.correctIndex + 1) % 3 : question.correctIndex}`).check();
  }
  await expect(review).toHaveCount(0);
  await quiz.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(quiz.locator(".reading-result h3")).toBeFocused();
  await expect(review).toHaveAccessibleName("دروس مقترحة للمراجعة");
  await expect(review.getByRole("link")).toHaveCount(1);
  await expect(review.getByRole("link")).toHaveAttribute("href", "/learn/time-and-days");
  await expect(review).toContainText("الأسئلة: 1، 2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const first = reading.questions[0];
  await page.locator(`#${first.id}-${first.correctIndex}`).check();
  await expect(review).toHaveCount(0);
  await quiz.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(review).toContainText("الأسئلة: 2");
  await expect(review).not.toContainText("الأسئلة: 1");
  const second = reading.questions[1];
  await page.locator(`#${second.id}-${second.correctIndex}`).check();
  await quiz.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(quiz.locator(".reading-result")).toContainText("3 من 3");
  await expect(review).toHaveCount(0);
  await quiz.getByRole("button", { name: "أعد أسئلة القراءة" }).click();
  await expect(quiz.getByRole("radio").first()).toBeFocused();
  await expect(quiz.locator("input:checked")).toHaveCount(0);
  for (const question of reading.questions) await page.locator(`#${question.id}-${(question.correctIndex + 1) % 3}`).check();
  await quiz.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await review.locator('a[href="/learn/time-and-days"]').click();
  await expect(page).toHaveURL("/learn/time-and-days");
  for (const key of ["dutchflow-progress-v1", "dutchflow-review-v1"]) expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBeNull();
  await page.goto(`/reading/${reading.slug}`);
  await expect(review).toHaveCount(0);
});

test("reading and listening advice stay separate and listening restart removes advice and relocks questions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pack = packs.find((item) => item.slug === "final-review")!;
  await page.goto(`/a1-practice/${pack.slug}`);
  const read = page.locator("#read");
  for (const [index, question] of pack.reading.questions.entries()) await read.locator(`#${question.id}-${index === 0 ? (question.correctIndex + 1) % 3 : question.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".practice-review a")).toHaveCount(2);
  const listen = page.locator("#listen");
  await expect(listen.locator(".practice-review")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  for (const [index, question] of pack.listening.questions.entries()) await listen.locator(`#${question.id}-${index === 3 ? (question.correctIndex + 1) % 3 : question.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".practice-review a")).toHaveCount(1);
  await expect(listen.locator(".practice-review a")).toHaveAttribute("href", "/learn/belongings-and-articles");
  await expect(listen.locator(".practice-review")).not.toContainText("الأسئلة: 1");
  await expect(page.locator('[id="reading-questions-review"]')).toHaveCount(1);
  await expect(page.locator('[id="listening-questions-review"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await listen.getByRole("button", { name: "أعد أسئلة الاستماع" }).click();
  await expect(listen.locator(".practice-review")).toHaveCount(0);
  await expect(listen).toContainText("لا يُحسب استماعاً مستقلاً");
  await expect(read.locator(".practice-review a")).toHaveCount(2);
  await listen.getByRole("button", { name: "ابدأ الاستماع من جديد" }).click();
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await expect(listen.locator(".practice-review")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".practice-review")).toHaveCount(0);
});

test("integrated practice navigation reaches the final review without wrapping it into a new attempt", async ({ page }) => {
  for (const [index, pack] of packs.entries()) {
    await page.goto(`/a1-practice/${pack.slug}`);
    const navigation = page.getByRole("navigation", { name: "التنقل بين مراجعات A1" });
    await expect(navigation.getByRole("link", { name: "كل مراجعات A1 ←" })).toHaveAttribute("href", "/a1-practice");
    const next = navigation.locator(".next-lesson");
    if (packs[index + 1]) await expect(next).toHaveAttribute("href", `/a1-practice/${packs[index + 1].slug}`);
    else await expect(next).toHaveCount(0);
  }
});
