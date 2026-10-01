import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validatePractice } from "../scripts/lib/validate-a1-practice.mjs";
import { audioSources } from "../scripts/lib/audio-sources.mjs";
import { planAudio } from "../scripts/lib/audio-assets.mjs";
const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const [packs, units, lessons, sounds, overrides] = await Promise.all(["a1-practice", "a1-roadmap", "lessons", "pronunciation", "audio-pronunciation"].map(read));

test("each theme has reception and production practice plus a cumulative review", () => {
  assert.deepEqual(validatePractice(packs, units), []);
  assert.equal(packs.length, 11);
  assert.equal(packs.reduce((sum, pack) => sum + pack.reading.questions.length + pack.listening.questions.length, 0), 88);
  const lessonTexts = new Set(lessons.flatMap((lesson) => lesson.phrases.map((phrase) => phrase.dutch)));
  for (const pack of packs) {
    assert.ok(!lessonTexts.has(pack.listening.text));
    assert.notEqual(pack.reading.text, pack.listening.text);
    assert.ok(pack.listening.text.split(/\s+/).length <= 65);
  }
});

test("practice rejects missing themes, foreign evidence, bad answer keys, links and oversized models", () => {
  const copy = structuredClone(packs);
  copy[0].unitIds = ["unknown"];
  copy[1].reading.questions[0].evidence = "not in this source";
  copy[2].listening.questions[0].correctIndex = 99;
  copy[3].writing.model = "x".repeat(501);
  copy[4].speaking.partnerPrompts = [];
  copy[5].reading.table.rows[0].pop();
  copy[6].listening.id = copy[0].listening.id;
  const errors = validatePractice(copy, units).join("\n");
  for (const message of ["unit links", "evidence", "answer options/key", "production task", "partner prompts", "invalid table", "audio ID"]) assert.ok(errors.includes(message), message);
  for (const invalid of [null, [], [null], [{}], packs.slice(1)]) assert.ok(validatePractice(invalid, units).length);
});

test("one audio inventory includes passages and sound drills without changing existing request hashes", () => {
  const all = audioSources(lessons, packs, sounds);
  const jobs = planAudio(all, overrides);
  assert.equal(jobs.length, (343 + 11 + 13) * 4);
  const oldOverrides = Object.fromEntries(Object.entries(overrides).filter(([id]) => !id.startsWith("a1-sound-")));
  const lessonJobs = planAudio(lessons, oldOverrides);
  assert.deepEqual(jobs.slice(0, lessonJobs.length), lessonJobs);
  for (const pack of packs) assert.equal(jobs.filter((job) => job.phraseId === pack.listening.id).length, 4);
  assert.match(jobs.find((job) => job.phraseId === "a1-sound-alphabet").ssml, /interpret-as="characters"/);
  assert.throws(() => audioSources(lessons, packs, [{ id: lessons[0].phrases[0].id, dutch: "test" }]), /duplicate/);
  for (const drill of sounds) for (const field of ["title", "explanation", "task"]) assert.match(drill[field], /[\u0600-\u06ff]/u);
});

test("foundation tables retain valid dimensions and link only to published lessons", async () => {
  const tables = await read("grammar-foundations");
  assert.equal(tables.length, 4);
  for (const table of tables) {
    assert.match(table.title, /[\u0600-\u06ff]/u);
    assert.match(table.explanation, /[\u0600-\u06ff]/u);
    assert.ok(table.headers.length >= 2);
    assert.ok(table.rows.length >= 3);
    for (const row of table.rows) { assert.equal(row.length, table.headers.length); for (const cell of row) assert.ok(cell.trim()); }
    for (const slug of table.sourceLessons) assert.ok(lessons.some((lesson) => lesson.slug === slug));
  }
});
