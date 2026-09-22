import { expect, test } from "@playwright/test";
import lessons from "../../src/data/lessons.json";
import extensions from "../../src/data/lesson-extensions.json";

test("vocabulary discovery, inflected search and combined filters work with incremental results", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "ابحث في مكتبة المفردات ←" }).click();
  await expect(page).toHaveURL("/vocabulary");
  const total = extensions.reduce((sum, extension) => sum + extension.vocabulary.length, 0);
  await expect(page.locator(".vocabulary-card")).toHaveCount(Math.min(24, total));
  await page.getByRole("button", { name: "اعرض المزيد من المفردات" }).click();
  await expect(page.locator(".vocabulary-card")).toHaveCount(Math.min(48, total));
  const search = page.getByLabel("ابحث عن كلمة أو معنى");
  await search.fill("  VOORNAMEN  ");
  await expect(page.locator(".vocabulary-card h2")).toHaveText(["de voornaam"]);
  await expect(page.locator(".vocabulary-card h2")).toHaveAttribute("lang", "nl");
  await expect(page.locator(".vocabulary-card h2")).toHaveAttribute("dir", "ltr");
  await search.fill("الأَوَّل");
  await expect(page.locator(".vocabulary-card").filter({ has: page.getByRole("heading", { name: "de voornaam", exact: true }) })).toBeVisible();
  await page.getByLabel("نوع المفردة", { exact: true }).selectOption("verb");
  await search.fill("spelt");
  await expect(page.locator(".vocabulary-card h2")).toHaveText(["spellen"]);
  await page.getByLabel("الوحدة", { exact: true }).selectOption("daily-life");
  await expect(page.getByRole("heading", { name: "لا توجد مفردات مطابقة" })).toBeVisible();
  await page.getByRole("button", { name: "مسح البحث والتصفية" }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  await expect(page.locator(".vocabulary-card")).toHaveCount(24);
  await expect(page.getByLabel("نوع المفردة", { exact: true })).toHaveValue("all");
  await expect(page.getByLabel("الوحدة", { exact: true })).toHaveValue("all");
  await page.locator(".vocabulary-card").first().getByRole("link", { name: "افتح الدرس ←" }).click();
  await expect(page).toHaveURL(`/learn/${extensions[0].lessonSlug}`);
  await page.getByRole("link", { name: "استكشف مفردات الدروس الأخرى ←" }).click();
  await expect(page).toHaveURL("/vocabulary");
});

test("saving an example is explicit, retryable and persistent without awarding lesson completion", async ({ page }) => {
  await page.goto("/vocabulary");
  const card = page.locator(".vocabulary-card").first();
  const button = card.getByRole("button", { name: "أضف للمراجعة", exact: true });
  await expect(button).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
  await page.evaluate(() => {
    localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: ["pharmacy"] }));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "dutchflow-review-v1" && !Reflect.get(window, "allowVocabularySave")) throw new Error("Storage unavailable");
      return original.call(this, key, value);
    };
  });
  await button.click();
  await expect(card.locator(".review-error")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-review-v1"))).toBeNull();
  await page.evaluate(() => Reflect.set(window, "allowVocabularySave", true));
  await button.click();
  await expect(card.getByRole("button", { name: "ضمن قائمة المراجعة" })).toBeDisabled();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-review-v1")!).phraseIds)).toEqual([extensions[0].vocabulary[0].phraseId]);
  await page.reload();
  await expect(card.getByRole("button", { name: "ضمن قائمة المراجعة" })).toBeDisabled();
  await page.getByRole("link", { name: "افتح قائمة المراجعة ←", exact: true }).click();
  await expect(page).toHaveURL("/review");
  await expect(page.getByRole("heading", { name: "الجمل المحفوظة: 1" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("dutchflow-progress-v1")!).completedLessons)).toEqual(["pharmacy"]);
});

test("mobile examples play the linked sentence and filtering stops removed audio", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    let text = "", cancelled = 0;
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class { constructor(public text: string) {} } });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => [{ name: "Dutch", lang: "nl-NL" }],
      cancel: () => { cancelled++; },
      speak: (utterance: SpeechSynthesisUtterance) => { text = utterance.text; utterance.onstart?.call(utterance, new Event("start") as SpeechSynthesisEvent); },
    } });
    Reflect.set(window, "vocabularySpeech", { text: () => text, cancelled: () => cancelled });
  });
  await page.goto("/vocabulary");
  const word = extensions[0].vocabulary[0];
  const example = lessons.find((lesson) => lesson.slug === extensions[0].lessonSlug)!.phrases.find((phrase) => phrase.id === word.phraseId)!.dutch;
  await page.locator(".vocabulary-card").first().getByRole("button", { name: `استمع إلى ${example}`, exact: true }).click();
  expect(await page.evaluate(() => Reflect.get(window, "vocabularySpeech").text())).toBe(example);
  const before = await page.evaluate(() => Reflect.get(window, "vocabularySpeech").cancelled());
  await page.getByLabel("ابحث عن كلمة أو معنى").fill("zz-no-match");
  await expect(page.locator(".vocabulary-card")).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "vocabularySpeech").cancelled())).toBeGreaterThan(before);
  await page.getByRole("button", { name: "مسح البحث والتصفية" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
});
