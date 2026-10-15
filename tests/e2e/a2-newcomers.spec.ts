import { expect, test } from "@playwright/test";
import path from "../../src/data/a2-newcomers.json";
import packs from "../../src/data/a2-practice.json";
import links from "../../src/data/a2-review-links.json";

test("newcomer discovery and bilingual preparation remain usable on narrow screens", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/a2');
  await page.getByRole('link', { name: 'اختر موقفاً عملياً ←' }).click();
  await expect(page).toHaveURL(/\/a2-newcomers$/);
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: 'الدروس', exact: true })).toHaveAttribute('href', '/learn?level=A2');
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: 'تقدّمي', exact: true })).toHaveAttribute('href', '/progress?level=A2');
  await expect(page.locator('.newcomer-path > li')).toHaveCount(4);
  for (const width of [320, 390, 721, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  for (const item of path) {
    await page.goto(`/a2-practice/${item.slug}`);
    const prep = page.locator('.newcomer-preparation');
    await expect(prep).toContainText('خيالية للتدريب على اللغة');
    await prep.locator('summary').click();
    await expect(prep.locator('dt[lang=nl][dir=ltr]')).toHaveCount(6);
    for (const slug of item.lessonSlugs) await expect(prep.locator(`a[href="/learn/${slug}"]`)).toBeVisible();
    for (const width of [320, 390, 721, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const word = await prep.locator('dt').first().boundingBox();
      expect(word!.width).toBeGreaterThan(160);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.newcomer-preparation').screenshot({ path: testInfo.outputPath('newcomer-preparation-mobile.png') });
});

for (const [index, item] of path.entries()) test(`${item.slug}: evidence, correction, assisted listening, independent production and isolation`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const pack = packs.find((p) => p.slug === item.slug)!;
  await page.addInitScript(() => localStorage.setItem('dutchflow-progress-v1', JSON.stringify({ completedLessons: ['introductions', 'a2-yesterday-and-today'] })));
  await page.goto(`/a2-practice/${item.slug}`);
  const before = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const read = page.locator('#read'), listen = page.locator('#listen');
  for (const [i, q] of pack.reading.questions.entries()) await read.locator(`#${q.id}-${i === 0 ? (q.correctIndex + 1) % 3 : q.correctIndex}`).check();
  await read.getByRole('button', { name: 'تحقّق من فهمك' }).click();
  await expect(read.locator('.reading-result h3')).toContainText('3 من 4');
  await expect(read.locator('.reading-feedback blockquote').first()).toHaveText(pack.reading.questions[0].evidence);
  for (const slug of links[pack.reading.questions[0].id as keyof typeof links]) await expect(read.locator(`.practice-review a[href="/learn/${slug}"]`)).toBeVisible();
  await read.locator(`#${pack.reading.questions[0].id}-${pack.reading.questions[0].correctIndex}`).check();
  await read.getByRole('button', { name: 'تحقّق من فهمك' }).click();
  await expect(read.locator('.reading-result h3')).toContainText('4 من 4');
  await expect(listen.getByRole('radio')).toHaveCount(0);
  await listen.getByRole('button', { name: 'اعرض نص المقطع للمساعدة' }).click();
  await expect(listen.locator('[role=status]')).toContainText('بمساعدة النص');
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i === 0 ? (q.correctIndex + 1) % 3 : q.correctIndex}`).check();
  await listen.getByRole('button', { name: 'تحقّق من فهمك' }).click();
  await expect(listen.locator('.reading-result h3')).toContainText('3 من 4');
  for (const slug of links[pack.listening.questions[0].id as keyof typeof links]) await expect(listen.locator(`.practice-review a[href="/learn/${slug}"]`)).toBeVisible();
  await listen.locator(`#${pack.listening.questions[0].id}-${pack.listening.questions[0].correctIndex}`).check();
  await listen.getByRole('button', { name: 'تحقّق من فهمك' }).click();
  await expect(listen.locator('.reading-result h3')).toContainText('4 من 4');
  for (const [i, task] of pack.writing.entries()) {
    const field = page.locator('#write .production-task').nth(i);
    await field.locator('textarea').fill('Een eigen antwoord met verzonnen gegevens.');
    await expect(field.locator('.production-model')).toBeHidden();
    await field.locator('summary').click();
    await expect(field.locator('.production-model')).toHaveText(task.model);
  }
  for (const [i, task] of pack.speaking.entries()) {
    const field = page.locator('#speak .speaking-task').nth(i);
    await expect(field.locator('li[lang=nl]')).toHaveCount(3);
    await field.locator('summary').click();
    await expect(field.locator('details p[lang=nl]')).toHaveText(task.model);
  }
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)))).toEqual(before);
  const next = page.getByRole('navigation', { name: 'التنقل بين مراجعات A2' }).locator('.next-lesson');
  if (index < path.length - 1) {
    await expect(next).toHaveAttribute('href', `/a2-practice/${path[index + 1].slug}`);
    await next.click(); await expect(page.locator('#write textarea').first()).toHaveValue('');
  } else await expect(next).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#write textarea').first()).toHaveValue('');
  await expect(page.locator('#listen').getByRole('radio')).toHaveCount(0);
});
