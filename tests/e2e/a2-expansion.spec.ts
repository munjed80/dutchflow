import { expect, test } from "@playwright/test";
import lessons from "../../src/data/a2-lessons.json";
import units from "../../src/data/a2-roadmap.json";
import readings from "../../src/data/a2-readings.json";
import scenarios from "../../src/data/a2-scenarios.json";
const added = units.map((unit) => lessons.find((lesson) => lesson.slug === unit.lessonSlugs[5])!);

test("sixth lessons provide language depth and linked activities at mobile and desktop sizes", async ({ page, request }, testInfo) => {
  test.setTimeout(60_000);
  for (const lesson of added) {
    await page.goto(`/learn/${lesson.slug}`);
    await expect(page.locator('.quiz-question')).toHaveCount(4);
    await expect(page.locator('.language-depth-example')).toHaveCount(4);
    await expect(page.locator('.language-alternative')).toHaveCount(2);
    await expect(page.locator('.language-mistake')).toHaveCount(2);
    await expect(page.locator('.production-task')).toHaveCount(2);
    for (const reading of readings.slice(16).filter((r) => r.sourceLessons.includes(lesson.slug))) await expect(page.locator(`a[href="/reading/${reading.slug}"]`)).toHaveCount(1);
    for (const scenario of scenarios.slice(16).filter((s) => s.sourceLessons.includes(lesson.slug))) await expect(page.locator(`a[href="/scenarios/${scenario.slug}"]`)).toHaveCount(1);
    for (const suffix of ['/listening', '/writing']) expect((await request.get(`/learn/${lesson.slug}${suffix}`)).status()).toBe(200);
    for (const width of [320, 390, 721, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const card = await page.locator('.language-depth-example').first().boundingBox();
      const text = await page.locator('.language-depth-example .phrase-content').first().boundingBox();
      expect(text!.width).toBeGreaterThan(card!.width * 0.7);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.lesson-language-depth .panel').first().screenshot({ path: testInfo.outputPath('a2-language-depth-mobile.png') });
});

test("new readings support six evidenced questions, targeted correction and independent production without progress writes", async ({ page }) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('dutchflow-progress-v1', JSON.stringify({ completedLessons: ['introductions', 'a2-yesterday-and-today'] })));
  for (const reading of readings.slice(16)) {
    await page.goto(`/reading/${reading.slug}`);
    for (const [i, q] of reading.questions.entries()) await page.locator(`#${q.id}-${i === 5 ? (q.correctIndex + 1) % 3 : q.correctIndex}`).check();
    await page.getByRole('button', { name: 'تحقّق من فهمك' }).click();
    await expect(page.locator('.reading-result h3')).toContainText('5 من 6');
    await expect(page.locator('.practice-review a')).toHaveAttribute('href', `/learn/${reading.sourceLessons[0]}`);
    const last = reading.questions[5]; await page.locator(`#${last.id}-${last.correctIndex}`).check();
    await page.getByRole('button', { name: 'تحقّق من فهمك' }).click();
    await expect(page.locator('.reading-result h3')).toContainText('6 من 6');
    await expect(page.locator('.production-model')).toBeHidden();
    await page.locator('.production-task textarea').fill('Mijn eigen samenvatting.');
    await page.locator('.production-task summary').click();
    await expect(page.locator('.production-model')).toHaveText(reading.production!.model);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dutchflow-progress-v1')!).completedLessons)).toEqual(['introductions', 'a2-yesterday-and-today']);
  }
});

for (const scenario of scenarios.slice(16)) {
  test(`${scenario.slug}: a changed role supports feedback, retry and independent transfer`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/scenarios/${scenario.slug}`);
    for (const [i, turn] of scenario.turns.entries()) {
      await expect(page.locator('.scenario-prompt .scenario-dutch')).toHaveText(turn.prompt);
      if (i === 0) {
        await page.locator('.scenario-choices').getByRole('radio').nth((turn.correctIndex + 1) % 3).check();
        await page.getByRole('button', { name: 'تحقّق من الرد', exact: true }).click();
        await expect(page.locator('.scenario-response')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'تابع الحوار', exact: true })).toBeDisabled();
      }
      await page.locator('.scenario-choices').getByRole('radio').nth(turn.correctIndex).check();
      await page.getByRole('button', { name: 'تحقّق من الرد', exact: true }).click();
      await expect(page.locator('.scenario-response .scenario-dutch')).toHaveText(turn.response);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('button', { name: i === 3 ? 'راجع الحوار وطبّق بنفسك' : 'تابع الحوار', exact: true }).click();
    }
    await expect(page.locator('.scenario-outcome')).toHaveText(['عدّلت الرد بعد المراجعة', ...Array(3).fill('رد مناسب من أول محاولة')]);
    await expect(page.locator('.production-model')).toBeHidden();
    await page.locator('.production-task textarea').fill('Mijn antwoord met nieuwe details.');
    await page.locator('.production-task summary').click();
    await expect(page.locator('.production-model')).toHaveText(scenario.transfer.model);
    expect(await page.evaluate(() => localStorage.getItem('dutchflow-progress-v1'))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('dutchflow-knm-progress-v1'))).toBeNull();
  });
}

test("all forty previous A2 completions resume the first new lesson and remain separate from A1 and KNM", async ({ page }) => {
  const old = units.flatMap((unit) => unit.lessonSlugs.slice(0, 5));
  await page.addInitScript(({ old }) => {
    if (!localStorage.getItem('dutchflow-progress-v1')) localStorage.setItem('dutchflow-progress-v1', JSON.stringify({ completedLessons: ['introductions', ...old] }));
    localStorage.setItem('dutchflow-knm-progress-v1', JSON.stringify({ version: 1, completedLessons: ['finding-work'], wrongQuestionIds: [] }));
  }, { old });
  await page.goto('/learn?level=A2');
  await expect(page.locator('.continue-banner').first().getByRole('link')).toHaveAttribute('href', `/learn/${added[0].slug}`);
  await page.goto('/progress?level=A2');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '48');
  await page.goto(`/learn/${added[0].slug}`);
  for (const [i, q] of added[0].questions.entries()) await page.locator('.quiz-question').nth(i).getByRole('radio').nth(q.correctIndex).check();
  await page.getByRole('button', { name: 'تحقّق من الإجابات' }).click();
  await expect(page.locator('.success-message')).toBeVisible();
  await page.goto('/progress?level=A2'); await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '41');
  await page.goto('/progress'); await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('dutchflow-knm-progress-v1')))! ).completedLessons).toEqual(['finding-work']);
});
