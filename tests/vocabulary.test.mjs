import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildVocabulary, filterVocabulary, normalizeVocabularySearch } from "../src/lib/vocabulary.ts";

const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const extensions = JSON.parse(await readFile(new URL("../src/data/lesson-extensions.json", import.meta.url), "utf8"));
const entries = buildVocabulary(lessons, extensions);

test("vocabulary projects only authored context, preserves repeated terms, and rejects broken examples", () => {
  assert.equal(entries.length, extensions.reduce((sum, item) => sum + item.vocabulary.length, 0));
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  const allowed = ["id", "term", "kind", "forms", "meaning", "lessonSlug", "lessonTitle", "moduleId", "phraseId", "example", "translation"].sort();
  for (const entry of entries) {
    assert.deepEqual(Object.keys(entry).sort(), allowed);
    const phrase = lessons.find((lesson) => lesson.slug === entry.lessonSlug).phrases.find((phrase) => phrase.id === entry.phraseId);
    assert.equal(entry.example, phrase.dutch);
    assert.equal(entry.translation, phrase.arabic);
  }
  const common = entries.find((entry, index) => entries.some((other, otherIndex) => index !== otherIndex && entry.term === other.term));
  assert.ok(common, "repeated terms retain their separate lesson contexts");
  assert.ok(filterVocabulary(entries, common.term).filter((entry) => entry.term === common.term).length > 1);
  const broken = structuredClone(extensions);
  broken[0].vocabulary[0].phraseId = "missing";
  assert.throws(() => buildVocabulary(lessons, broken), /Unknown vocabulary example/);
  assert.throws(() => buildVocabulary([], extensions), /Unknown vocabulary lesson/);
});

test("search normalizes Arabic marks and Dutch case, accents and apostrophes without changing display text", () => {
  assert.equal(normalizeVocabularySearch("  الإِسْـم  "), "الاسم");
  assert.equal(normalizeVocabularySearch(" CAFÉ’S "), "cafe's");
  const source = { ...entries[0], term: "de cafés", forms: "café’s", meaning: "الإِسْـم" };
  assert.deepEqual(filterVocabulary([source], "CAFE'S الاسم"), [source]);
  assert.equal(source.meaning, "الإِسْـم");
  assert.equal(filterVocabulary([source], "missing").length, 0);
});

test("query tokens, kind and module filters intersect across terms, forms and example translations", () => {
  const source = { ...entries[0], term: "wonen", forms: "ik woon", kind: "verb", moduleId: "daily-life", example: "Wij wonen hier.", translation: "نحن نسكن هنا" };
  const other = { ...source, id: "other", kind: "noun", moduleId: "appointments" };
  assert.deepEqual(filterVocabulary([source, other], "WOON نسكن", "verb", "daily-life"), [source]);
  assert.deepEqual(filterVocabulary([source], "", "noun"), []);
  assert.deepEqual(filterVocabulary([source], "", "all", "appointments"), []);
  assert.equal(filterVocabulary(entries, "  ").length, entries.length);
  assert.deepEqual(filterVocabulary(entries, "zz-no-match"), []);
});
