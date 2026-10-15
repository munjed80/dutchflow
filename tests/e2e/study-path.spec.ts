import { expect, test } from "@playwright/test";
import lessons from "../../src/data/a2-lessons.json";
import units from "../../src/data/a2-roadmap.json";
import scenarios from "../../src/data/a2-scenarios.json";
import sets from "../../src/data/a2-recycling.json";

async function seed(page: import("@playwright/test").Page, slugs: string[]) {
  await page.evaluate((completedLessons) => {
    localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons }));
    window.dispatchEvent(new Event("dutchflow-progress"));
  }, slugs);
}

test("A2 path groups every unit's resources, adapts to stored progress and reaches the final review", async ({ page }) => {
  await page.goto("/a2");
  const status = page.locator(".study-status");
  await expect(status.getByRole("link", { name: /^تابع:/ })).toHaveAttribute("href", `/learn/${lessons[0].slug}`);
  await seed(page, ["introductions", ...lessons.slice(0, 6).map((lesson) => lesson.slug)]);
  await expect(status.getByRole("link", { name: /^تابع:/ })).toHaveAttribute("href", `/learn/${lessons[6].slug}`);
  await expect(status.locator(`a[href="#${units[0].id}"]`)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const unit of units) {
    const card = page.locator(`#${unit.id}`);
    for (const slug of unit.readingSlugs) await expect(card.locator(`a[href="/reading/${slug}"]`)).toHaveCount(1);
    for (const scenario of scenarios.filter((item) => item.sourceLessons.some((slug) => unit.lessonSlugs.includes(slug)))) await expect(card.locator(`a[href="/scenarios/${scenario.slug}"]`)).toHaveCount(1);
    for (const set of sets.filter((item) => item.anchors.some((anchor) => unit.lessonSlugs.includes(anchor.lessonSlug)))) await expect(card.locator(`a[href="/a2-recycling/${set.slug}"]`)).toHaveCount(1);
    await expect(card.locator(`a[href="/a2-practice/${unit.id}"]`)).toHaveCount(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await seed(page, lessons.map((lesson) => lesson.slug));
  await expect(status.getByRole("link", { name: /^تابع:/ })).toHaveCount(0);
  await expect(status.getByRole("link", { name: "انتقل إلى المراجعة الختامية ←" })).toHaveAttribute("href", "/a2-practice/final-review");
  await expect(status).toContainText(`أتممت ${lessons.length} درساً في A2.`);
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(lessons.length));
  await page.getByRole("link", { name: "جرّب المراجعة الختامية لـ A2 ←" }).click();
  await expect(page).toHaveURL(/\/a2-practice\/final-review$/);
  await page.goto("/progress");
  await expect(page.locator("#a2-practice-next")).toHaveCount(0);
});

test("unknown progress never produces a personalized recommendation; recovery uses account progress", async ({ page }) => {
  let fail = true;
  await page.route("**/api/progress", async (route) => {
    if (fail) await route.fulfill({ status: 503, body: "Unavailable" });
    else await route.fulfill({ json: { enabled: true, user: { id: "test-account", name: "Learner", email: "learner@example.test" }, completedLessons: lessons.slice(0, 6).map((lesson) => lesson.slug) } });
  });
  await page.goto("/a2");
  const status = page.locator(".study-status");
  await expect(status.getByRole("alert")).toBeVisible();
  await expect(status.getByRole("link", { name: /^تابع:/ })).toHaveCount(0);
  await expect(page.locator(`#${units[0].id} a[href="/learn/${lessons[0].slug}"]`)).toBeVisible();
  await seed(page, lessons.map((lesson) => lesson.slug));
  fail = false;
  await status.getByRole("button", { name: "أعد تحميل التقدّم" }).click();
  await expect(status.getByRole("link", { name: /^تابع:/ })).toHaveAttribute("href", `/learn/${lessons[6].slug}`);
  await expect(status.getByRole("link", { name: "انتقل إلى المراجعة الختامية ←" })).toHaveCount(0);
});
