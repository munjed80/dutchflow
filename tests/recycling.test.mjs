import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateRecycling } from "../scripts/lib/validate-recycling.mjs";
const read = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const bank = read("a2-recycling"), units = read("a2-roadmap"), extensions = read("a2-lesson-extensions");
const check = (value) => validateRecycling(value, units, extensions);

test("recycling bank links sixteen cross-unit pairs with separate retrieval and transformation", () => {
  assert.deepEqual(check(bank), []);
  assert.equal(bank.length, 16);
  const covered = new Set(bank.flatMap((set) => set.anchors.map((anchor) => units.find((unit) => unit.lessonSlugs.includes(anchor.lessonSlug)).id)));
  assert.equal(covered.size, units.length);
});

test("recycling validation rejects broken anchors, same-unit pairs and missing task cues", () => {
  for (const mutate of [
    (b) => { b[0].anchors[0].lessonSlug = "introductions"; },
    (b) => { b[0].anchors[0].chunk = "invented chunk"; },
    (b) => { b[0].anchors[1] = { ...b[0].anchors[0] }; },
    (b) => { b[1].slug = b[0].slug; },
    (b) => { b[0].tasks[0].cue = "revealed answer"; },
    (b) => { delete b[0].tasks[1].cue; },
    (b) => { b[0].tasks[0].model = "x".repeat(501); },
    (b) => { b[0].tasks[1].translation = ""; },
    (b) => { b[0].tasks[1].checklist = []; },
    (b) => { b[0].tasks[1] = null; },
    (b) => { b[0] = null; },
  ]) {
    const changed = structuredClone(bank); mutate(changed);
    assert.ok(check(changed).length > 0);
  }
});
