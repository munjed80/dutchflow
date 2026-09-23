import { expect, test } from "@playwright/test";

test("home vocabulary leads to a mobile spatial writing task without changing progress", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vocabulary");
  const progress = JSON.stringify({ completedLessons: ["home-and-address"] });
  await page.evaluate((value) => localStorage.setItem("dutchflow-progress-v1", value), progress);
  await page.getByLabel("ابحث عن كلمة أو معنى").fill("ramen");
  const card = page.locator(".vocabulary-card").filter({ has: page.getByRole("heading", { name: "het raam", exact: true }) });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("De tafel staat voor het raam.");
  await card.getByRole("link", { name: "افتح الدرس ←" }).click();
  await expect(page).toHaveURL("/learn/furniture-and-location");
  const task = page.locator(".production-task").first();
  await task.getByRole("textbox").fill("De tafel staat naast het raam. De tas ligt onder de tafel.");
  await task.locator("summary").click();
  await expect(task.locator(".production-model")).toHaveText("De tafel staat naast het raam. De tas ligt onder de tafel.");
  await expect(task.locator(".production-model")).toHaveAttribute("dir", "ltr");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.reading-related a[href="/reading/a-room-for-a-guest"]').click();
  await expect(page).toHaveURL("/reading/a-room-for-a-guest");
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBe(progress);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
});

test("guest-room reading distinguishes arrival time and furniture positions with evidence", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/curriculum");
  await page.locator('#home-and-neighbourhood a[href="/reading/a-room-for-a-guest"]').click();
  await expect(page.locator(".reading-passage")).toHaveAttribute("lang", "nl");
  await page.locator(".reading-translation summary").click();
  await expect(page.locator(".reading-translation p")).toContainText("المكتب بين السرير والنافذة");
  // The work finish and the cupboard's position are plausible, but incorrect for these questions.
  await page.locator("#reading-guest-room-1-0").check();
  await page.locator("#reading-guest-room-2-0").check();
  await page.locator("#reading-guest-room-3-2").check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.getByRole("region", { name: "هل فهمت النص؟" }).getByRole("alert")).toHaveText("اختر إجابة لكل سؤال أولاً.");
  await expect(page.locator(".reading-result")).toHaveCount(0);
  await page.locator("#reading-guest-room-4-1").check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toHaveText("نتيجة هذه المحاولة: 2 من 4");
  await expect(page.locator(".reading-feedback blockquote").nth(2)).toHaveText("Het bureau staat tussen het bed en het raam.");
  await expect(page.locator(".reading-feedback").first()).toContainText("انتهاء العمل ليس وقت استقبال الضيف");
  await page.locator("#reading-guest-room-1-2").check();
  await expect(page.locator(".reading-result")).toHaveCount(0);
  await page.locator("#reading-guest-room-3-1").check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toHaveText("نتيجة هذه المحاولة: 4 من 4");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
  await page.reload();
  await expect(page.locator("input:checked")).toHaveCount(0);
  await expect(page.locator(".reading-result")).toHaveCount(0);
});
