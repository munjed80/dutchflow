import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createHash } from "node:crypto";
import { validateKnm } from "../scripts/lib/validate-knm.mjs";
import { buildKnmExam, gradeKnm, projectKnmQuestion, validKnmAnswers } from "../src/lib/knm/scoring.ts";
import { applyKnmResult, cleanKnmProgress } from "../src/lib/knm/storage.ts";
const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/knm/${name}.json`, import.meta.url), "utf8"));
const [curriculum, lessons, bank] = await Promise.all([read("curriculum"), read("lessons"), read("questions")]);
const all = bank.questions;
test("KNM covers 78 official knowledge objectives with bilingual authored content and unique questions", () => {
  assert.deepEqual(validateKnm(curriculum, lessons, bank), []);
  assert.equal(lessons.length, 48); assert.equal(all.length, 449);
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
    const form = buildKnmExam(all,i,curriculum.examLessonSlugs); assert.equal(form.length,40);
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

test("expanded lessons add depth without changing legacy question IDs or timed form selections", () => {
  const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  assert.equal(hash(lessons.slice(0, 40)), "71090ee3116122311b62632fc49109cf2896357f5ba9c213064e6bfc52aedab7");
  assert.equal(hash(all.slice(0, 353)), "6bffa92d084ab59feef2f4600703b15acb39822542e18ef4e2c8a54ae8bb75b9");
  const applications = lessons.filter((lesson) => lesson.kind === "application");
  assert.equal(applications.length, 16); assert.equal(new Set(applications.map((lesson) => lesson.themeId)).size, 8);
  for (const lesson of applications) { assert.equal(lesson.points.length, 12); assert.equal(lesson.questionIds.length, 12); assert.equal(lesson.vocabulary.length, 8); assert.equal(lesson.dialogue.length, 4); }
  for (let form = 0; form < 4; form++) {
    assert.deepEqual(buildKnmExam(all, form, curriculum.examLessonSlugs).map((q) => q.id), buildKnmExam(all.slice(0, 257), form).map((q) => q.id));
  }
  assert.deepEqual(buildKnmExam(all, 0, []), []);
  const bad = structuredClone(curriculum); bad.examLessonSlugs[0] = "missing";
  assert.match(validateKnm(bad, lessons, bank).join(" "), /core exam lesson selection/);
  const invalid = structuredClone(lessons); invalid.find((lesson) => lesson.kind).dialogue[0].ar = "";
  assert.match(validateKnm(curriculum, invalid, bank).join(" "), /invalid dialogue/);
});

test("comprehensive forms include all forty lessons while keeping balanced length and grade boundaries", () => {
  const used = new Set();
  for (let form = 4; form < 8; form++) {
    const questions = buildKnmExam(all, form, curriculum.applicationExamLessonSlugs);
    assert.equal(questions.length, 40); assert.equal(new Set(questions.map((q) => q.lessonSlug)).size, 40);
    for (const question of questions) { assert.ok(!used.has(question.id)); used.add(question.id); }
    for (const theme of curriculum.themes) assert.equal(questions.filter((q) => q.themeId === theme.id).length, 5);
    const answers = Object.fromEntries(questions.map((q) => [q.id, q.correctIndex]));
    assert.equal(gradeKnm(questions, answers, null).completedLesson, null);
  }
  assert.deepEqual(buildKnmExam(all, 12), []);
});

test("extended forms rotate core coverage, include both applications, preserve all previous forms and never complete lessons", () => {
  const used = new Set(), covered = new Set();
  for (let form = 0; form < 8; form++) {
    const curated = form < 4 ? curriculum.examLessonSlugs : curriculum.applicationExamLessonSlugs;
    assert.deepEqual(buildKnmExam(all, form, curated), buildKnmExam(all.slice(0, 353), form, curated));
  }
  for (let form = 8; form < 12; form++) {
    const questions = buildKnmExam(all, form, curriculum.extendedExamLessonSlugs);
    assert.equal(questions.length, 40);
    for (const question of questions) { assert.ok(!used.has(question.id)); used.add(question.id); covered.add(question.lessonSlug); }
    for (const theme of curriculum.themes) {
      const group = questions.filter((q) => q.themeId === theme.id);
      assert.equal(group.length, 5); assert.equal(new Set(group.map((q) => q.lessonSlug)).size, 5);
      const applications = lessons.filter((l) => l.themeId === theme.id && l.kind === "application");
      assert.ok(applications.every((l) => group.some((q) => q.lessonSlug === l.slug)));
      const omitted = lessons.filter((l) => l.themeId === theme.id && !l.kind)[form % 4];
      assert.ok(group.every((q) => q.lessonSlug !== omitted.slug));
    }
    assert.equal(gradeKnm(questions, Object.fromEntries(questions.map((q) => [q.id, q.correctIndex])), null).completedLesson, null);
  }
  assert.equal(covered.size, 48);
  for (const invalid of [-1, 1.5, 12, NaN]) assert.deepEqual(buildKnmExam(all, invalid), []);
  assert.deepEqual(buildKnmExam(all, 8, curriculum.applicationExamLessonSlugs), []);
  const bad = structuredClone(curriculum); bad.extendedExamLessonSlugs[0] = "unknown";
  assert.match(validateKnm(bad, lessons, bank).join(" "), /extended exam lesson selection/);
});

test("source review dates retain older checks and reject future or invalid calendar dates", () => {
  assert.ok(curriculum.sources.some((s) => s.checkedAt === "2026-10-14"));
  assert.ok(curriculum.sources.some((s) => s.checkedAt === "2026-10-15"));
  for (const date of ["2026-10-16", "2026-02-30", "2026-2-1", "not-a-date", null]) {
    const bad = structuredClone(curriculum); bad.sources[0].checkedAt = date;
    assert.match(validateKnm(bad, lessons, bank).join(" "), /invalid source review date/);
  }
  const bad = structuredClone(curriculum); bad.reviewedAt = "2026-02-30";
  assert.match(validateKnm(bad, lessons, bank).join(" "), /invalid latest source review date/);
});
