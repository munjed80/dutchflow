import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateLearningMap } from "../scripts/lib/validate-learning-map.mjs";

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [units, extensions, lessons, readings, original] = await Promise.all([
  read("../src/data/a1-roadmap.json"), read("../src/data/lesson-extensions.json"), read("../src/data/lessons.json"),
  read("../src/data/readings.json"), read("./fixtures/original-phrases.json"),
]);

test("the A1 map covers every published resource and preserves all original phrase identities and text", () => {
  assert.deepEqual(validateLearningMap(units, extensions, lessons, readings), []);
  assert.equal(units.length, 10);
  assert.equal(lessons.length, 30);
  assert.equal(lessons.flatMap((lesson) => lesson.phrases).length, 181);
  assert.equal(lessons.flatMap((lesson) => lesson.questions).length, 100);
  assert.equal(Object.keys(original).length, 20);
  for (const [slug, phrases] of Object.entries(original)) {
    const lesson = lessons.find((item) => item.slug === slug);
    assert.ok(lesson, slug);
    for (const [id, dutch] of Object.entries(phrases)) assert.equal(lesson.phrases.find((phrase) => phrase.id === id)?.dutch, dutch, id);
  }
  assert.equal(extensions.length, 13);
  assert.equal(extensions.flatMap((item) => item.vocabulary).length, 78);
  assert.equal(extensions.flatMap((item) => item.tasks).length, 26);
});

test("mapping validation rejects broken links, duplicate assignments, and missing coverage or goals", () => {
  const copy = structuredClone(units);
  copy[0].id = copy[1].id;
  copy[0].outcomes = [];
  copy[0].remaining = [];
  copy[0].lessonSlugs = ["unknown"];
  copy[1].lessonSlugs.push(copy[2].lessonSlugs[0]);
  copy[0].readingSlugs = ["unknown"];
  const errors = validateLearningMap(copy, extensions, lessons, readings).join("\n");
  for (const expected of ["duplicate unit ID", "missing goals", "invalid lesson links", "duplicate lesson assignment", "invalid reading links", "unmapped lesson", "unmapped reading"]) assert.ok(errors.includes(expected), expected);
});

test("enrichment validation protects same-lesson examples, noun forms, and production prompts", () => {
  const copy = structuredClone(extensions);
  copy[0].vocabulary[0].phraseId = lessons.at(-1).phrases[0].id;
  copy[0].vocabulary[0].term = "voornaam";
  copy[0].vocabulary[0].forms = "";
  copy[0].tasks[0].model = "x".repeat(501);
  copy[0].tasks[1].checklist = [];
  copy[1].lessonSlug = copy[0].lessonSlug;
  const errors = validateLearningMap(units, copy, lessons, readings).join("\n");
  for (const expected of ["reference this lesson", "noun requires article", "invalid production task", "unknown or duplicate lesson"]) assert.ok(errors.includes(expected), expected);
  for (const bad of [null, [null], [{}]]) assert.ok(validateLearningMap(bad, bad, lessons, readings).length);
});
