import { expect, test } from "@playwright/test";
import lessons from "../../src/data/a2-lessons.json";
import modules from "../../src/data/a2-modules.json";

test("mobile course filters combine module, search and completion, reset together and isolate A1", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((slug) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["introductions", slug] })), lessons[0].slug);
  await page.goto("/learn?level=A2");
  await expect(page.locator(".catalogue-progress-link")).toContainText("أكملت 1 من 40");
  await expect(page.locator(".next-lesson-meta")).toContainText(`${lessons[1].durationMinutes} دقائق`);
  await page.getByLabel("حالة الدرس", { exact: true }).selectOption("remaining");
  await expect(page.locator(".catalogue-item")).toHaveCount(39);
  await expect(page.locator(`.catalogue-item[href="/learn/${lessons[0].slug}"]`)).toHaveCount(0);
  await page.getByLabel("الوحدة", { exact: true }).selectOption(modules[0].id);
  await expect(page.locator(".catalogue-item")).toHaveCount(4);
  await page.getByLabel("ابحث عن درس").fill(lessons[1].dutchTitle);
  await expect(page.locator(".catalogue-item")).toHaveCount(1);
  await page.getByRole("button", { name: "إعادة ضبط الفلاتر" }).click();
  await expect(page.getByLabel("ابحث عن درس")).toHaveValue("");
  await expect(page.getByLabel("حالة الدرس", { exact: true })).toHaveValue("all");
  await expect(page.getByLabel("الوحدة", { exact: true })).toHaveValue("all");
  await expect(page.locator(".catalogue-item")).toHaveCount(40);
  await page.getByLabel("حالة الدرس", { exact: true }).selectOption("completed");
  await expect(page.locator(".catalogue-item")).toHaveCount(1);
  await page.getByRole("navigation", { name: "اختر المستوى" }).getByRole("link", { name: /A1/ }).click();
  await expect(page.getByLabel("حالة الدرس", { exact: true })).toHaveValue("all");
  await expect(page.locator(".catalogue-item")).toHaveCount(53);
  await expect(page.locator(".catalogue-progress-link")).toContainText("أكملت 1 من 53");
});

test("empty completion filters explain the state and unavailable progress disables only status filtering", async ({ page }) => {
  await page.route("**/api/progress", (route) => route.fulfill({ json: { enabled: false, user: null, completedLessons: [] } }));
  await page.goto("/learn?level=A2");
  await page.getByLabel("حالة الدرس", { exact: true }).selectOption("completed");
  await expect(page.getByRole("heading", { name: "لم تُكمل درساً في هذا المستوى بعد" })).toBeVisible();
  await page.getByRole("button", { name: "اعرض كل الدروس", exact: true }).click();
  await expect(page.locator(".catalogue-item")).toHaveCount(40);
  await page.route("**/api/progress", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.reload();
  await expect(page.getByLabel("حالة الدرس", { exact: true })).toBeDisabled();
  await expect(page.locator(".catalogue-progress-link")).toHaveCount(0);
  await page.getByLabel("ابحث عن درس").fill(lessons[0].dutchTitle);
  await expect(page.locator(".catalogue-item")).toHaveCount(1);
});

test("global navigation retains A2 across skill routes and desktop filters remain available", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "القائمة الرئيسية" });
  for (const path of ["/a2", "/learn?level=A2", `/learn/${lessons[0].slug}/writing`, "/reading/a2-a-new-weekly-habit", "/a2-practice/final-review", "/vocabulary?level=A2"]) {
    await page.goto(path);
    await expect(navigation.getByRole("link", { name: "الدروس", exact: true })).toHaveAttribute("href", "/learn?level=A2");
    await expect(navigation.getByRole("link", { name: "الدروس", exact: true })).toHaveAttribute("aria-current", /page|location/);
    await expect(navigation.getByRole("link", { name: "تقدّمي", exact: true })).toHaveAttribute("href", "/progress?level=A2");
  }
  await navigation.getByRole("link", { name: "الدروس", exact: true }).click();
  await page.locator(".module-filters").getByRole("button", { name: modules[1].title, exact: true }).click();
  await expect(page.locator(".catalogue-item")).toHaveCount(5);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto("/learn");
  await expect(navigation.getByRole("link", { name: "الدروس", exact: true })).toHaveAttribute("href", "/learn");
});
