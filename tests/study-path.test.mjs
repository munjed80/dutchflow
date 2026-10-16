import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildStudyPath, getStudyPosition } from "../src/lib/study-path.ts";
const read = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const units = read("a2-roadmap"), lessons = read("a2-lessons"), readings = read("a2-readings"), scenarios = read("a2-scenarios"), recycling = read("a2-recycling");
const path = buildStudyPath(units, lessons, readings, scenarios, recycling);

test("all eight study units expose scoped resources without shipping answer banks", () => {
  assert.equal(path.length, 8);
  for (const [index, unit] of path.entries()) {
    assert.deepEqual(unit.lessons.map((item) => item.slug), units[index].lessonSlugs);
    assert.equal(unit.readings.length, 3);
    assert.equal(unit.scenarios.length, 3);
    assert.ok(unit.recycling.length > 0);
    for (const group of [unit.lessons, unit.readings, unit.scenarios, unit.recycling]) for (const item of group) assert.deepEqual(Object.keys(item).sort(), ["slug", "title"]);
    for (const set of unit.recycling) assert.ok(recycling.find((item) => item.slug === set.slug).anchors.some((anchor) => units[index].lessonSlugs.includes(anchor.lessonSlug)));
  }
  assert.throws(() => buildStudyPath(units, lessons.slice(1), readings, scenarios, recycling), /Missing study resource/);
});

test("study position uses the first gap, ignores unknown and duplicate completions, and supports a finished path", () => {
  assert.equal(getStudyPosition(path, ["introductions", "unknown"]).next.slug, lessons[0].slug);
  const slugs = lessons.map((item) => item.slug);
  const partial = getStudyPosition(path, [slugs[0], slugs[0], ...slugs.slice(2)]);
  assert.equal(partial.next.slug, slugs[1]);
  assert.equal(partial.completedUnitIds.length, 7);
  assert.equal(partial.completedUnitIds.includes(units[0].id), false);
  const finished = getStudyPosition(path, slugs);
  assert.equal(finished.next, null);
  assert.equal(finished.completedUnitIds.length, 8);
  assert.deepEqual(getStudyPosition(path, slugs.slice(0, 6)).completedUnitIds, [units[0].id]);
});
