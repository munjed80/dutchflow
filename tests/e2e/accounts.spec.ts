import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { Pool } from "pg";
import { spawn } from "node:child_process";
import lessons from "../../src/data/lessons.json";

const origin = "http://127.0.0.1:3100";
test.beforeEach(async ({ context }, info) => {
  const suffix = [...info.title].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 200 + 30;
  await context.setExtraHTTPHeaders({ "x-real-ip": `192.0.2.${suffix}` });
});
async function mailLink(context: BrowserContext, email: string) {
  let url = "";
  await expect.poll(async () => {
    const response = await context.request.get(`http://127.0.0.1:3026/?email=${encodeURIComponent(email)}`);
    url = (await response.json()).url || "";
    return Boolean(url);
  }).toBe(true);
  return url;
}
async function signIn(page: Page, email: string, name: string) {
  await page.goto("/account");
  await page.getByLabel("اسمك").fill(name);
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByRole("button", { name: "أرسل رابط الدخول" }).click();
  await expect(page.getByRole("status")).toContainText("تحقّق من بريدك");
  const url = await mailLink(page.context(), email);
  await page.goto(url);
  await expect(page.getByRole("heading", { name: `مرحباً، ${name}` })).toBeVisible();
  return url;
}
async function finishLesson(page: Page, slug: string) {
  const lesson = lessons.find((lesson) => lesson.slug === slug)!;
  await page.goto(`/learn/${slug}`);
  for (const [index, question] of lesson.questions.entries()) {
    await page.locator(".quiz-question").nth(index).getByRole("radio").nth(question.correctIndex).check();
  }
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
}

test("email sign-in, explicit guest import, cross-device progress, account isolation, and sign-out", async ({ page, browser }) => {
  await page.goto("/progress");
  await page.evaluate(() => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["introductions"] })));
  await signIn(page, "learner-a@example.test", "متعلّم أول");
  let state = await (await page.request.get("/api/progress")).json();
  expect(state.completedLessons).toEqual([]); // No silent import on a shared browser.
  const userA = state.user.id;
  await page.getByRole("button", { name: "أضف تقدّم هذا الجهاز إلى حسابي" }).click();
  await expect(page.getByRole("status")).toContainText("أُضيف تقدّم هذا الجهاز");
  await finishLesson(page, "personal-details");
  await expect(page.locator(".next-lesson")).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");

  const secondDevice = await browser.newContext({ baseURL: origin, extraHTTPHeaders: { "x-real-ip": "198.51.100.10" } });
  const secondPage = await secondDevice.newPage();
  await signIn(secondPage, "learner-a@example.test", "متعلّم أول");
  await secondPage.goto("/progress");
  await expect(secondPage.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  expect(await secondPage.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();

  const otherAccount = await browser.newContext({ baseURL: origin, extraHTTPHeaders: { "x-real-ip": "198.51.100.11" } });
  const otherPage = await otherAccount.newPage();
  await signIn(otherPage, "learner-b@example.test", "متعلّم ثانٍ");
  state = await (await otherPage.request.get("/api/progress")).json();
  expect(state.completedLessons).toEqual([]);
  const userB = state.user.id;
  const write = (body: unknown, requestOrigin = origin) => otherPage.request.post("/api/progress", { headers: { Origin: requestOrigin }, data: body });
  expect((await write({ expectedUserId: userA, completedLessons: ["pharmacy"] })).status()).toBe(409);
  expect((await write({ expectedUserId: userB, completedLessons: ["pharmacy"] }, "https://untrusted.example")).status()).toBe(403);
  expect((await write({ expectedUserId: userB, completedLessons: ["unknown-lesson"] })).status()).toBe(400);
  expect((await write({ expectedUserId: userB, completedLessons: "pharmacy" })).status()).toBe(400);
  expect((await otherPage.request.post("/api/progress", { headers: { Origin: origin, "Content-Type": "application/json" }, data: Buffer.from("{") })).status()).toBe(400);
  expect((await otherPage.request.post("/api/progress", { headers: { Origin: origin, "Content-Type": "application/json" }, data: "x".repeat(9000) })).status()).toBe(413);
  for (let i = 0; i < 2; i++) expect((await write({ expectedUserId: userB, completedLessons: ["pharmacy", "pharmacy"] })).status()).toBe(200);
  expect((await (await otherPage.request.get("/api/progress")).json()).completedLessons).toEqual(["pharmacy"]);
  expect((await (await page.request.get("/api/progress")).json()).completedLessons).toHaveLength(2);

  await page.goto("/account");
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "الدخول أو إنشاء حساب" })).toBeVisible();
  expect((await page.request.post("/api/progress", { headers: { Origin: origin }, data: { expectedUserId: userA, completedLessons: ["pharmacy"] } })).status()).toBe(401);
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1"); // Original guest data only.
  expect((await (await secondPage.request.get("/api/progress")).json()).user.id).toBe(userA);
  await secondDevice.close(); await otherAccount.close();
});

