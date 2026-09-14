import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { compareWriting, normalizeWriting, summarizeWriting, MAX_WRITING_LENGTH } from "../src/lib/writing.ts";
const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));

test("all 101 authored phrases fit the writing limit and match normalized learner input", () => {
  let count = 0;
  for (const lesson of lessons) for (const phrase of lesson.phrases) {
    assert.ok(phrase.dutch.length <= MAX_WRITING_LENGTH);
    assert.ok(compareWriting(`  ${phrase.dutch.toUpperCase().replaceAll(" ", "   ")}  `, phrase.dutch).matches);
    count++;
  }
  assert.equal(count, 101);
});

test("normalization allows formatting differences while preserving meaningful spelling", () => {
  assert.equal(normalizeWriting("  Hoe\n gaat  het?!  "), "hoe gaat het");
  assert.ok(compareWriting("'s morgens", "’s morgens.").matches);
  assert.ok(compareWriting("e\u0301e\u0301n", "één").matches);
  for (const [actual, expected] of [["een", "één"], ["Ik heet Jan", "Ik heet Jaan"], ["Ik ben 13", "Ik ben 30"], ["s morgens", "'s morgens"], ["e mail", "e-mail"], ["Goedemorgen buurman", "Goedemorgen, buurman"]]) assert.equal(compareWriting(actual, expected).matches, false);
  assert.equal(compareWriting("...", "Hallo").matches, false);
  assert.throws(() => compareWriting("x".repeat(501), "Hallo"), /length limit/);
});

test("word alignment identifies omissions, additions, substitutions and ordering without shifting every later word", () => {
  const missing = compareWriting("Ik werk tien jaar", "Ik werk al tien jaar.");
  assert.deepEqual(missing.expected.filter((word) => !word.matched).map((word) => word.text), ["al"]);
  assert.ok(missing.answer.every((word) => word.matched));
  const extra = compareWriting("Ik ik ben hier", "Ik ben hier");
  assert.equal(extra.answer.filter((word) => !word.matched).length, 1);
  assert.ok(extra.expected.every((word) => word.matched));
  const swapped = compareWriting("Ik hier ben", "Ik ben hier");
  assert.equal(swapped.matches, false);
  assert.equal(swapped.expected.filter((word) => !word.matched).length, 1);
  const typo = compareWriting("Ik been hier", "Ik ben hier");
  assert.deepEqual(typo.answer.filter((word) => !word.matched).map((word) => word.text), ["been"]);
  assert.deepEqual(typo.expected.filter((word) => !word.matched).map((word) => word.text), ["ben"]);
});

test("assisted answers are excluded from the first-attempt independent result", () => {
  assert.deepEqual(summarizeWriting([{ phraseId: "a", firstMatches: true, assisted: false }, { phraseId: "b", firstMatches: false, assisted: false }, { phraseId: "c", firstMatches: true, assisted: true }]), { independent: 2, matches: 1, assisted: 1 });
  assert.deepEqual(summarizeWriting([{ phraseId: "c", firstMatches: true, assisted: true }]), { independent: 0, matches: 0, assisted: 1 });
});
