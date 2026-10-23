import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readCourse } from "../scripts/lib/course-inventory.mjs";
const course = await readCourse("A2");

test("mobile expansion appends resources without rewriting any preceding reading, scenario or unit identity", () => {
  const old = [course.readings.slice(0, 24), course.scenarios.slice(0, 24), course.units.map((unit) => ({ ...unit, readingSlugs: unit.readingSlugs.slice(0, 3) }))];
  // Captured from merged PR #41 (main 5a7de00), before authoring this expansion.
  assert.equal(createHash("sha256").update(JSON.stringify(old)).digest("hex"), "8655c85a06730d946c468d19c6e5a64fee5044f797f84a9fcd76c8f6e4b92923");
  assert.equal(course.readings.length, 28); assert.equal(course.scenarios.length, 28);
  assert.equal(course.readings.flatMap((r) => r.questions).length, 136);
  assert.equal(course.scenarios.flatMap((s) => s.turns).length, 120);
});

test("each new situation connects six evidenced questions, guided interaction and changed-detail production", () => {
  for (const reading of course.readings.slice(24)) {
    const scenario = course.scenarios.find((s) => s.slug === `${reading.slug}-dialogue`);
    assert.ok(course.units.some((u) => u.readingSlugs.includes(reading.slug)));
    assert.equal(reading.questions.length, 6); assert.equal(reading.vocabulary.length, 6);
    assert.ok(reading.production); assert.ok(scenario.transfer);
    assert.equal(scenario.turns.length, 4);
    assert.deepEqual(scenario.sourceLessons, reading.sourceLessons);
    for (const q of reading.questions) {
      assert.ok(reading.text.includes(q.evidence));
      assert.ok(course.reviewLinks[q.id].every((slug) => reading.sourceLessons.includes(slug)));
    }
  }
  const energy = course.readings.find((r) => r.slug === "a2-reading-an-energy-note");
  assert.match(energy.questions[4].evidence, /De prijs per kWh staat niet/);
  assert.match(energy.production.model, /60 kWh/);
  const borrowing = course.scenarios.find((s) => s.slug === "a2-borrowing-study-materials-dialogue");
  const last = borrowing.turns.at(-1);
  assert.match(last.choices[last.correctIndex].text, /maandag/);
  assert.ok(last.choices.some((c) => /Woensdag/.test(c.text)));
});
