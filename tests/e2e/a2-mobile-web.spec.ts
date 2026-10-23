import { expect, test } from "@playwright/test";
import readings from "../../src/data/a2-readings.json";
import scenarios from "../../src/data/a2-scenarios.json";
import units from "../../src/data/a2-roadmap.json";
import links from "../../src/data/a2-review-links.json";

test.use({ isMobile: true, hasTouch: true });

test("mobile A2 puts the next action first and offers thumb navigation without covering content", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/a2');
  const next = page.locator('.study-status').getByRole('link', { name: /^تابع:/ });
  await expect(next).toBeVisible();
  const box = await next.boundingBox(); expect(box!.y + box!.height).toBeLessThan(844 - 70);
  const nav = page.getByRole('navigation', { name: 'تنقل A2 على الموبايل' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: 'خريطة A2' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.a2-unit-practice[open]')).toHaveCount(0);
  await page.locator('.a2-unit-index a').nth(1).click();
  const unit = page.locator(`#${units[1].id}`);
  await unit.locator('.a2-unit-practice summary').click();
  await expect(unit.locator('.study-resources')).toBeVisible();
  const added = readings[24];
  await expect(unit.locator(`a[href="/reading/${added.slug}"]`)).toBeVisible();
  await unit.screenshot({ path: testInfo.outputPath('a2-mobile-unit.png') });
  for (const width of [320, 390, 430, 721, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width <= 720) {
      const rect = await nav.boundingBox(); expect(rect!.width).toBe(width);
      for (const a of await nav.locator('a').all()) expect((await a.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    } else await expect(nav).toBeHidden();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await nav.getByRole('link', { name: 'تصفّح A2' }).tap();
  await expect(page).toHaveURL(/\/learn\?level=A2$/);
  await page.goto('/learn/a2-clarifying-instructions');
  await page.getByRole('navigation', { name: 'أجزاء هذا الدرس' }).getByRole('link', { name: 'اختبار الدرس', exact: true }).click();
  await page.locator('.quiz-question').first().getByRole('radio').first().check();
  const checked = await page.locator('.quiz-question').first().getByRole('radio').first().isChecked(); expect(checked).toBe(true);
  const control = page.locator('.quiz-question').first().getByRole('radio').first();
  await control.scrollIntoViewIfNeeded();
  const radio = await control.boundingBox(), bottom = await nav.boundingBox();
  expect(radio!.y + radio!.height).toBeLessThan(bottom!.y);
  await page.screenshot({ path: testInfo.outputPath('a2-mobile-quiz.png') });
  await nav.getByRole('link', { name: 'خريطة A2' }).tap();
  await expect(page).toHaveURL('/a2');
  await page.screenshot({ path: testInfo.outputPath('a2-mobile-map.png') });
});

test("mobile course navigation stays scoped to A2 and unit disclosures work from the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/a2');
  const summary = page.locator('.a2-unit-practice summary').first();
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.a2-unit-practice').first()).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(page.locator('.a2-unit-practice[open]')).toHaveCount(0);
  await page.goto('/learn/introductions');
  await expect(page.locator('.mobile-study-nav')).toHaveCount(0);
  await page.goto('/knm'); await expect(page.locator('.mobile-study-nav')).toHaveCount(0);
});

for (const reading of readings.slice(24)) test(`${reading.slug}: correct evidence, role exchange and temporary production on mobile`, async ({ page }) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/reading/${reading.slug}`);
  const before = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  for (const [i,q] of reading.questions.entries()) await page.locator(`#${q.id}-${i === 0 ? (q.correctIndex+1)%3 : q.correctIndex}`).check();
  await page.getByRole('button', { name: 'تحقّق من فهمك' }).click();
  await expect(page.locator('.reading-result h3')).toContainText('5 من 6');
  for (const slug of links[reading.questions[0].id as keyof typeof links]) await expect(page.locator(`.practice-review a[href="/learn/${slug}"]`)).toBeVisible();
  await page.locator(`#${reading.questions[0].id}-${reading.questions[0].correctIndex}`).check();
  await page.getByRole('button', { name: 'تحقّق من فهمك' }).click();
  await expect(page.locator('.reading-result h3')).toContainText('6 من 6');
  await page.locator('.production-task textarea').fill('Een eigen bericht met andere gegevens.');
  await page.locator('.production-task summary').click();
  await expect(page.locator('.production-model')).toHaveText(reading.production!.model);
  const scenario = scenarios.find((s) => s.slug === reading.slug+'-dialogue')!;
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [i, turn] of scenario.turns.entries()) {
    if (i === 1) {
      await page.locator('.scenario-choices').getByRole('radio').nth((turn.correctIndex+1)%3).check();
      await page.getByRole('button', { name: 'تحقّق من الرد', exact: true }).click();
      await expect(page.getByRole('button', { name: 'تابع الحوار', exact: true })).toBeDisabled();
    }
    await page.locator('.scenario-choices').getByRole('radio').nth(turn.correctIndex).check();
    await page.getByRole('button', { name: 'تحقّق من الرد', exact: true }).click();
    await page.getByRole('button', { name: i === 3 ? 'راجع الحوار وطبّق بنفسك' : 'تابع الحوار', exact: true }).click();
  }
  await page.locator('.production-task textarea').fill('Mijn nieuwe antwoord.');
  await page.locator('.production-task summary').click();
  await expect(page.locator('.production-model')).toHaveText(scenario.transfer.model);
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)))).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload(); await expect(page.locator('.scenario-top')).toContainText('الجولة 1 من 4');
});
