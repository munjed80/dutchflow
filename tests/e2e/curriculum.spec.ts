import { expect, test } from "@playwright/test";
import lessons from "../../src/data/lessons.json";
import units from "../../src/data/a1-roadmap.json";
import extensions from "../../src/data/lesson-extensions.json";

test("the curriculum exposes real resources and distinguishes unfinished goals from learner progress", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "استكشف خريطة A1 وأهداف التعلّم ←" }).click();
  await expect(page).toHaveURL("/curriculum");
  await expect(page.locator(".curriculum-unit")).toHaveCount(10);
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  for (const unit of units) {
    const card = page.locator(`#${unit.id}`);
    await expect(card.locator(".eyebrow")).toContainText(unit.lessonSlugs.length ? "تغطية جزئية" : "مخطط له");
    await expect(card.locator(".curriculum-resources a")).toHaveCount(unit.lessonSlugs.length + unit.readingSlugs.length);
    for (const slug of unit.lessonSlugs) await expect(card.locator(`a[href="/learn/${slug}"]`)).toHaveCount(1);
  }
  await page.getByRole("navigation", { name: "محاور خريطة التعلّم" }).getByRole("link", { name: /الهوايات/ }).click();
  await expect(page).toHaveURL(/#leisure-and-plans$/);
  await page.locator("#leisure-and-plans summary").click();
  await expect(page.locator("#leisure-and-plans details li").first()).toBeVisible();
  await expect(page.locator("#leisure-and-plans a")).toHaveCount(0);
});

test("new lessons expose inflected vocabulary and independent writing that does not award completion", async ({ page }) => {
  for (const extension of extensions) {
    const lesson = lessons.find((item) => item.slug === extension.lessonSlug)!;
    await page.goto(`/learn/${lesson.slug}`);
    await expect(page.locator(".phrase-card")).toHaveCount(8);
    await expect(page.locator(".lesson-enrichment dt")).toHaveCount(6);
    for (const [index, entry] of extension.vocabulary.entries()) {
      await expect(page.locator(".vocabulary-forms").nth(index)).toHaveText(entry.forms);
      await expect(page.locator(".lesson-enrichment dd").nth(index)).toContainText(lesson.phrases.find((phrase) => phrase.id === entry.phraseId)!.dutch);
    }
    if (extension.lessonSlug === "contact-details") {
      await expect(page.locator(".production-cue")).toHaveText("Is uw huisnummer twaalf?");
      await expect(page.locator(".production-cue")).toHaveAttribute("dir", "ltr");
    }
    const task = page.locator(".production-task").first();
    await expect(task.locator(".production-model")).toBeHidden();
    await task.getByRole("textbox").fill("Dit is mijn eigen antwoord.");
    await task.locator("summary").click();
    await expect(task.locator(".production-model")).toHaveText(extension.tasks[0].model);
    await expect(task.getByRole("textbox")).toHaveValue("Dit is mijn eigen antwoord.");
    await expect(page.locator(".success-message")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
  }
  await page.reload();
  await expect(page.getByRole("textbox").first()).toHaveValue("");
  await expect(page.locator(".production-model").first()).toBeHidden();
});

test("mobile production, phrase review, and new lesson completion survive the expanded curriculum", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (!localStorage.getItem("dutchflow-progress-v1")) localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["pharmacy"] }));
  });
  await page.goto("/curriculum");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const lesson = lessons.find((item) => item.slug === "spelling-your-name")!;
  await page.locator(`.curriculum-resources a[href="/learn/${lesson.slug}"]`).click();
  await expect(page).toHaveURL(`/learn/${lesson.slug}`);
  await page.getByRole("textbox").first().fill("x".repeat(600));
  expect((await page.getByRole("textbox").first().inputValue()).length).toBe(500);
  await page.locator(".production-task summary").first().click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".phrase-card .review-save-button").first().click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-review-v1")!).phraseIds)).toEqual([lesson.phrases[0].id]);
  for (const [index, question] of lesson.questions.entries()) await page.locator(".quiz-question").nth(index).getByRole("radio").nth(question.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-progress-v1")!).completedLessons)).toEqual(["pharmacy", lesson.slug]);
  await page.getByRole("navigation", { name: "التنقل بين الدروس" }).getByRole("link", { name: /الدرس التالي/ }).click();
  await expect(page).toHaveURL("/learn/contact-details");
  await expect(page.getByRole("textbox").first()).toHaveValue("");
  await expect(page.locator("input:checked")).toHaveCount(0);
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "23");
});
