import { expect, test } from "@playwright/test";
import a1 from "../../src/data/lessons.json";
import lessons from "../../src/data/a2-lessons.json";
import readings from "../../src/data/a2-readings.json";
import packs from "../../src/data/a2-practice.json";
import scenarios from "../../src/data/a2-scenarios.json";

test("levels isolate catalogue filters, recommendations, progress and navigation without promoting A1 finishers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn");
  await expect(page.locator(".catalogue-item")).toHaveCount(53);
  await page.evaluate((slugs) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: slugs })), a1.map((lesson) => lesson.slug));
  await page.reload();
  await expect(page.locator(".continue-banner").first()).toContainText("وقت المراجعة");
  await expect(page.locator(".continue-banner").first().getByRole("link")).toHaveAttribute("href", "/progress");
  await page.getByLabel("ابحث عن درس").fill("nothing matches");
  await page.getByRole("navigation", { name: "اختر المستوى" }).getByRole("link", { name: /A2/ }).click();
  await expect(page).toHaveURL("/learn?level=A2");
  await expect(page.getByLabel("ابحث عن درس")).toHaveValue("");
  await expect(page.locator(".catalogue-item")).toHaveCount(lessons.length);
  await expect(page.locator(".continue-banner").first().getByRole("link")).toHaveAttribute("href", `/learn/${lessons[0].slug}`);
  await page.locator(".catalogue-item").first().click();
  await expect(page.locator(".lesson-page-heading")).toContainText(`01 من ${lessons.length}`);
  await expect(page.locator('a[rel="prev"]')).toHaveCount(0);
  for (const [index, question] of lessons[0].questions.entries()) await page.locator(".quiz-question").nth(index).getByRole("radio").nth(question.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(lessons.length));
  await page.getByRole("navigation", { name: "اختر المستوى" }).getByRole("link", { name: /A1/ }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "53");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "53");
  for (const lesson of [a1.at(-1)!, lessons.at(-1)!]) {
    await page.goto(`/learn/${lesson.slug}`);
    await expect(page.locator('a[rel="next"]')).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("A2 discovery stays in its level across resources; all new lesson activities render", async ({ page, request }) => {
  await page.goto("/a2");
  await page.getByRole("navigation", { name: "موارد A2" }).getByRole("link", { name: "قراءة A2" }).click();
  await expect(page.locator(".reading-tile")).toHaveCount(readings.length);
  await page.locator(".reading-tile").first().click();
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/reading/${readings[1].slug}`);
  for (const q of readings[0].questions) await page.locator(`#${q.id}-${q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("4 من 4");
  await page.goto("/vocabulary?level=A2");
  await page.getByRole("searchbox").fill("gewerkt");
  await expect(page.locator('.vocabulary-card a[href="/learn/a2-yesterday-and-today"]').first()).toBeVisible();
  await page.goto("/grammar?level=A2");
  await expect(page.locator(".grammar-reference")).toHaveCount(lessons.length);
  await expect(page.locator(".grammar-foundation")).toHaveCount(0);
  for (const lesson of lessons) for (const suffix of ["", "/listening", "/writing"]) expect((await request.get(`/learn/${lesson.slug}${suffix}`)).status()).toBe(200);
  expect((await request.get("/a2-practice/missing")).status()).toBe(404);
});

test("A2 integrated practice has independent sources, scoped remediation and temporary production", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pack = packs[0];
  await page.goto(`/a2-practice/${pack.slug}`);
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const [index, q] of pack.reading.questions.entries()) await read.locator(`#${q.id}-${index === 1 ? (q.correctIndex + 1) % 3 : q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-a-day-at-work");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  await expect(listen.locator(".passage-transcript")).toContainText(pack.listening.text);
  for (const q of pack.listening.questions) await listen.locator(`#${q.id}-${q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("3 من 3");
  await page.locator("#write textarea").fill("Gisteren heb ik gewerkt.");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveAttribute("href", `/a2-practice/${packs[1].slug}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const key of ["dutchflow-progress-v1", "dutchflow-review-v1"]) expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBeNull();
  await page.reload();
  await expect(page.locator("#write textarea")).toHaveValue("");
  await expect(listen.getByRole("radio")).toHaveCount(0);
});

test("A2 scenario completes a coherent exchange and resets transfer writing on reload", async ({ page }) => {
  const scenario = scenarios[0];
  await page.goto("/scenarios?level=A2");
  await expect(page.locator(".scenario-tile")).toHaveCount(scenarios.length);
  await page.getByRole("link", { name: "ابدأ الموقف ←" }).first().click();
  for (const [index, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: index === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task textarea").fill("Zondag ben ik naar Leiden gegaan.");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/scenarios/${scenarios[1].slug}`);
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator(".production-task textarea")).toHaveCount(0);
});

