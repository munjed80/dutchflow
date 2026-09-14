import { expect, test, type Page } from "@playwright/test";
import lessons from "../../src/data/lessons.json";

async function mockSpeech(page: Page, available = true) {
  await page.addInitScript((available) => {
    const pending: SpeechSynthesisUtterance[] = [];
    const endings: (() => void)[] = [];
    let cancellations = 0;
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class { constructor(public text: string) {} } });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => available ? [{ name: "Dutch", lang: "nl-NL" }] : [{ name: "English", lang: "en-US" }],
      cancel: () => { cancellations++; },
      speak: (utterance: SpeechSynthesisUtterance) => {
        pending.push(utterance);
        const end = utterance.onend;
        endings.push(() => end?.call(utterance, new Event("end") as SpeechSynthesisEvent));
        utterance.onstart?.call(utterance, new Event("start") as SpeechSynthesisEvent);
      },
    } });
    Object.defineProperty(window, "__speech", { value: {
      finish: () => endings.at(-1)?.(),
      finishOld: () => endings[0]?.(),
      fail: () => { const utterance = pending.at(-1)!; utterance.onerror?.call(utterance, new Event("error") as SpeechSynthesisErrorEvent); },
      rate: () => pending.at(-1)?.rate,
      cancellations: () => cancellations,
    } });
  }, available);
}
async function finishSpeech(page: Page) { await page.evaluate(() => Reflect.get(window, "__speech").finish()); }

test("listening completion unlocks answers, text assistance stays separate, and progress is untouched", async ({ page }) => {
  await mockSpeech(page);
  const lesson = lessons[0];
  await page.goto(`/learn/${lesson.slug}`);
  await page.evaluate(() => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["pharmacy"] })));
  await page.getByRole("link", { name: "ابدأ تدريب الاستماع" }).click();
  await expect(page.locator(".listening-transcript")).toHaveCount(0);
  await expect(page.getByRole("button", { name: `استمع إلى ${lesson.phrases[0].dutch}`, exact: true })).toHaveCount(0);
  for (const [index, phrase] of lesson.phrases.entries()) {
    const assisted = index !== 0 && index !== 2;
    await expect(page.getByRole("radio").first()).toBeDisabled();
    if (assisted) await page.getByRole("button", { name: "اعرض النص للمساعدة" }).click();
    else {
      await page.getByRole("button", { name: "استمع إلى الجملة", exact: true }).click();
      await expect(page.getByRole("radio").first()).toBeDisabled();
      await finishSpeech(page);
    }
    const answer = index === 2 ? lesson.phrases[3].arabic : phrase.arabic;
    await page.getByRole("radio", { name: answer, exact: true }).check();
    await page.getByRole("button", { name: "تحقّق من المعنى" }).click();
    await expect(page.locator(".listening-transcript")).toHaveText(phrase.dutch);
    await expect(page.getByRole("radio").first()).toBeDisabled();
    await page.getByRole("button", { name: index === lesson.phrases.length - 1 ? "اعرض ملخّص التدريب" : "الجملة التالية", exact: true }).click();
  }
  await expect(page.locator(".listening-score")).toContainText("1 من 2");
  await expect(page.getByText("تدرّبت على 3 من الجمل بمساعدة النص.")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-progress-v1")!).completedLessons)).toEqual(["pharmacy"]);
  await page.getByRole("button", { name: "أعد التدريب" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator(".listening-transcript")).toHaveCount(0);
  await expect(page.getByRole("radio").first()).toBeDisabled();
});

test("stop, replay, speech errors, and route changes do not award a listen", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/learn/introductions/listening");
  await page.getByRole("button", { name: "استمع إلى الجملة", exact: true }).click();
  await page.getByRole("button", { name: "إيقاف الصوت", exact: true }).click();
  await page.evaluate(() => Reflect.get(window, "__speech").finishOld());
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await page.getByRole("button", { name: "استمع ببطء إلى الجملة", exact: true }).click();
  expect(await page.evaluate(() => Reflect.get(window, "__speech").rate())).toBe(0.72);
  await page.evaluate(() => Reflect.get(window, "__speech").fail());
  await expect(page.getByText("تعذّر تشغيل الصوت على هذا الجهاز. حاول مجدداً.")).toBeVisible();
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await page.getByRole("button", { name: "استمع إلى الجملة", exact: true }).click();
  const previous = await page.evaluate(() => Reflect.get(window, "__speech").cancellations());
  await page.getByRole("navigation", { name: "مسار الصفحة" }).getByRole("link", { name: "كل الدروس" }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.locator(".listening-practice")).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "__speech").cancellations())).toBeGreaterThan(previous);
  await page.goBack();
  await expect(page.locator(".listening-practice")).toBeVisible();
  await page.evaluate(() => Reflect.get(window, "__speech").finish());
  await expect(page.getByRole("radio").first()).toBeDisabled();
});

test("no Dutch voice offers an accessible text-assisted round without a false listening result", async ({ page }) => {
  await mockSpeech(page, false);
  await page.setViewportSize({ width: 390, height: 844 });
  const lesson = lessons[1];
  await page.goto(`/learn/${lesson.slug}/listening`);
  await page.getByRole("button", { name: "استمع إلى الجملة", exact: true }).click();
  await expect(page.locator(".audio-error")).toContainText("لا يتوفر صوت هولندي");
  await expect(page.getByRole("radio").first()).toBeDisabled();
  for (const [index, phrase] of lesson.phrases.entries()) {
    await page.getByRole("button", { name: "اعرض النص للمساعدة" }).click();
    await page.getByRole("radio", { name: phrase.arabic, exact: true }).check();
    await page.getByRole("button", { name: "تحقّق من المعنى" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: index === lesson.phrases.length - 1 ? "اعرض ملخّص التدريب" : "الجملة التالية", exact: true }).click();
  }
  await expect(page.getByText("كانت هذه الجولة بمساعدة النص بالكامل؛ لا توجد نتيجة استماع مستقلة.")).toBeVisible();
  await expect(page.locator(".listening-score")).toContainText("0 من 0");
});

test("every authored lesson has a listening route and unknown lessons return 404", async ({ request }) => {
  for (const lesson of lessons) expect((await request.get(`/learn/${lesson.slug}/listening`)).status()).toBe(200);
  expect((await request.get("/learn/unknown/listening")).status()).toBe(404);
});
