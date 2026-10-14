import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateKnm } from "../scripts/lib/validate-knm.mjs";
import { buildKnmExam, gradeKnm, projectKnmQuestion, validKnmAnswers } from "../src/lib/knm/scoring.ts";
import { applyKnmResult, cleanKnmProgress } from "../src/lib/knm/storage.ts";
const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/knm/${name}.json`, import.meta.url), "utf8"));
const [curriculum, lessons, bank] = await Promise.all([read("curriculum"), read("lessons"), read("questions")]);
const all = bank.questions;
test("KNM covers 78 official knowledge objectives with bilingual authored content and unique questions", () => {
  assert.deepEqual(validateKnm(curriculum, lessons, bank), []);
  assert.equal(lessons.length, 32); assert.equal(all.length, 257);
  const bad = structuredClone(bank); bad.questions[0].correctIndex = 9; bad.questions[1].objective = "missing"; bad.questions[2].options[1] = bad.questions[2].options[0];
  assert.match(validateKnm(curriculum, lessons, bad).join(" "), /invalid answer key/);
  assert.match(validateKnm(curriculum, lessons, bad).join(" "), /unknown question reference/);
  assert.match(validateKnm(curriculum, lessons, bad).join(" "), /invalid options/);
  const broken = structuredClone(curriculum); broken.objectives[0].lessonSlugs = [];
  assert.match(validateKnm(broken, lessons, bank).join(" "), /unmapped objective/);
  assert.ok(validateKnm(null, lessons, bank).length);
});
test("four 40-question forms are disjoint, balanced across eight themes and include all four lessons per theme", () => {
  const used = new Set();
  for (let i=0;i<4;i++) {
    const form = buildKnmExam(all,i); assert.equal(form.length,40);
    for (const q of form) { assert.ok(!used.has(q.id)); used.add(q.id); }
    for (const theme of curriculum.themes) { const group = form.filter((q) => q.themeId === theme.id); assert.equal(group.length,5); assert.equal(new Set(group.map((q) => q.lessonSlug)).size,4); }
  }
  assert.deepEqual(buildKnmExam(all,99),[]);
});
test("public projection strips answer keys, explanations and future private metadata", () => {
  const q = projectKnmQuestion({...all[0],secret:"do-not-publish"});
  assert.equal("correctIndex" in q,false);assert.equal("explanation" in q,false);assert.equal("secret" in q,false);
});
test("visual contexts cover every theme, appear in timed forms and preserve a safe public projection", () => {
  const visual = all.filter((q) => q.visual);
  assert.equal(visual.length, 8);
  assert.equal(new Set(visual.map((q) => q.themeId)).size, 8);
  const forms = Array.from({ length: 4 }, (_, i) => buildKnmExam(all, i)).flat();
  assert.ok(visual.every((q) => forms.some((item) => item.id === q.id)));
  const original = visual[0];
  const publicQuestion = projectKnmQuestion({ ...original, visual: { ...original.visual, correctIndex: 1, description: { ...original.visual.description, secret: "private" } } });
  assert.deepEqual(publicQuestion.visual, original.visual);
  const invalid = structuredClone(bank); invalid.questions.find((q) => q.visual).visual.kind = "unknown";
  assert.match(validateKnm(curriculum, lessons, invalid).join(" "), /invalid visual context/);
});
test("grading treats omitted answers as mistakes; only a perfect lesson attempt grants free completion", () => {
  const questions = all.filter((q) => q.lessonSlug === lessons[0].slug), answers = Object.fromEntries(questions.map((q)=>[q.id,q.correctIndex]));
  assert.equal(gradeKnm(questions,answers,lessons[0].slug).completedLesson,lessons[0].slug);
  const omitted = {...answers};delete omitted[questions[0].id];const result=gradeKnm(questions,omitted,lessons[0].slug);
  assert.equal(result.correct,7);assert.equal(result.items[0].chosen,null);assert.equal(result.completedLesson,null);
  assert.equal(gradeKnm(questions,answers,null).completedLesson,null);
  assert.ok(validKnmAnswers(answers,questions));assert.ok(validKnmAnswers({},questions));
  for(const invalid of [null,[],{unknown:0},{[questions[0].id]:3},{[questions[0].id]:0.5},{[questions[0].id]:"0"}])assert.equal(validKnmAnswers(invalid,questions),false);
});
test("KNM guest progress rejects corrupt shape, filters stale IDs and updates only attempted mistakes", () => {
  const slugs=lessons.map((l)=>l.slug),ids=all.map((q)=>q.id);
  assert.equal(cleanKnmProgress({version:2,completedLessons:[],wrongQuestionIds:[]},slugs,ids),null);
  const clean=cleanKnmProgress({version:1,completedLessons:[slugs[0],slugs[0],"introductions"],wrongQuestionIds:[ids[0],"bad"]},slugs,ids);
  assert.deepEqual(clean,{completedLessons:[slugs[0]],wrongQuestionIds:[ids[0]]});
  const mixed=gradeKnm(all.slice(0,2),{[ids[0]]:all[0].correctIndex},null);
  const next=applyKnmResult({completedLessons:[slugs[1]],wrongQuestionIds:[ids[0],ids[7]]},mixed);
  assert.deepEqual(next.completedLessons,[slugs[1]]);assert.ok(!next.wrongQuestionIds.includes(ids[0]));assert.ok(next.wrongQuestionIds.includes(ids[1]));assert.ok(next.wrongQuestionIds.includes(ids[7]));
});

test("review sessions scope by theme, preserve saved order and reject stale IDs or invalid sizes", async () => {
  const { knmReviewIds, knmReviewBatch, knmReviewGroups } = await import("../src/lib/knm/review.ts");
  const selected = [all[33].id, all[1].id, all[0].id, all[1].id, "stale"];
  assert.deepEqual(knmReviewIds(lessons, selected), [all[33].id, all[1].id, all[0].id]);
  assert.deepEqual(knmReviewBatch(lessons, selected, "1", 5), [all[1].id, all[0].id]);
  assert.deepEqual(knmReviewBatch(lessons, selected, "unknown", 10), []);
  assert.deepEqual(knmReviewBatch(lessons, selected, "all", 200), []);
  assert.equal(knmReviewBatch(lessons, all.map((q) => q.id), "all", 10).length, 10);
  const groups = knmReviewGroups(lessons, selected, "1");
  assert.equal(groups.length, 1); assert.equal(groups[0].slug, "finding-work"); assert.equal(groups[0].count, 2);
});
