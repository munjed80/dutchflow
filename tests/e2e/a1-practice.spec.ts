import { expect, test } from "@playwright/test";
import packs from "../../src/data/a1-practice.json";

async function speech(page: import("@playwright/test").Page, available = true) {
  await page.addInitScript((available) => {
    let finish: (() => void) | undefined;
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: class { constructor(public text: string) {} }, configurable: true });
    Object.defineProperty(window, "speechSynthesis", { value: {
      getVoices: () => available ? [{ name: "Dutch", lang: "nl-NL" }] : [], cancel: () => {},
      speak: (utterance: SpeechSynthesisUtterance) => { const end = utterance.onend; finish = () => end?.call(utterance, new Event("end") as SpeechSynthesisEvent); utterance.onstart?.call(utterance, new Event("start") as SpeechSynthesisEvent); },
    }, configurable: true });
    Object.defineProperty(window, "finishPassage", { value: () => finish?.() });
  }, available);
}

test("integrated practice is discoverable, every route works, and the grammar/sound references link to real lessons", async ({ page, request }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "طبّق في مراجعات A1 المتكاملة ←" }).click();
  await expect(page.locator(".scenario-tile")).toHaveCount(11);
  for (const pack of packs) {
    await page.goto(`/a1-practice/${pack.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(pack.title);
    await expect(page.locator(".speaking-practice li[lang=nl]")).toHaveCount(pack.speaking.partnerPrompts.length);
  }
  expect((await request.get("/a1-practice/unknown")).status()).toBe(404);
  await page.goto("/curriculum");
  for (const pack of packs.slice(0, 10)) await expect(page.locator(`#${pack.slug} a[href="/a1-practice/${pack.slug}"]`)).toHaveCount(1);
  await page.goto("/grammar");
  await expect(page.locator(".grammar-reference")).toHaveCount(53);
  await expect(page.locator('.grammar-reference a[href="/learn/belongings-and-articles"]')).toHaveCount(1);
  await page.goto("/pronunciation");
  await expect(page.locator(".grammar-reference")).toHaveCount(13);
});

for (const pack of packs) test(`${pack.slug}: reading, assisted listening and production fit mobile without saving answers`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a1-practice/${pack.slug}`);
  const read = page.locator("#read");
  for (const [index, question] of pack.reading.questions.entries()) await read.locator(".reading-question").nth(index).getByRole("radio").nth(question.correctIndex).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result")).toContainText(`${pack.reading.questions.length} من ${pack.reading.questions.length}`);
  const listen = page.locator("#listen");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  await expect(listen.locator(".passage-transcript p[lang=nl]")).toHaveText(pack.listening.text);
  for (const [index, question] of pack.listening.questions.entries()) await listen.locator(".reading-question").nth(index).getByRole("radio").nth(question.correctIndex).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result")).toContainText(`${pack.listening.questions.length} من ${pack.listening.questions.length}`);
  await expect(listen).toContainText("لا يُحسب استماعاً مستقلاً");
  await expect(page.locator("#write textarea")).toHaveCount(pack.writing.length);
  await page.locator("#write textarea").first().fill("Mijn eigen tekst.");
  for (let index = 0; index < pack.writing.length; index += 1) await page.locator("#write summary").nth(index).click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing.map((task) => task.model));
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking.model);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const key of ["dutchflow-progress-v1", "dutchflow-review-v1"]) expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBeNull();
  await page.reload();
  await expect(page.locator("#write textarea").first()).toHaveValue("");
  await expect(page.locator(".passage-transcript")).toHaveCount(0);
});

test("only ended playback unlocks listening; stop and stale events cannot bypass it; retry becomes assisted", async ({ page }) => {
  await speech(page);
  await page.goto("/a1-practice/numbers-and-time");
  const pack = packs.find((item) => item.slug === "numbers-and-time")!;
  const listen = page.locator("#listen");
  await listen.getByRole("button", { name: "استمع إلى الجملة", exact: true }).click();
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "إيقاف الصوت" }).click();
  await page.evaluate(() => Reflect.get(window, "finishPassage")());
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "استمع إلى الجملة", exact: true }).click();
  await page.evaluate(() => Reflect.get(window, "finishPassage")());
  await expect(listen.getByRole("radio")).toHaveCount(pack.listening.questions.length * 3);
  await expect(listen.locator(".passage-transcript")).toHaveCount(0);
  for (const group of await listen.locator(".reading-question").all()) await group.getByRole("radio").first().check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await listen.locator(".reading-question").first().getByRole("radio").nth(1).check();
  await expect(listen).toContainText("لا يُحسب استماعاً مستقلاً");
  await expect(listen.locator(".reading-result")).toHaveCount(0);
  await listen.getByRole("button", { name: "ابدأ الاستماع من جديد" }).click();
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await expect(listen.locator(".passage-transcript")).toHaveCount(0);
});

test("missing Dutch audio remains honest and offers text help; map and timetable remain accessible", async ({ page }) => {
  await speech(page, false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/a1-practice/travel-and-directions");
  const pack = packs.find((item) => item.slug === "travel-and-directions")!;
  const listen = page.locator("#listen");
  await listen.getByRole("button", { name: "استمع إلى الجملة", exact: true }).click();
  await expect(listen).toContainText("لا يتوفر صوت هولندي");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  await expect(listen.getByRole("radio")).toHaveCount(pack.listening.questions.length * 3);
  await expect(page.getByRole("table")).toHaveAccessibleName("Fictieve buslijn 8");
  await expect(page.getByRole("img")).toHaveAccessibleName("Oefenkaart: van Halte naar School");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
