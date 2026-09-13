import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validatePlacement } from "../scripts/lib/validate-placement.mjs";
import { gradePlacement, publicPlacement, validAnswers } from "../src/lib/placement-scoring.ts";

const bank = JSON.parse(await readFile(new URL("../src/data/placement.json", import.meta.url), "utf8"));
const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const correctAnswers = Object.fromEntries(bank.questions.map((question) => [question.id, question.correctIndex]));

test("placement content has valid answer keys, skills, languages, and linked lessons", () => {
  assert.deepEqual(validatePlacement(bank, lessons), []);
  const invalid = structuredClone(bank);
  invalid.questions[0].correctIndex = 20;
  invalid.questions[1].lessonSlug = "missing-lesson";
  invalid.questions[2].skill = "missing-skill";
  invalid.questions[3].id = invalid.questions[0].id;
  invalid.questions[4].options[1] = invalid.questions[4].options[0];
  const errors = validatePlacement(invalid, lessons).join("\n");
  for (const expected of [/invalid answer key/, /unknown lesson/, /unknown skill/, /duplicate id/, /duplicate options/]) assert.match(errors, expected);
  assert.ok(validatePlacement(null, lessons).length);
});

test("public question projection strips answers, explanations, and future private fields", () => {
  const privateBank = structuredClone(bank);
  privateBank.questions[0].futurePrivateField = "must-never-leak";
  const publicBank = publicPlacement(privateBank);
  assert.equal(publicBank.questions.length, 16);
  for (const question of publicBank.questions) {
    assert.equal("correctIndex" in question, false);
    assert.equal("explanation" in question, false);
    assert.equal("lessonSlug" in question, false);
    assert.equal("futurePrivateField" in question, false);
  }
});

test("unknown answers get no credit and perfect results do not imply a certified level or invent weaknesses", () => {
  const perfect = gradePlacement(bank, correctAnswers);
  assert.equal(perfect.correct, 16);
  assert.deepEqual(perfect.skills.map(({ correct, total }) => [correct, total]), [[6, 6], [5, 5], [5, 5]]);
  assert.deepEqual(perfect.recommendations, []);
  assert.equal("level" in perfect, false);
  const unknown = gradePlacement(bank, Object.fromEntries(bank.questions.map((question) => [question.id, null])));
  assert.equal(unknown.correct, 0);
  assert.equal(unknown.unknown, 16);
  assert.equal(unknown.guidance.title, "ابدأ بأساسيات المسار");
  assert.deepEqual(unknown.recommendations.map(({ lessonSlug }) => lessonSlug), ["introductions", "personal-details", "numbers-and-age"]);
});

test("mixed results report each skill and recommend only missed material with deterministic thresholds", () => {
  const mixed = { ...correctAnswers, "start-greeting": 2, "start-live": null, "start-hours": 1 };
  const result = gradePlacement(bank, mixed);
  assert.equal(result.correct, 13);
  assert.equal(result.unknown, 1);
  assert.deepEqual(result.skills.map(({ correct, total }) => [correct, total]), [[5, 6], [4, 5], [4, 5]]);
  assert.deepEqual(result.recommendations.map(({ lessonSlug }) => lessonSlug), ["introductions", "personal-details", "time-and-days"]);
  assert.equal(result.review[0].selectedIndex, 2);
  assert.equal(result.review[0].correctIndex, 0);
  for (const [count, expected] of [[7, "ابدأ بأساسيات المسار"], [8, "راجع ما يحتاج إلى تثبيت"], [12, "راجع ما يحتاج إلى تثبيت"], [13, "وسّع ممارستك في مواقف الحياة"]]) {
    const answers = Object.fromEntries(bank.questions.map((question, index) => [question.id, index < count ? question.correctIndex : null]));
    assert.equal(gradePlacement(bank, answers).guidance.title, expected);
  }
});

test("submission validation rejects missing, forged, and malformed answers while allowing safe partial drafts", () => {
  assert.equal(validAnswers({}, bank, true), true);
  assert.equal(validAnswers({}, bank), false);
  assert.equal(validAnswers({ "start-greeting": null }, bank, true), true);
  for (const answer of [false, "0", 0.5, -1, 3, {}, [], undefined]) {
    assert.equal(validAnswers({ ...correctAnswers, "start-greeting": answer }, bank), false);
  }
  for (const answers of [null, [], "answers", { ...correctAnswers, forged: 0 }]) assert.equal(validAnswers(answers, bank), false);
  assert.throws(() => gradePlacement(bank, {}), /invalid answers/);
});
