import { expect, test, type Page } from "@playwright/test";
import bank from "../../src/data/placement.json";

async function answerFrom(page: Page, start = 0, unknown = false) {
  for (let index = start; index < bank.questions.length; index++) {
    await expect(page.getByRole("heading", { name: `السؤال ${index + 1} من 16`, exact: true })).toBeVisible();
    if (unknown) await page.getByRole("radio", { name: "لا أعرف", exact: true }).check();
    else await page.getByRole("radio").nth(bank.questions[index].correctIndex).check();
    await page.getByRole("button", { name: index === 15 ? "راجع إجاباتي" : "السؤال التالي", exact: true }).click();
  }
}

test("a guest can resume, revise, retry a failed submission, and follow specific review lessons", async ({ page }) => {
  await page.goto("/placement");
  await page.evaluate(() => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["introductions"] })));
  await page.getByRole("button", { name: "ابدأ الاختبار المجاني" }).click();
  await expect(page.getByRole("button", { name: "السؤال التالي", exact: true })).toBeDisabled();
  await page.getByRole("radio", { name: "لا أعرف", exact: true }).check();
  await page.getByRole("button", { name: "السؤال التالي", exact: true }).click();
  await page.getByRole("radio").nth(1).check(); // Wrong conjugation.
  await page.reload();
  await expect(page.getByText("لديك إجابات محفوظة عن 2 من 16 سؤالاً.")).toBeVisible();
  await page.getByRole("button", { name: "تابع إجاباتي السابقة" }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.getByRole("button", { name: "السؤال السابق" }).click();
  await expect(page.getByRole("radio", { name: "لا أعرف", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "السؤال التالي", exact: true }).click();
  await page.getByRole("button", { name: "السؤال التالي", exact: true }).click();
  await answerFrom(page, 2);
  await expect(page.getByRole("heading", { name: "راجع إجاباتك", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "تعديل السؤال 1", exact: true }).click();
  await page.getByRole("radio").nth(bank.questions[0].correctIndex).check();
  await page.getByRole("button", { name: "عد إلى المراجعة" }).click();
  await page.route("**/api/placement", (route) => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"temporarily-unavailable"}' }));
  await page.getByRole("button", { name: "اعرض نتيجتي" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("إجاباتك ما زالت هنا");
  await expect(page.locator(".placement-answer-list li")).toHaveCount(16);
  await page.unroute("**/api/placement");
  await page.getByRole("button", { name: "أعد إرسال الإجابات" }).click();
  await expect(page.locator(".placement-score strong")).toHaveText("15");
  await expect(page.locator(".placement-recommendations a")).toHaveCount(1);
  await expect(page.locator(".placement-recommendations a")).toHaveAttribute("href", "/learn/personal-details");
  await page.getByText("راجع الإجابات والتوضيحات", { exact: true }).click();
  await expect(page.locator(".placement-corrections li").nth(1)).toContainText(bank.questions[1].explanation);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-progress-v1")!).completedLessons)).toEqual(["introductions"]);
  expect((await (await page.request.get("/api/progress")).json()).user).toBeNull();
  await page.locator(".placement-recommendations a").click();
  await expect(page).toHaveURL(/\/learn\/personal-details$/);
});

test("unknown answers, mobile layout, restart, and grading work even when account lookup fails", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/progress", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/placement");
  await page.getByRole("button", { name: "ابدأ الاختبار المجاني" }).click();
  await answerFrom(page, 0, true);
  await page.getByRole("button", { name: "اعرض نتيجتي" }).click();
  await expect(page.locator(".placement-score strong")).toHaveText("0");
  await expect(page.getByRole("heading", { name: "ابدأ بأساسيات المسار" })).toBeFocused();
  await expect(page.getByText("اخترت «لا أعرف» في 16 من الأسئلة.")).toBeVisible();
  await expect(page.locator(".placement-skills .panel")).toHaveCount(3);
  await expect(page.locator(".placement-recommendations a")).toHaveCount(3);
  await page.getByText("راجع الإجابات والتوضيحات", { exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "ابدأ محاولة جديدة" }).click();
  await expect(page.getByRole("heading", { name: "السؤال 1 من 16", exact: true })).toBeVisible();
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await page.reload();
  await expect(page.getByRole("button", { name: "تابع إجاباتي السابقة" })).toHaveCount(0);
});

test("grading rejects tampering and stale revisions and derives the result from server answer keys", async ({ request }) => {
  const answers = Object.fromEntries(bank.questions.map((question) => [question.id, question.correctIndex]));
  const send = (data: unknown) => request.post("/api/placement", { data });
  const valid = { revision: bank.revision, answers };
  const response = await send(valid);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const result = await response.json();
  expect(result.correct).toBe(16);
  expect(result.recommendations).toEqual([]);
  expect(result.review).toHaveLength(16);
  expect((await send({ ...valid, score: 100 })).status()).toBe(400);
  expect((await send({ ...valid, revision: "older-bank" })).status()).toBe(409);
  expect((await send({ ...valid, answers: {} })).status()).toBe(400);
  expect((await send({ ...valid, answers: { ...answers, [bank.questions[0].id]: 999 } })).status()).toBe(400);
  expect((await send({ ...valid, answers: { ...answers, fake: 0 } })).status()).toBe(400);
  expect((await request.post("/api/placement", { headers: { "Content-Type": "application/json" }, data: Buffer.from("{") })).status()).toBe(400);
  expect((await request.post("/api/placement", { headers: { "Content-Type": "application/json" }, data: Buffer.from("x".repeat(9000)) })).status()).toBe(413);
  expect((await request.post("/api/placement", { data: "plain text" })).status()).toBe(415);
});

test("entry points stay discoverable, malformed drafts are discarded, and answers stay out of initial HTML and client bundles", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "اختبر نقطة بدايتك" }).click();
  await expect(page).toHaveURL(/\/placement$/);
  await page.evaluate(() => sessionStorage.setItem("dutchflow-placement-draft-v1", JSON.stringify({ revision: "old", answers: { fake: 999 }, index: 999, review: true })));
  const response = await page.reload();
  await expect(page.getByText("تغيّر الاختبار أو تعذّر استعادة الإجابات القديمة. ابدأ محاولة جديدة.")).toBeVisible();
  await expect(page.getByRole("button", { name: "تابع إجاباتي السابقة" })).toHaveCount(0);
  const html = await response!.text();
  expect(html).not.toContain('\\"correctIndex\\":');
  for (const question of bank.questions) expect(html).not.toContain(question.explanation);
  const scripts = await page.locator('script[src]').evaluateAll((elements) => elements.map((element) => element.getAttribute("src")!));
  for (const src of scripts.filter((src) => src.startsWith("/_next/static/"))) {
    const source = await (await page.request.get(src)).text();
    for (const question of bank.questions) expect(source).not.toContain(question.explanation);
  }
  await page.goto("/learn");
  await expect(page.getByRole("link", { name: "جرّب اختبار البداية المجاني" })).toHaveAttribute("href", "/placement");
  await page.goto("/exams");
  await expect(page.getByRole("link", { name: "جرّب اختبار البداية", exact: true })).toHaveAttribute("href", "/placement");
  await expect(page.getByRole("button", { name: "متاح قريباً" })).toBeDisabled();
  await expect(page.locator(".exam-price")).toHaveText("€4.95");
});