test("unit two connects from the previous endpoint, updates the recommendation and grades new reading evidence", async ({ page }) => {
  await page.goto(`/learn/${lessons[3].slug}`);
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(`/learn/${lessons[4].slug}`);
  await expect(page.locator(".lesson-page-heading")).toContainText(`05 من ${lessons.length}`);
  await page.evaluate((slugs) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: slugs })), lessons.slice(0, 4).map((lesson) => lesson.slug));
  await page.goto("/learn?level=A2");
  await expect(page.locator(".continue-banner").first().getByRole("link")).toHaveAttribute("href", `/learn/${lessons[4].slug}`);
  await page.goto(`/reading/${readings[1].slug}`);
  for (const [index, q] of readings[1].questions.entries()) await page.locator(`#${q.id}-${index === 3 ? 0 : q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("3 من 4");
  await expect(page.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-confirming-a-handover");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/reading/${readings[2].slug}`);
});

test("work handover listening supersedes the written instructions and starts clean after unit navigation", async ({ page }) => {
  const pack = packs[1];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a2-practice/${packs[0].slug}`);
  await page.locator("#write textarea").fill("Een oud antwoord.");
  await page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson").click();
  await expect(page.locator("#write textarea")).toHaveValue("");
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const q of pack.reading.questions) await read.locator(`#${q.id}-${q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result h3")).toContainText("3 من 3");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i === 1 ? 1 : q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("2 من 3");
  await expect(listen.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-clarifying-instructions");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveAttribute("href", `/a2-practice/${packs[2].slug}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("work scenario rejects an impossible deadline and completes the revised agreement", async ({ page }) => {
  const scenario = scenarios[1];
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [index, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    if (index === 2) {
      await page.locator(".scenario-choices").getByRole("radio").first().check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    }
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: index === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task summary").click();
  await expect(page.locator(".production-model")).toHaveText(scenario.transfer.model);
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/scenarios/${scenarios[2].slug}`);
});

test("housing follows unit two, preserves progress, and distinguishes a visit window from an exact hour", async ({ page }) => {
  await page.goto(`/learn/${lessons[7].slug}`);
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(`/learn/${lessons[8].slug}`);
  await expect(page.locator(".lesson-page-heading")).toContainText(`09 من ${lessons.length}`);
  await page.evaluate((slugs) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: slugs })), lessons.slice(0, 8).map((lesson) => lesson.slug));
  await page.reload();
  for (const [i, q] of lessons[8].questions.entries()) await page.locator(".quiz-question").nth(i).getByRole("radio").nth(q.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "9");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(lessons.length));
  await page.goto(`/reading/${readings[2].slug}`);
  for (const [i, q] of readings[2].questions.entries()) await page.locator(`#${q.id}-${i === 2 ? 2 : q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("3 من 4");
  await expect(page.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-arranging-a-repair-visit");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/reading/${readings[3].slug}`);
});

test("housing listening updates the window, arrival contact and response deadline without leaking old answers", async ({ page }) => {
  const pack = packs[2];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a2-practice/${packs[1].slug}`);
  await page.locator("#write textarea").fill("Een antwoord van de vorige unit.");
  await page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson").click();
  await expect(page.locator("#write textarea")).toHaveValue("");
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const q of pack.reading.questions) await read.locator(`#${q.id}-${q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result h3")).toContainText("3 من 3");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  // Choose the superseded morning window, but the new contact method/deadline.
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i === 0 ? 0 : q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("2 من 3");
  await expect(listen.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-arranging-a-repair-visit");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveAttribute("href", `/a2-practice/${packs[3].slug}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await expect(page.locator("#write textarea")).toHaveValue("");
});

test("housing dialogue corrects an exact-time assumption and offers a fresh transfer task", async ({ page }) => {
  const scenario = scenarios[2];
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [i, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    if (i === 3) {
      await page.locator(".scenario-choices").getByRole("radio").first().check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.getByRole("button", { name: "راجع الحوار وطبّق بنفسك", exact: true })).toBeDisabled();
    }
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task summary").click();
  await expect(page.locator(".production-model")).toHaveText(scenario.transfer.model);
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/scenarios/${scenarios[3].slug}`);
});

test("appointment lessons follow housing and teach omdat without mixing level progress or treating a preference as a booking", async ({ page }) => {
  await page.goto(`/learn/${lessons[11].slug}`);
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(`/learn/${lessons[12].slug}`);
  await expect(page.locator(".lesson-page-heading")).toContainText(`13 من ${lessons.length}`);
  for (const [i, q] of lessons[12].questions.entries()) await page.locator(".quiz-question").nth(i).getByRole("radio").nth(q.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(lessons.length));
  await page.goto(`/reading/${readings[3].slug}`);
  for (const [i, q] of readings[3].questions.entries()) await page.locator(`#${q.id}-${i === 3 ? 2 : q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("3 من 4");
  await expect(page.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-asking-for-an-appointment-update");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/reading/${readings[4].slug}`);
});

test("appointment listening replaces pending details with a confirmed location, start and arrival time", async ({ page }) => {
  const pack = packs[3];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a2-practice/${packs[2].slug}`);
  await page.locator("#write textarea").fill("Een antwoord over de reparatie.");
  await page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson").click();
  await expect(page.locator("#write textarea")).toHaveValue("");
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const q of pack.reading.questions) await read.locator(`#${q.id}-${q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result h3")).toContainText("3 من 3");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  // Reject both the old requested location and the arrival time as a start time.
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i === 0 ? 2 : i === 1 ? 0 : q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("1 من 3");
  await expect(listen.locator(".practice-review a")).toHaveCount(1);
  await expect(listen.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-confirming-a-replacement-appointment");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveAttribute("href", `/a2-practice/${packs[4].slug}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("appointment negotiation rejects a premature booking claim before confirmation and transfers to new details", async ({ page }) => {
  const scenario = scenarios[3];
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [i, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    if (i === 2) {
      await page.locator(".scenario-choices").getByRole("radio").first().check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.getByRole("button", { name: "تابع الحوار", exact: true })).toBeDisabled();
    }
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task summary").click();
  await expect(page.locator(".production-model")).toHaveText(scenario.transfer.model);
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/scenarios/${scenarios[4].slug}`);
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator(".production-task textarea")).toHaveCount(0);
});

test("shopping follows appointments, keeps A1 progress, and distinguishes stock from a reservation", async ({ page }) => {
  await page.goto(`/learn/${lessons[15].slug}`);
  await page.evaluate((slugs) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: slugs })), [a1[0].slug, ...lessons.slice(0, 16).map((lesson) => lesson.slug)]);
  await page.reload();
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(`/learn/${lessons[16].slug}`);
  await expect(page.locator(".lesson-page-heading")).toContainText(`17 من ${lessons.length}`);
  for (const [i, q] of lessons[16].questions.entries()) await page.locator(".quiz-question").nth(i).getByRole("radio").nth(q.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "17");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(lessons.length));
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "53");
  await page.goto(`/reading/${readings[4].slug}`);
  // Availability alone does not mean the store has reserved the cups.
  for (const [i, q] of readings[4].questions.entries()) await page.locator(`#${q.id}-${i === 3 ? 0 : q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("3 من 4");
  await expect(page.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-confirming-a-shop-alternative");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/reading/${readings[5].slug}`);
});

test("shopping listening supersedes the offered colours and price with the confirmed mixed order", async ({ page }) => {
  const pack = packs[4];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a2-practice/${packs[3].slug}`);
  await page.locator("#write textarea").fill("Een oud antwoord over een afspraak.");
  await page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson").click();
  await expect(page.locator("#write textarea")).toHaveValue("");
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const q of pack.reading.questions) await read.locator(`#${q.id}-${q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result h3")).toContainText("3 من 3");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  // The written all-blue offer (€12) is not the final one-red/two-blue order (€13).
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i === 0 ? 0 : i === 1 ? 1 : q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("1 من 3");
  await expect(listen.locator(".practice-review a")).toHaveCount(2);
  await expect(listen.locator('a[href="/learn/a2-confirming-a-shop-alternative"]')).toBeVisible();
  await expect(listen.locator('a[href="/learn/a2-checking-quantities-and-prices"]')).toBeVisible();
  await page.locator("#write textarea").fill("Ik neem twee gele en twee groene bekers.");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveAttribute("href", `/a2-practice/${packs[5].slug}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
  await page.reload();
  await expect(page.locator("#write textarea")).toHaveValue("");
  await expect(listen.getByRole("radio")).toHaveCount(0);
});

test("shopping negotiation rejects an unaffordable alternative and a full-price surcharge", async ({ page }) => {
  const scenario = scenarios[4];
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [i, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    if (i === 1 || i === 3) {
      await page.locator(".scenario-choices").getByRole("radio").nth(i === 1 ? 0 : 1).check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true })).toBeDisabled();
    }
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task textarea").fill("Kan ik deze jas omruilen?");
  await page.locator(".production-task summary").click();
  await expect(page.locator(".production-model")).toHaveText(scenario.transfer.model);
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/scenarios/${scenarios[5].slug}`);
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator(".production-task textarea")).toHaveCount(0);
});

test("school lessons follow shopping and distinguish optional help from a required reply", async ({ page }) => {
  await page.goto(`/learn/${lessons[19].slug}`);
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(`/learn/${lessons[20].slug}`);
  await expect(page.locator(".lesson-page-heading")).toContainText(`21 من ${lessons.length}`);
  for (const [i, q] of lessons[20].questions.entries()) await page.locator(".quiz-question").nth(i).getByRole("radio").nth(q.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(lessons.length));
  await page.goto(`/reading/${readings[5].slug}`);
  // Optional help does not cancel the requested reply; supplied books do not imply a ban.
  for (const [i, q] of readings[5].questions.entries()) await page.locator(`#${q.id}-${i === 0 || i === 3 ? 0 : q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("2 من 4");
  await expect(page.locator(".practice-review a")).toHaveCount(2);
  await expect(page.locator('.practice-review a[href="/learn/a2-finding-a-reply-deadline"]')).toBeVisible();
  await expect(page.locator('.practice-review a[href="/learn/a2-understanding-school-instructions"]')).toBeVisible();
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/reading/${readings[6].slug}`);
});

test("local-message listening changes event details and requires a new reply only for a changed count", async ({ page }) => {
  const pack = packs[5];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a2-practice/${packs[4].slug}`);
  await page.locator("#write textarea").fill("Een antwoord over bekers.");
  await page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson").click();
  await expect(page.locator("#write textarea")).toHaveValue("");
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const q of pack.reading.questions) await read.locator(`#${q.id}-${q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result h3")).toContainText("3 من 3");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i < 2 ? 0 : q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("1 من 3");
  await expect(listen.locator(".practice-review a")).toHaveCount(2);
  await page.locator("#write textarea").fill("Ik kan woensdag niet komen omdat ik werk.");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveAttribute("href", `/a2-practice/${packs[6].slug}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
  await page.reload();
  await expect(page.locator("#write textarea")).toHaveValue("");
  await expect(listen.getByRole("radio")).toHaveCount(0);
});

test("invitation dialogue counts the applicant and retains the registration condition", async ({ page }) => {
  const scenario = scenarios[5];
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [i, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    if (i === 2 || i === 3) {
      await page.locator(".scenario-choices").getByRole("radio").nth(i === 2 ? 0 : 2).check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true })).toBeDisabled();
    }
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task textarea").fill("Ik kan maandag niet komen omdat ik les heb.");
  await page.locator(".production-task summary").click();
  await expect(page.locator(".production-model")).toHaveText(scenario.transfer.model);
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/scenarios/${scenarios[6].slug}`);
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator(".production-task textarea")).toHaveCount(0);
});

test("travel follows school, preserves progress and reviews arrival rather than departure", async ({ page }) => {
  await page.goto(`/learn/${lessons[23].slug}`);
  await page.evaluate((slugs) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: slugs })), [a1[0].slug, ...lessons.slice(0, 24).map((lesson) => lesson.slug)]);
  await page.reload();
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL("/learn/a2-planning-a-day-trip");
  await expect(page.locator(".lesson-page-heading")).toContainText("25 من 32");
  for (const [i, q] of lessons[24].questions.entries()) await page.locator(".quiz-question").nth(i).getByRole("radio").nth(q.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "32");
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "53");
  await page.goto(`/reading/${readings[6].slug}`);
  // Confuse return arrival with departure, while retaining the other correct answers.
  for (const [i, q] of readings[6].questions.entries()) await page.locator(`#${q.id}-${i === 2 ? 1 : q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("3 من 4");
  await expect(page.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-comparing-travel-routes");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/reading/${readings[7].slug}`);
});

test("travel update replaces transport and meeting details and removes the old time buffer", async ({ page }) => {
  const pack = packs[6];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a2-practice/${packs[5].slug}`);
  await page.locator("#write textarea").fill("Een oud antwoord over school.");
  await page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson").click();
  await expect(page.locator("#write textarea")).toHaveValue("");
  const read = page.locator("#read"), listen = page.locator("#listen");
  await expect(read.getByRole("table")).toBeVisible();
  for (const q of pack.reading.questions) await read.locator(`#${q.id}-${q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result h3")).toContainText("3 من 3");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  // Old meeting and old quarter-hour buffer must produce separate remediation links.
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i === 1 ? 0 : i === 2 ? 1 : q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("1 من 3");
  await expect(listen.locator(".practice-review a")).toHaveCount(2);
  await expect(listen.locator('a[href="/learn/a2-agreeing-on-another-route"]')).toBeVisible();
  await expect(listen.locator('a[href="/learn/a2-comparing-travel-routes"]')).toBeVisible();
  await page.locator("#write textarea").fill("Zullen we bij de bushalte afspreken?");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveAttribute("href", `/a2-practice/${packs[7].slug}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("dutchflow-progress-v1"))).toBeNull();
  await page.reload();
  await expect(page.locator("#write textarea")).toHaveValue("");
  await expect(listen.getByRole("radio")).toHaveCount(0);
});

test("travel dialogue rejects earlier departure as sufficient and includes the final walk", async ({ page }) => {
  const scenario = scenarios[6];
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [i, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    if (i === 1 || i === 3) {
      await page.locator(".scenario-choices").getByRole("radio").nth(i === 1 ? 0 : 2).check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true })).toBeDisabled();
    }
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task textarea").fill("Ik kom naar verwachting om kwart over acht bij de bibliotheek aan.");
  await page.locator(".production-task summary").click();
  await expect(page.locator(".production-model")).toHaveText(scenario.transfer.model);
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", `/scenarios/${scenarios[7].slug}`);
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
  await expect(page.locator(".production-task textarea")).toHaveCount(0);
});


test("social unit follows travel, keeps A1 progress separate and distinguishes confirmation from a pending detail", async ({ page }) => {
  await page.goto(`/learn/${lessons[27].slug}`);
  await page.evaluate((slugs) => localStorage.setItem("dutchflow-progress-v1", JSON.stringify({ completedLessons: slugs })), [a1[0].slug, ...lessons.slice(0, 28).map((lesson) => lesson.slug)]);
  await page.reload();
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL("/learn/a2-sharing-a-social-experience");
  await expect(page.locator(".lesson-page-heading")).toContainText(`29 من ${lessons.length}`);
  for (const [i, q] of lessons[28].questions.entries()) await page.locator(".quiz-question").nth(i).getByRole("radio").nth(q.correctIndex).check();
  await page.getByRole("button", { name: "تحقّق من الإجابات" }).click();
  await expect(page.locator(".success-message")).toBeVisible();
  await page.goto("/progress?level=A2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "29");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "32");
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "53");
  await page.goto(`/reading/${readings[7].slug}`);
  for (const [i, q] of readings[7].questions.entries()) await page.locator(`#${q.id}-${i === 3 ? 0 : q.correctIndex}`).check();
  await page.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(page.locator(".reading-result h3")).toContainText("3 من 4");
  await expect(page.locator(".practice-review a")).toHaveAttribute("href", "/learn/a2-confirming-a-social-plan");
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", "/reading?level=A2");
});

test("social listening replaces the original start, guest list and glass request", async ({ page }) => {
  const pack = packs[7];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/a2-practice/${packs[6].slug}`);
  await page.locator("#write textarea").fill("Een oud antwoord over reizen.");
  await page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson").click();
  await expect(page.locator("#write textarea")).toHaveValue("");
  const read = page.locator("#read"), listen = page.locator("#listen");
  for (const q of pack.reading.questions) await read.locator(`#${q.id}-${q.correctIndex}`).check();
  await read.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(read.locator(".reading-result h3")).toContainText("3 من 3");
  await expect(listen.getByRole("radio")).toHaveCount(0);
  await listen.getByRole("button", { name: "اعرض نص المقطع للمساعدة" }).click();
  for (const [i, q] of pack.listening.questions.entries()) await listen.locator(`#${q.id}-${i === 0 ? 0 : i === 2 ? 0 : q.correctIndex}`).check();
  await listen.getByRole("button", { name: "تحقّق من فهمك" }).click();
  await expect(listen.locator(".reading-result h3")).toContainText("1 من 3");
  await expect(listen.locator(".practice-review a")).toHaveCount(2);
  await expect(listen.locator('a[href="/learn/a2-confirming-a-social-plan"]')).toBeVisible();
  await page.locator("#write textarea").fill("Kan het om kwart over zeven?");
  await page.locator("#write summary").click();
  await expect(page.locator("#write .production-model")).toHaveText(pack.writing[0].model);
  await page.locator("#speak summary").click();
  await expect(page.locator("#speak details p[lang=nl]")).toHaveText(pack.speaking[0].model);
  await expect(page.getByRole("navigation", { name: "التنقل بين مراجعات A2" }).locator(".next-lesson")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator("#write textarea")).toHaveValue("");
  await expect(listen.getByRole("radio")).toHaveCount(0);
});

test("social invitation scenario changes only the unavailable time and confirms the accepted plan", async ({ page }) => {
  const scenario = scenarios[7];
  await page.goto(`/scenarios/${scenario.slug}`);
  for (const [i, turn] of scenario.turns.entries()) {
    await expect(page.locator(".scenario-prompt .scenario-dutch")).toHaveText(turn.prompt);
    if (i === 1 || i === 3) {
      await page.locator(".scenario-choices").getByRole("radio").nth(2).check();
      await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
      await expect(page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true })).toBeDisabled();
    }
    await page.locator(".scenario-choices").getByRole("radio").nth(turn.correctIndex).check();
    await page.getByRole("button", { name: "تحقّق من الرد", exact: true }).click();
    await page.getByRole("button", { name: i === 3 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار", exact: true }).click();
  }
  await page.locator(".production-task textarea").fill("Afgesproken: zaterdag om kwart voor zes bij de ingang.");
  await page.locator(".production-task summary").click();
  await expect(page.locator(".production-model")).toHaveText(scenario.transfer.model);
  await expect(page.locator(".next-lesson")).toHaveAttribute("href", "/scenarios?level=A2");
  await page.reload();
  await expect(page.locator(".scenario-top")).toContainText("الجولة 1 من 4");
});
