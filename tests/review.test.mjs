import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { parseReview, updateReview, buildReviewSession } from "../src/lib/review.ts";
const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const phrases = lessons.flatMap((lesson) => lesson.phrases.map((phrase) => ({ ...phrase, lessonSlug: lesson.slug, lessonTitle: lesson.title })));
const allowed = new Set(phrases.map((phrase) => phrase.id));
const [a, b] = [...allowed];

test("review persistence validates versions, bounds, and IDs without accepting malformed data", () => {
  assert.deepEqual(parseReview(null, allowed), []);
  assert.deepEqual(parseReview(JSON.stringify({ version: 1, phraseIds: [a, a, "unknown", b] }), allowed), [a, b]);
  for (const raw of ["{", "null", "[]", JSON.stringify({ version: 2, phraseIds: [a] }), JSON.stringify({ version: 1, phraseIds: [3] }), JSON.stringify({ version: 1, phraseIds: Array(1001).fill(a) }), " ".repeat(50001)]) assert.throws(() => parseReview(raw, allowed));
});

test("explicit adds and removals are deduplicated, preserve order, and never introduce unknown phrases", () => {
  assert.deepEqual(updateReview([a], { add: [a, b, "unknown"] }, allowed), [a, b]);
  assert.deepEqual(updateReview([a, b], { remove: [a] }, allowed), [b]);
  assert.deepEqual(updateReview([a], { add: [b], remove: [b] }, allowed), [a]);
});

test("review sessions contain up to ten unique known phrases in list order", () => {
  const ids = [...allowed];
  assert.equal(phrases.length, 125);
  assert.deepEqual(buildReviewSession(["unknown", ids[0], ids[0], ...ids.slice(1)], phrases).map((phrase) => phrase.id), ids.slice(0, 10));
  assert.deepEqual(buildReviewSession([], phrases), []);
  assert.equal(buildReviewSession([ids.at(-2)], phrases)[0].lessonSlug, lessons.at(-1).slug);
});
