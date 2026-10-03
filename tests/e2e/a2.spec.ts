import { expect, test } from "@playwright/test";
import a1 from "../../src/data/lessons.json";
import lessons from "../../src/data/a2-lessons.json";
import readings from "../../src/data/a2-readings.json";
import packs from "../../src/data/a2-practice.json";
import scenarios from "../../src/data/a2-scenarios.json";

test("levels isolate catalogue filters, recommendations, progress and navigation without promoting A1 finishers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn");
  await expect(page.locator(".catalogue-item")).toHaveCount(53);
  await page.evaluate((slugs) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: slugs })), a1.map((lesson) => lesson.slug));
  await page.reload();
  await expect(page.locator(".continue-banner").first()).toContainText("وقت المراجعة");
  await expect(page.locator(".continue-banner").first().getByRole("link")).toHaveAttribute("href", "/progress");
  await page.getByLabel("ابحث عن درس").fill("nothing matches");
  await page.getByRole("navigation", { name: "اختر المستوى" }).getByRole("link", { name: /A2/ }).click();
  await expect(page).toHaveURL("/learn?level=A2");
  await expect(page.getByLabel("ابحث عن درس")).toHaveValue("");
  await expect(page.locator(".catalogue-item")).toHaveCount(4);
  await expect(page.locator(".continue-banner").first().getByRole("link")).toHaveAttribute("href", `/learn/${lessons[0].slug}`);
  await page.locator(".catalogue-item").first().click();
  await expect(page.locator(".lesson-page-heading")).toContainText("01 من 4");
  await expect(page.locator('a[rel="prev"]')).toHaveCount(0);
  for (const [index, question] of lessons[0].questions.entries()) await page.locator(".quiz-question").nth(index).getByRole("radio").nth(question.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "4");
  await page.getByRole("navigation", { name: "اختر المستوى" }).getByRole("link", { name: /A1/ }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "53");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "53");
  for (const lesson of [a1.at(-1)!, lessons.at(-1)!]) {
    await page.goto(`/learn/${lesson.slug}`);
    await expect(page.locator('a[rel="next"]')).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("A2 discovery stays in its level across resources; all new lesson activities render", async ({ page, request }) => {
  await page.goto("/a2");
  await page.getByRole("navigation", { name: "موارد A2" }).getByRole("link", { name: "قراءة A2" }).click();
  await expect(page.locator(".reading-tile")).toHaveCount(1);
  await page.locator(".reading-tile").click();
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", "/reading?level=A2");
  for (const q of readings[0].questions) await page.locator(`#${q.id}-${q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("4 من 4");
  await page.goto("/vocabulary?level=A2");
  await page.getByRole("searchbox").fill("gewerkt");
  await expect(page.locator('.vocabulary-card a[href="/learn/a2-yesterday-and-today"]').first()).toBeVisible();
  await page.goto("/grammar?level=A2");
  await expect(page.locator(".grammar-reference")).toHaveCount(4);
  await expect(page.locator(".grammar-foundation")).toHaveCount(0);
  for (const lesson of lessons) for (const suffix of ["", "/listening", "/writing"]) expect((await request.get(`/learn/${lesson.slug}${suffix}`)).status()).toBe(200);
  expect((await request.get("/a2-practice/missing")).status()).toBe(404);
});

test("A2 integrated practice has independent sources, scoped remediation and temporary production", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pack = packs[0];
  await page.goto(`/a2-practice/${pack.slug}`);
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const [index, q] of pack.reading.questions.entries()) await read.locator(`#${q.id}-${index === 1 ? (q.correctIndex + 1) % 3 : q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-a-day-at-work");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  await expect(listen.locator(".passage-transcript")).toContainText(pack.listening.text);
  for (const q of pack.listening.questions) await listen.locator(`#${q.id}-${q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("3 من 3");
  await page.locator("#write textarea").fill("Gisteren heb ik gewerkt.");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const key of ["dutchflow-progress-v1", "dutchflow-review-v1"]) expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBeNull();
  await page.reload();
  await expect(page.locator("#write textarea")).toHaveValue("");
  await expect(listen.getByRole("radio")).toHaveCount(0);
});

test("A2 scenario completes a coherent exchange and resets transfer writing on reload", async ({ page }) => {
  const scenario = scenarios[0];
  await page.goto("/scenarios?level=A2");
  await expect(page.locator(".scenario-tile")).toHaveCount(1);
  await page.getByRole("link", { name: "ابدأ الموقف ←" }).click();
  for (const [index, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: index === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task textarea").fill("Zondag ben ik naar Leiden gegaan.");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", "/scenarios?level=A2");
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator(".production-task textarea")).toHaveCount(0);
});
