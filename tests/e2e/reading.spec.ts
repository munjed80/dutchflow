import { expect, test } from "@playwright/test";
import readings from "../../src/data/readings.json";

test("reading library links to rich texts with translation, contextual notes and evidence-based feedback", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "افتح مكتبة القراءة" }).click();
  await expect(page.locator(".reading-tile")).toHaveCount(8);
  await page.locator(".reading-tile").first().click();
  await expect(page.locator(".reading-passage")).toHaveAttribute("lang", "nl");
  await expect(page.locator(".reading-passage p")).toHaveText(readings[0].text);
  await expect(page.locator(".reading-translation p")).toBeHidden();
  await page.getByText("أظهر الترجمة العربية", { exact: true }).click();
  await expect(page.locator(".reading-translation p")).toHaveText(readings[0].translation);
  await expect(page.locator(".reading-vocabulary dt")).toHaveCount(5);
  await expect(page.locator(".reading-grammar blockquote")).toHaveText(readings[0].grammar.example);
  await page.evaluate(() => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["pharmacy"] })));
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-quiz").getByRole("alert")).toHaveText("اختر إجابة لكل سؤال أولاً.");
  await expect(page.getByRole("radio").first()).toBeFocused();
  for (const question of readings[0].questions) await page.locator(`#${question.id}-${question.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toHaveText("نتيجة هذه المحاولة: 3 من 3");
  for (const [index, question] of readings[0].questions.entries()) await expect(page.locator(".reading-feedback blockquote").nth(index)).toHaveText(question.evidence);
  const first = readings[0].questions[0];
  await page.locator(`#${first.id}-${(first.correctIndex + 1) % 3}`).check();
  await expect(page.locator(".reading-result")).toHaveCount(0);
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toHaveText("نتيجة هذه المحاولة: 2 من 3");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-progress-v1")!).completedLessons)).toEqual(["pharmacy"]);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
  await page.getByRole("button", { name: "أعد أسئلة القراءة" }).click();
  await expect(page.locator("input:checked")).toHaveCount(0);
  await page.locator(".next-lesson").click();
  await expect(page).toHaveURL(`/reading/${readings[1].slug}`);
  await expect(page.locator(".reading-passage p")).toHaveText(readings[1].text);
  await expect(page.locator("input:checked")).toHaveCount(0);
});

test("reading routes render all authored content and link back to source lessons", async ({ request }) => {
  for (const reading of readings) {
    const response = await request.get(`/reading/${reading.slug}`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(reading.dutchTitle);
    for (const slug of reading.sourceLessons) expect(html).toContain(`/learn/${slug}`);
  }
  expect((await request.get("/reading/unknown")).status()).toBe(404);
});

test("lesson entry points and mobile reading feedback remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const reading = readings.find((item) => item.slug === "a-changed-appointment")!;
  await page.goto("/learn/doctor-appointment");
  await page.locator(".reading-related").getByRole("link", { name: `${reading.title} ←` }).click();
  await expect(page.locator(".reading-passage p")).toHaveText(reading.text);
  await page.getByText("أظهر الترجمة العربية", { exact: true }).click();
  for (const question of reading.questions) await page.locator(`#${question.id}-0`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator("input:checked")).toHaveCount(0);
  await expect(page.locator(".reading-result")).toHaveCount(0);
  await expect(page.locator(".reading-translation p")).toBeHidden();
});
