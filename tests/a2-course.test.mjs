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

test("the published A2 units have connected reception, production, interaction and valid same-level references", () => {
  assert.deepEqual(validateCourse(a2, "A2"), []);
  assert.equal(a2.lessons.length, 24);
  assert.equal(a2.extensions.length, 24);
  assert.equal(a2.lessons.flatMap((lesson) => lesson.phrases).length, 192);
  assert.equal(a2.readings.length, 6);
  assert.equal(a2.scenarios[0].turns.length, 4);
  assert.equal(a2.practice.length, 6);
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

test("shared audio planning retains every A1 job unchanged before appending 792 A2 variants", async () => {
  const { sources, overrides, levels } = await loadAudioInventory();
  const pronunciation = JSON.parse(await readFile(new URL("../src/data/pronunciation.json", import.meta.url), "utf8"));
  const previous = planAudio(audioSources(a1.lessons, a1.practice, pronunciation), overrides);
  const all = planAudio(sources, overrides);
  assert.equal(previous.length, 1468);
  assert.deepEqual(all.slice(0, previous.length), previous);
  assert.equal(all.length, 2260);
  assert.equal(all.filter((job) => levels.get(job.phraseId) === "A2").length, 792);
  assert.equal(new Set(all.map((job) => job.filename)).size, all.length);
  assert.equal(audioLevel([]), undefined);
  assert.equal(audioLevel(["--dry-run", "--level=A1"]), "A1");
  for (const args of [["--level=A3"], ["--level=A1", "--level=A2"]]) assert.throws(() => audioLevel(args));
});

test("audio CLI selection scopes generation and strict completeness without requiring credentials", async () => {
  const { spawnSync } = await import("node:child_process");
  for (const [level, count] of [["A1", 1468], ["A2", 792]]) {
    const dry = spawnSync(process.execPath, ["scripts/generate-audio.mjs", "--dry-run", `--level=${level}`], { encoding: "utf8" });
    assert.equal(dry.status, 0, dry.stderr);
    assert.match(dry.stdout, new RegExp(`${count} variants`));
    assert.match(dry.stdout, new RegExp(`Selected curriculum \\(${level}\\)`));
  }
  const invalid = spawnSync(process.execPath, ["scripts/generate-audio.mjs", "--dry-run", "--level=A1", "--level=A2"], { encoding: "utf8" });
  assert.notEqual(invalid.status, 0);
  // The empty checked-in catalogue makes both strict gates fail at their own denominator.
  const catalog = JSON.parse(await readFile(new URL("../src/lib/audio-catalog.json", import.meta.url), "utf8"));
  if (!Object.keys(catalog.assets).length) for (const [level, count] of [["A1", 1468], ["A2", 792]]) {
    const check = spawnSync(process.execPath, ["scripts/check-audio.mjs", "--require-complete", `--level=${level}`], { encoding: "utf8" });
    assert.equal(check.status, 1);
    assert.match(check.stdout, new RegExp(`0/${count} reviewed`));
    assert.match(check.stderr, /incomplete/);
  }
});

test("unit 1 synthesis requests remain byte-identical as A2 grows", async () => {
  const { sha256 } = await import("../scripts/lib/audio-assets.mjs");
  const unitOne = a2.lessons.filter((lesson) => lesson.moduleId === "a2-recent-activities");
  const pack = a2.practice.filter((item) => item.slug === "a2-recent-activities");
  const jobs = planAudio(audioSources(unitOne, pack, []));
  assert.equal(jobs.length, 132);
  // Fingerprint of the 132 synthesis requests published in merged PR #23.
  assert.equal(sha256(JSON.stringify(jobs)), "a869d0d36a8ce9d5b277d5af3e93b8f5b798d5c214e4290cf67f11013f5354ff");
  const { sources, overrides } = await loadAudioInventory();
  const current = new Map(planAudio(sources, overrides).map((job) => [job.filename, job]));
  for (const job of jobs) assert.deepEqual(current.get(job.filename), job);
});

test("both preceding A2 units retain their exact requests when housing is appended", async () => {
  const { sha256 } = await import("../scripts/lib/audio-assets.mjs");
  const legacy = planAudio(audioSources(a2.lessons.slice(0, 8), a2.practice.slice(0, 2), []));
  assert.equal(legacy.length, 264);
  // All A2 requests from PR #24's original green head, not a regenerated expectation.
  assert.equal(sha256(JSON.stringify(legacy)), "55b8f41cb172412d01414c508011806fba6402552085114d74975199478329e6");
  const { sources, overrides } = await loadAudioInventory();
  const current = new Map(planAudio(sources, overrides).map((job) => [job.filename, job]));
  for (const job of legacy) assert.deepEqual(current.get(job.filename), job);
});

test("appointments preserve all 396 audio requests from the first three units", async () => {
  const { sha256 } = await import("../scripts/lib/audio-assets.mjs");
  const legacy = planAudio(audioSources(a2.lessons.slice(0, 12), a2.practice.slice(0, 3), []));
  assert.equal(legacy.length, 396);
  // Snapshot of the green housing head c880dce, including exact SSML and filenames.
  assert.equal(sha256(JSON.stringify(legacy)), "7e09f695bc8e942581839d08f3e4f6add7f34c3a5a8f0f0ff4afd189fb3350b7");
  const { sources, overrides } = await loadAudioInventory();
  const current = new Map(planAudio(sources, overrides).map((job) => [job.filename, job]));
  for (const job of legacy) assert.deepEqual(current.get(job.filename), job);
});

test("shopping preserves all 528 audio requests from merged units 1–4", async () => {
  const { sha256 } = await import("../scripts/lib/audio-assets.mjs");
  const legacy = planAudio(audioSources(a2.lessons.slice(0, 16), a2.practice.slice(0, 4), []));
  assert.equal(legacy.length, 528);
  // Captured from merged main e30b755 before authoring unit 5, including exact SSML/filenames.
  assert.equal(sha256(JSON.stringify(legacy)), "fd14d38f12f918f54beb9188e92a855184459eca0384adb62a5c420681f832e2");
  const { sources, overrides } = await loadAudioInventory();
  const current = new Map(planAudio(sources, overrides).map((job) => [job.filename, job]));
  for (const job of legacy) assert.deepEqual(current.get(job.filename), job);
});

test("school messages preserve all 660 audio requests from the preceding green shopping head", async () => {
  const { sha256 } = await import("../scripts/lib/audio-assets.mjs");
  const legacy = planAudio(audioSources(a2.lessons.slice(0, 20), a2.practice.slice(0, 5), []));
  assert.equal(legacy.length, 660);
  // Captured from PR #25 head 0bb9459 before unit 6: exact SSML and filenames.
  assert.equal(sha256(JSON.stringify(legacy)), "8879050cc21290ce9257bcbd806870e626067df30c2e07d5155629ec2f20422d");
  const { sources, overrides } = await loadAudioInventory();
  const current = new Map(planAudio(sources, overrides).map((job) => [job.filename, job]));
  for (const job of legacy) assert.deepEqual(current.get(job.filename), job);
});
