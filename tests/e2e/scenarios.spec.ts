import { expect, test } from "@playwright/test";
import scenarios from "../../src/data/scenarios.json";

async function finishTurn(page: import("@playwright/test").Page, index: number, last: boolean) {
  await page.locator(".scenario-choices").getByRole("radio").nth(index).check();
  await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
  await page.getByRole("button", { name: last ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
}

test("scenarios are discoverable from lessons and curriculum, and unknown routes return 404", async ({ page, request }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "تدرّب على المواقف الحوارية ←" }).click();
  await expect(page).toHaveURL("/scenarios");
  await expect(page.locator(".scenario-tile")).toHaveCount(8);
  await page.locator(".scenario-tile").first().getByRole("link", { name: "ابدأ الموقف ←" }).click();
  await expect(page).toHaveURL(`/scenarios/${scenarios[0].slug}`);
  await expect(page.locator(".scenario-mission")).toContainText("لا تُحفظ الإجابات");
  await page.goto("/learn/repairs-at-home");
  await page.locator('.scenario-links a[href="/scenarios/arranging-a-repair"]').click();
  await expect(page).toHaveURL("/scenarios/arranging-a-repair");
  await page.getByRole("link", { name: "هدف الموقف في خريطة A1 ←" }).click();
  for (const scenario of scenarios) await expect(page.locator(`#${scenario.unitId} .scenario-links a[href="/scenarios/${scenario.slug}"]`)).toHaveCount(1);
  expect((await request.get("/scenarios/not-a-scenario")).status()).toBe(404);
});

for (const scenario of scenarios) {
  test(`${scenario.slug}: complete the guided exchange and transfer task on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/scenarios/${scenario.slug}`);
    for (const [index, turn] of scenario.turns.entries()) {
      await expect(page.locator(".scenario-top")).toContainText(`الجولة ${index + 1} من 4`);
      await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
      await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveAttribute("lang", "nl");
      await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveAttribute("dir", "ltr");
      await expect(page.getByRole("button", { name: "تحقّق من الرد", exact: true })).toBeDisabled();
      await expect(page.getByRole("button", { name: index === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true })).toBeDisabled();
      if (index) {
        await expect(page.locator("#scenario-step-heading")).toBeFocused();
        await page.locator(".scenario-history summary").click();
        await expect(page.locator(".scenario-history li")).toHaveCount(index);
      }
      await page.locator(".scenario-prompt summary").click();
      await expect(page.locator(".scenario-prompt details p")).toHaveText(turn.translation);
      await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.locator(".scenario-response .scenario-dutch")).toHaveText(turn.response);
      await expect(page.locator(".scenario-choices").getByRole("radio").first()).toBeDisabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole("button", { name: index === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
    }
    await expect(page.locator(".scenario-summary h2").first()).toBeFocused();
    await expect(page.locator(".scenario-outcome")).toHaveText(Array(4).fill("رد مناسب من أول محاولة"));
    const task = page.locator(".production-task");
    await expect(task.locator(".production-model")).toBeHidden();
    await task.getByRole("textbox").fill("Mijn eigen antwoord.");
    await task.locator("summary").click();
    await expect(task.locator(".production-model")).toHaveText(scenario.transfer.model);
    await expect(task.getByRole("textbox")).toHaveValue("Mijn eigen antwoord.");
    expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("retries and model help preserve the first choice, while restart clears writing without changing saved progress", async ({ page }) => {
  await page.goto("/scenarios");
  const progress = JSON.stringify({ completedLessons: ["pharmacy"] });
  const review = JSON.stringify({ version: 1, phraseIds: ["a1-intro-01"] });
  await page.evaluate(({ progress, review }) => {
    localStorage.setItem("dutchflow-progress-v1", progress);
    localStorage.setItem("dutchflow-review-v1", review);
  }, { progress, review });
  const scenario = scenarios[0];
  await page.goto(`/scenarios/${scenario.slug}`);
  await page.locator(".scenario-choices").getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
  await expect(page.locator(".scenario-feedback")).toContainText("هذا رقم المنزل");
  await expect(page.locator(".scenario-response")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "تابع الحوار", exact: true })).toBeDisabled();
  await finishTurn(page, 1, false);
  await page.getByRole("button", { name: "أحتاج مساعدة: أظهر الرد المناسب" }).click();
  await expect(page.locator(".scenario-feedback")).toContainText("مثال للمساعدة");
  await page.getByRole("button", { name: "تابع الحوار", exact: true }).click();
  await finishTurn(page, scenario.turns[2].correctIndex, false);
  await finishTurn(page, scenario.turns[3].correctIndex, true);
  await expect(page.locator(".scenario-outcome")).toHaveText(["عدّلت الرد بعد المراجعة", "أكملت بمساعدة المثال", "رد مناسب من أول محاولة", "رد مناسب من أول محاولة"]);
  await expect(page.locator(".scenario-first-answer")).toContainText(scenario.turns[0].choices[0].text);
  await page.getByRole("textbox").fill("x".repeat(600));
  expect((await page.getByRole("textbox").inputValue()).length).toBe(500);
  await page.getByRole("button", { name: "ابدأ الموقف من جديد" }).click();
  await expect(page.locator(".scenario-summary")).toHaveCount(0);
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator("#scenario-step-heading")).toBeFocused();
  await expect(page.locator("input:checked")).toHaveCount(0);
  for (let index = 0; index < 4; index++) {
    await page.getByRole("button", { name: "أحتاج مساعدة: أظهر الرد المناسب" }).click();
    await page.getByRole("button", { name: index === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await expect(page.getByRole("textbox")).toHaveValue("");
  await expect(page.locator(".scenario-first-answer")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBe(progress);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBe(review);
});

test("reload and navigation start fresh, keyboard choices work and account outages do not block free scenarios", async ({ page }) => {
  await page.route("**/api/auth/get-session", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto("/scenarios/moving-an-appointment");
  const radio = page.locator(".scenario-choices").getByRole("radio").nth(1);
  await radio.focus();
  await page.keyboard.press("Space");
  await expect(radio).toBeChecked();
  await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
  await page.getByRole("button", { name: "تابع الحوار", exact: true }).click();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 2 من 4");
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator("input:checked")).toHaveCount(0);
  await page.getByRole("button", { name: "أحتاج مساعدة: أظهر الرد المناسب" }).click();
  await page.locator(".next-lesson").click();
  await expect(page).toHaveURL("/scenarios/starting-a-work-task");
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator(".scenario-response")).toHaveCount(0);
  await expect(page.locator("input:checked")).toHaveCount(0);
});
