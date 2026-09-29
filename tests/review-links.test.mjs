import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateReviewLinks } from "../scripts/lib/validate-review-links.mjs";
const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const [links, readings, packs, lessons] = await Promise.all(["a1-review-links", "readings", "a1-practice", "lessons"].map(read));

test("every reading and integrated question has a small, valid remediation route", () => {
  assert.deepEqual(validateReviewLinks(links, readings, packs, lessons), []);
  assert.equal(Object.keys(links).length, 108);
});

test("review mapping rejects missing, stale, duplicate, unknown and oversized targets", () => {
  const ids = Object.keys(links);
  const cases = [
    (copy) => { delete copy[ids[0]]; },
    (copy) => { copy[ids[0]] = []; },
    (copy) => { copy[ids[0]] = ["not-published"]; },
    (copy) => { copy[ids[0]] = [lessons[0].slug, lessons[0].slug]; },
    (copy) => { copy[ids[0]] = lessons.slice(0, 3).map((lesson) => lesson.slug); },
    (copy) => { copy[ids[0]] = "introductions"; },
    (copy) => { copy[ids[0]] = null; },
    (copy) => { copy["removed-question"] = [lessons[0].slug]; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(links);
    mutate(copy);
    assert.ok(validateReviewLinks(copy, readings, packs, lessons).length > 0);
  }
  for (const value of [null, [], "invalid", 0]) assert.ok(validateReviewLinks(value, readings, packs, lessons).length > 0);
});