test("magic links are hashed, single use, expire, and reject untrusted callbacks; requests are rate limited", async ({ page, browser }) => {
  const link = await signIn(page, "token-check@example.test", "اختبار الروابط");
  const fresh = await browser.newContext({ baseURL: origin, extraHTTPHeaders: { "x-real-ip": "198.51.100.12" } });
  const freshPage = await fresh.newPage();
  await freshPage.goto(link);
  await expect(freshPage.locator("main").getByRole("alert")).toContainText("رابط الدخول غير صالح");
  expect((await (await fresh.request.get("/api/progress")).json()).user).toBeNull();
  const send = (email: string, ip = "192.0.2.20", callbackURL = "/account") => fresh.request.post("/api/auth/sign-in/magic-link", {
    headers: { Origin: origin, "x-real-ip": ip }, data: { email, callbackURL, errorCallbackURL: "/account" },
  });
  expect((await send("redirect@example.test", "192.0.2.21", "https://untrusted.example/steal")).status()).toBe(403);
  expect((await send("expiry@example.test")).status()).toBe(200);
  const expiring = await mailLink(fresh, "expiry@example.test");
  const token = new URL(expiring).searchParams.get("token")!;
  const db = new Pool({ connectionString: process.env.TEST_DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5439/postgres", max: 1 });
  try {
    const rows = (await db.query('SELECT identifier, value FROM verification')).rows;
    expect(JSON.stringify(rows).includes(token)).toBe(false);
    await db.query('UPDATE verification SET "expiresAt" = now() - interval \'1 minute\'');
  } finally { await db.end(); }
  await freshPage.goto(expiring);
  await expect(freshPage.locator("main").getByRole("alert")).toContainText("رابط الدخول غير صالح");
  expect((await (await fresh.request.get("/api/progress")).json()).user).toBeNull();
  for (let i = 0; i < 5; i++) expect((await send(`limit-${i}@example.test`, "192.0.2.22")).status()).toBe(200);
  expect((await send("limit-last@example.test", "192.0.2.22")).status()).toBe(429);
  await fresh.close();
});

test("a failed cloud save can be retried without writing account progress to guest storage", async ({ page }) => {
  await signIn(page, "retry@example.test", "إعادة المحاولة");
  await page.route("**/api/progress", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
  await finishLesson(page, "pharmacy");
  await expect(page.locator("main").getByRole("alert")).toContainText("لم يُحفظ التقدّم في حسابك");
  expect((await (await page.request.get("/api/progress")).json()).completedLessons).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
  await page.unroute("**/api/progress");
  await page.getByRole("button", { name: "أعد حفظ التقدّم" }).click();
  await expect(page.locator(".next-lesson")).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".next-lesson")).toBeVisible();
});

test("unconfigured deployments retain guest learning and show a clear account message", async ({ page }) => {
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3102"], {
    stdio: "ignore", env: { ...process.env, DATABASE_URL: "", BETTER_AUTH_SECRET: "", SMTP_URL: "", EMAIL_FROM: "" },
  });
  try {
    await expect.poll(async () => { try { return (await page.request.get("http://127.0.0.1:3102/api/progress")).status(); } catch { return 0; } }).toBe(200);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:3102/account");
    await expect(page.getByRole("heading", { name: "الحسابات غير متاحة حالياً" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole("navigation").getByRole("link", { name: "حسابي" })).toBeVisible();
    expect((await page.request.post("http://127.0.0.1:3102/api/auth/sign-in/magic-link", { data: { email: "nobody@example.test" } })).status()).toBe(503);
    await page.goto("http://127.0.0.1:3102/learn/pharmacy");
    for (const [index, question] of lessons.find((lesson) => lesson.slug === "pharmacy")!.questions.entries()) await page.locator(".quiz-question").nth(index).getByRole("radio").nth(question.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
    await expect(page.locator(".next-lesson")).toBeVisible();
    await page.goto("http://127.0.0.1:3102/progress");
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  } finally { child.kill("SIGTERM"); }
});
