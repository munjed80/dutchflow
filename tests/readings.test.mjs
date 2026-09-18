import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { validateReadings } from "../scripts/lib/validate-readings.mjs";
const readings = JSON.parse(await readFile(new URL("../src/data/readings.json", import.meta.url), "utf8"));
const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));

test("twelve original reading units contain vocabulary, grammar and evidenced comprehension questions", () => {
  assert.deepEqual(validateReadings(readings, lessons), []);
  assert.equal(readings.length, 12);
  assert.equal(readings.reduce((sum, reading) => sum + reading.vocabulary.length, 0), 61);
  assert.equal(readings.reduce((sum, reading) => sum + reading.questions.length, 0), 40);
  assert.equal(new Set(readings.map((reading) => reading.text)).size, 12);
});

test("reading validation rejects broken evidence, grammar examples and vocabulary references", () => {
  for (const field of ["evidence", "example", "excerpt"]) {
    const copy = structuredClone(readings);
    if (field === "evidence") copy[0].questions[0].evidence = "A sentence outside the reading.";
    if (field === "example") copy[0].grammar.example = "A sentence outside the reading.";
    if (field === "excerpt") copy[0].vocabulary[0].excerpt = "not-in-the-passage";
    assert.ok(validateReadings(copy, lessons).some((error) => error.includes("absent from passage")));
  }
});

test("reading validation rejects invalid links, answer keys, duplicate identifiers and missing Arabic", () => {
  const copy = structuredClone(readings);
  copy[0].sourceLessons = ["unknown"];
  copy[0].questions[0].correctIndex = 9;
  copy[1].slug = copy[0].slug;
  copy[1].questions[0].id = copy[0].questions[0].id;
  copy[1].questions[1].options[1] = copy[1].questions[1].options[0];
  copy[0].translation = "";
  const errors = validateReadings(copy, lessons).join("\n");
  for (const match of ["lesson links", "answer key", "duplicate slug", "duplicate question id", "duplicate options", "Arabic translation"]) assert.ok(errors.includes(match), match);
  assert.ok(validateReadings(null, lessons).length);
  assert.ok(validateReadings([null, {}], lessons).length);
});
