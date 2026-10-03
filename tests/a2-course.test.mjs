import assert from "node:assert/strict";
import test from "node:test";
import { readCourse } from "../scripts/lib/course-inventory.mjs";
import { validateCourse } from "../scripts/lib/validate-course.mjs";
import { validateCurriculum } from "../scripts/lib/validate-curriculum.mjs";
import { loadAudioInventory, audioLevel } from "../scripts/lib/audio-inventory.mjs";
import { audioSources } from "../scripts/lib/audio-sources.mjs";
import { planAudio } from "../scripts/lib/audio-assets.mjs";
import { readFile } from "node:fs/promises";
import { buildListeningRounds } from "../src/lib/listening.ts";
import { compareWriting } from "../src/lib/writing.ts";
const a1 = await readCourse("A1"), a2 = await readCourse("A2");

test("the first A2 unit has connected reception, production, interaction and valid same-level references", () => {
  assert.deepEqual(validateCourse(a2, "A2"), []);
  assert.equal(a2.lessons.length, 4);
  assert.equal(a2.extensions.length, 4);
  assert.equal(a2.lessons.flatMap((lesson) => lesson.phrases).length, 32);
  assert.equal(a2.readings.length, 1);
  assert.equal(a2.scenarios[0].turns.length, 4);
  assert.equal(a2.practice.length, 1);
  for (const lesson of a2.lessons) {
    for (const round of buildListeningRounds(lesson.phrases)) {
      assert.equal(new Set(round.choices.map((choice) => choice.text)).size, 3);
      assert.equal(round.choices.filter((choice) => choice.id === round.phrase.id).length, 1);
      assert.ok(compareWriting(round.phrase.dutch, round.phrase.dutch).matches);
    }
  }
});

test("cross-level mistakes, numbering, unknown levels and duplicate published identities fail validation", () => {
  const copy = structuredClone(a2);
  copy.readings[0].sourceLessons = [a1.lessons[0].slug];
  copy.scenarios[0].sourceLessons = [a1.lessons[0].slug];
  copy.reviewLinks[Object.keys(copy.reviewLinks)[0]] = [a1.lessons[0].slug];
  const errors = validateCourse(copy, "A2").join("\n");
  for (const message of ["invalid lesson links", "invalid unit or lesson links", "Review links"]) assert.ok(errors.includes(message), message);
  const lessons = [...structuredClone(a1.lessons), ...structuredClone(a2.lessons)];
  const modules = [...a1.modules, ...a2.modules];
  assert.deepEqual(validateCurriculum(lessons, modules), []);
  lessons[53].number = "54";
  lessons[54].level = "B1";
  lessons[55].moduleId = a1.modules[0].id;
  lessons[56].phrases[0].id = lessons[0].phrases[0].id;
  const invalid = validateCurriculum(lessons, modules).join("\n");
  for (const message of ["lesson order", "unsupported course level", "level mismatch", "duplicate ID"]) assert.ok(invalid.includes(message), message);
});

test("shared audio planning retains every A1 job unchanged before appending 132 A2 variants", async () => {
  const { sources, overrides, levels } = await loadAudioInventory();
  const pronunciation = JSON.parse(await readFile(new URL("../src/data/pronunciation.json", import.meta.url), "utf8"));
  const previous = planAudio(audioSources(a1.lessons, a1.practice, pronunciation), overrides);
  const all = planAudio(sources, overrides);
  assert.equal(previous.length, 1468);
  assert.deepEqual(all.slice(0, previous.length), previous);
  assert.equal(all.length, 1600);
  assert.equal(all.filter((job) => levels.get(job.phraseId) === "A2").length, 132);
  assert.equal(new Set(all.map((job) => job.filename)).size, all.length);
  assert.equal(audioLevel([]), undefined);
  assert.equal(audioLevel(["--dry-run", "--level=A1"]), "A1");
  for (const args of [["--level=A3"], ["--level=A1", "--level=A2"]]) assert.throws(() => audioLevel(args));
});

test("audio CLI selection scopes generation and strict completeness without requiring credentials", async () => {
  const { spawnSync } = await import("node:child_process");
  for (const [level, count] of [["A1", 1468], ["A2", 132]]) {
    const dry = spawnSync(process.execPath, ["scripts/generate-audio.mjs", "--dry-run", `--level=${level}`], { encoding: "utf8" });
    assert.equal(dry.status, 0, dry.stderr);
    assert.match(dry.stdout, new RegExp(`${count} variants`));
    assert.match(dry.stdout, new RegExp(`Selected curriculum \\(${level}\\)`));
  }
  const invalid = spawnSync(process.execPath, ["scripts/generate-audio.mjs", "--dry-run", "--level=A1", "--level=A2"], { encoding: "utf8" });
  assert.notEqual(invalid.status, 0);
  // The empty checked-in catalogue makes both strict gates fail at their own denominator.
  const catalog = JSON.parse(await readFile(new URL("../src/lib/audio-catalog.json", import.meta.url), "utf8"));
  if (!Object.keys(catalog.assets).length) for (const [level, count] of [["A1", 1468], ["A2", 132]]) {
    const check = spawnSync(process.execPath, ["scripts/check-audio.mjs", "--require-complete", `--level=${level}`], { encoding: "utf8" });
    assert.equal(check.status, 1);
    assert.match(check.stdout, new RegExp(`0/${count} reviewed`));
    assert.match(check.stderr, /incomplete/);
  }
});
