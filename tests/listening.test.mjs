import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { buildListeningRounds, summarizeListening } from "../src/lib/listening.ts";
const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));

test("all 165 phrases form listening rounds with exactly one correct, distinct meaning", () => {
  let count = 0;
  for (const lesson of lessons) {
    const rounds = buildListeningRounds(lesson.phrases);
    assert.equal(rounds.length, lesson.phrases.length);
    for (const round of rounds) {
      assert.equal(round.choices.length, 3);
      assert.equal(new Set(round.choices.map((choice) => choice.text.trim())).size, 3);
      assert.equal(round.choices.filter((choice) => choice.id === round.phrase.id).length, 1);
      assert.equal(round.choices.find((choice) => choice.id === round.phrase.id).text, round.phrase.arabic);
      for (const choice of round.choices) assert.ok(lesson.phrases.some((phrase) => phrase.id === choice.id));
    }
    count += rounds.length;
  }
  assert.equal(count, 165);
});

test("text-assisted answers never inflate independent listening results", () => {
  assert.deepEqual(summarizeListening([{ phraseId: "one", correct: true, assisted: true }, { phraseId: "two", correct: true, assisted: false }, { phraseId: "three", correct: false, assisted: false }]), { listening: 2, correct: 1, assisted: 1 });
  assert.deepEqual(summarizeListening([{ phraseId: "one", correct: true, assisted: true }]), { listening: 0, correct: 0, assisted: 1 });
});

test("duplicate meanings cannot create an ambiguous listening answer", () => {
  const phrases = [0, 1, 2].map((index) => ({ id: String(index), dutch: "Hallo", arabic: "مرحباً", tip: "" }));
  assert.throws(() => buildListeningRounds(phrases), /three distinct meanings/);
});
