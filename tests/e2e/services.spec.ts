import { expect, test } from "@playwright/test";
import extensions from "../../src/data/lesson-extensions.json";
import readings from "../../src/data/readings.json";

test("service letters preserve paragraphs on mobile and deadline feedback does not award completion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/changing-an-appointment");
  const progress = JSON.stringify({ completedLessons: ["pharmacy"] });
  await page.evaluate((value) => localStorage.setItem("dutchflow-progress-v1", value), progress);
  const model = extensions.find((item) => item.lessonSlug === "changing-an-appointment")!.tasks[0].model;
  const task = page.locator(".production-task").first();
  await expect(task.locator(".production-cue")).toHaveCSS("white-space", "pre-line");
  await task.getByRole("textbox").fill("Beste medewerker,\nKan ik dinsdag om half elf komen?\nMet vriendelijke groet,\nNour");
  await task.locator("summary").click();
  await expect(task.locator(".production-model")).toHaveText(model);
  await expect(task.locator(".production-model")).toHaveAttribute("lang", "nl");
  await expect(task.locator(".production-model")).toHaveAttribute("dir", "ltr");
  await expect(task.locator(".production-model")).toHaveCSS("white-space", "pre-line");
  await expect(task.locator("details > p").nth(1)).toHaveCSS("white-space", "pre-line");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const reading = readings.find((item) => item.slug === "a-missing-document-message")!;
  await page.locator(".reading-related").getByRole("link", { name: `${reading.title} ←` }).click();
  await expect(page).toHaveURL(`/reading/${reading.slug}`);
  await expect(page.locator(".reading-passage p")).toHaveText(reading.text);
  await expect(page.locator(".reading-passage p")).toHaveCSS("white-space", "pre-line");
  await page.locator(".reading-translation summary").click();
  await expect(page.locator(".reading-translation p")).toHaveText(reading.translation);
  await expect(page.locator(".reading-translation p")).toHaveCSS("white-space", "pre-line");
  for (const question of reading.questions.filter((_, index) => index !== 2)) {
    await page.locator(`#${question.id}-${question.correctIndex}`).check();
  }
  const deadline = reading.questions[2];
  await page.locator(`#${deadline.id}-${(deadline.correctIndex + 1) % 3}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toHaveText("نتيجة هذه المحاولة: 3 من 4");
  await expect(page.locator(".reading-feedback blockquote").nth(2)).toHaveText(deadline.evidence);
  await expect(page.locator(".reading-feedback").nth(2)).toContainText("قبل يوم الجمعة");
  await page.locator(`#${deadline.id}-${deadline.correctIndex}`).check();
  await expect(page.locator(".reading-result")).toHaveCount(0);
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toHaveText("نتيجة هذه المحاولة: 4 من 4");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBe(progress);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
  await page.reload();
  await expect(page.locator("input:checked")).toHaveCount(0);
  await expect(page.locator(".reading-result")).toHaveCount(0);
  await page.locator(".next-lesson").click();
  await expect(page).toHaveURL("/reading");
});
