import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateCurriculum } from "../scripts/lib/validate-curriculum.mjs";

const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const modules = JSON.parse(await readFile(new URL("../src/data/modules.json", import.meta.url), "utf8"));

test("the authored curriculum has valid links, ordering, and answer keys", () => {
  assert.deepEqual(validateCurriculum(lessons, modules), []);
});

test("the original lesson URLs and audio IDs stay compatible with stored progress", () => {
  const legacy = { introductions: "a1-intro", "at-the-shop": "a1-shop", "doctor-appointment": "a1-doctor" };
  for (const [slug, prefix] of Object.entries(legacy)) {
    const lesson = lessons.find((item) => item.slug === slug);
    assert.ok(lesson, `Missing legacy lesson ${slug}`);
    for (let index = 1; index <= 5; index += 1) assert.ok(lesson.phrases.some((phrase) => phrase.id === `${prefix}-${String(index).padStart(2, "0")}`));
  }
});

test("a duplicate audio ID and duplicate lesson URL are rejected", () => {
  const invalid = structuredClone(lessons);
  invalid[1].slug = invalid[0].slug;
  invalid[1].phrases[0].id = invalid[0].phrases[0].id;
  const errors = validateCurriculum(invalid, modules).join("\n");
  assert.match(errors, /slug: duplicate ID/);
  assert.match(errors, /phrases\[0\].id: duplicate ID/);
});

test("dialogue cannot accidentally point to another lesson's audio", () => {
  const invalid = structuredClone(lessons);
  invalid[0].dialogue[0].phraseId = invalid[1].phrases[0].id;
  assert.match(validateCurriculum(invalid, modules).join("\n"), /must reference a phrase in this lesson/);
});

test("broken question keys and indistinguishable choices are rejected", () => {
  const invalid = structuredClone(lessons);
  invalid[0].questions[0].correctIndex = 100;
  invalid[0].questions[1].options = ["Same answer", " same answer "];
  const errors = validateCurriculum(invalid, modules).join("\n");
  assert.match(errors, /correctIndex: must point to an existing answer/);
  assert.match(errors, /duplicate answer choices/);
});

test("missing learning goals, grammar, modules, and incorrect ordering are rejected", () => {
  const invalid = structuredClone(lessons);
  invalid[0].goal = " ";
  invalid[0].grammar = null;
  invalid[0].moduleId = "missing-module";
  invalid[0].number = "99";
  const errors = validateCurriculum(invalid, modules).join("\n");
  for (const expected of [/goal: must be non-empty/, /grammar: must be an object/, /moduleId: unknown module/, /number: must follow/]) assert.match(errors, expected);
});

test("malformed top-level content reports errors instead of crashing", () => {
  assert.ok(validateCurriculum(null, modules).length);
  assert.ok(validateCurriculum(lessons, []).length);
  assert.ok(validateCurriculum([null], [null]).length);
});
