import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { validateNewcomers } from "../scripts/lib/validate-a2-newcomers.mjs";
import { readCourse } from "../scripts/lib/course-inventory.mjs";
import { audioSources } from "../scripts/lib/audio-sources.mjs";
import { planAudio } from "../scripts/lib/audio-assets.mjs";
const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const path = await read("a2-newcomers"), course = await readCourse("A2");

test("newcomer preparation links only A2 lessons in the application's units and validates all four skills", () => {
  assert.deepEqual(validateNewcomers(path, course), []);
  for (const change of [
    (p) => { p[0].lessonSlugs[0] = "introductions"; },
    (p) => { p[0].lessonSlugs[0] = "a2-comparing-products"; },
    (p) => { p[1].slug = p[0].slug; },
    (p) => { p[0].vocabulary[0].forms = ""; },
    (p) => { p[0].phrases[0].arabic = "missing translation"; },
    (p) => { p[0].minutes = -1; },
  ]) {
    const copy = structuredClone(path); change(copy);
    assert.ok(validateNewcomers(copy, course).length);
  }
  assert.ok(validateNewcomers(path.slice(1), course).length);
});

test("all published forty-eight lessons and preceding resources remain byte-equivalent as applications append", async () => {
  const names = ["a2-lessons", "a2-modules", "a2-roadmap", "a2-lesson-extensions", "a2-readings", "a2-scenarios", "a2-practice", "a2-recycling", "a2-review-links"];
  const old = Object.fromEntries(await Promise.all(names.map(async (name) => [name, await read(name)])));
  old["a2-readings"] = old["a2-readings"].slice(0, 24);
  old["a2-scenarios"] = old["a2-scenarios"].slice(0, 24);
  old["a2-roadmap"] = old["a2-roadmap"].map((unit) => ({ ...unit, readingSlugs: unit.readingSlugs.slice(0, 3) }));
  old["a2-practice"] = old["a2-practice"].slice(0, 9);
  old["a2-review-links"] = Object.fromEntries(Object.entries(old["a2-review-links"]).slice(0, 168));
  // Captured from PR #41's green head 63dfaf7 before this expansion.
  assert.equal(createHash("sha256").update(JSON.stringify(old)).digest("hex"), "6268223a8f7581ba9a9b1e5a2fe4c650328a2fa1cfe74476de91945555dcf3aa");
  const legacy = planAudio(audioSources(course.lessons, course.practice.slice(0, 9), []));
  const current = new Map(planAudio(audioSources(course.lessons, course.practice, [])).map((job) => [job.filename, job]));
  assert.equal(legacy.length, 1572); assert.equal(current.size, 1588);
  for (const job of legacy) assert.deepEqual(current.get(job.filename), job);
});

test("new application comprehension has complete targeted remediation and bounded original production", () => {
  const added = course.practice.slice(9);
  assert.equal(added.flatMap((p) => [...p.reading.questions, ...p.listening.questions]).length, 32);
  for (const pack of added) {
    for (const q of [...pack.reading.questions, ...pack.listening.questions]) {
      assert.ok(course.reviewLinks[q.id]?.length);
      for (const slug of course.reviewLinks[q.id]) assert.ok(course.lessons.some((l) => l.slug === slug));
    }
    for (const task of [...pack.writing, ...pack.speaking]) {
      assert.ok(task.model.length <= 500);
      assert.ok(task.checklist.length >= 2);
    }
  }
});
