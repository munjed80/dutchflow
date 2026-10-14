import "server-only";
import data from "@/data/knm/questions.json";
import { getKnmLesson, knmCurriculum } from "@/lib/knm/content";
import { buildKnmExam, projectKnmQuestion } from "@/lib/knm/scoring";
import type { KnmQuestion, KnmSelection, PublicQuestion } from "@/lib/knm/types";
export const knmQuestions = data.questions as KnmQuestion[];
export const knmQuestionIds = knmQuestions.map((q) => q.id);
export function selectKnmQuestions(selection: KnmSelection): KnmQuestion[] | null {
  if (selection.mode === "lesson") {
    const lesson = getKnmLesson(selection.key);
    return lesson ? lesson.questionIds.map((id) => knmQuestions.find((q) => q.id === id)!) : null;
  }
  if (selection.mode === "exam") {
    const index = knmCurriculum.exams.findIndex((e) => e.slug === selection.key);
    if (index < 0) return null;
    // Four distinct authored forms; equal theme allocation is a practice design, not a DUO blueprint.
    return buildKnmExam(knmQuestions, index);
  }
  if (selection.mode === "review" && selection.key === "mistakes" && Array.isArray(selection.questionIds) && selection.questionIds.length > 0 && selection.questionIds.length <= 20 && new Set(selection.questionIds).size === selection.questionIds.length && selection.questionIds.every((id) => knmQuestionIds.includes(id))) {
    return selection.questionIds.map((id) => knmQuestions.find((q) => q.id === id)!);
  }
  return null;
}
export function publicKnmQuestions(questions: KnmQuestion[]): PublicQuestion[] { return questions.map(projectKnmQuestion); }
