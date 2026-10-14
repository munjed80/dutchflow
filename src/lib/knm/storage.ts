import type { KnmProgress, KnmResult } from "./types";
export const KNM_PROGRESS_KEY = "dutchflow-knm-progress-v1";
export const KNM_DRAFT_PREFIX = "dutchflow-knm-draft-v1:";
export function cleanKnmProgress(value: unknown, lessons: string[], questions: string[]): KnmProgress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Partial<KnmProgress> & { version?: unknown };
  if (data.version !== 1 || !Array.isArray(data.completedLessons) || !Array.isArray(data.wrongQuestionIds) || data.completedLessons.length > 1000 || data.wrongQuestionIds.length > 2000) return null;
  return { completedLessons: [...new Set(data.completedLessons)].filter((id) => typeof id === "string" && lessons.includes(id)), wrongQuestionIds: [...new Set(data.wrongQuestionIds)].filter((id) => typeof id === "string" && questions.includes(id)) };
}
export function applyKnmResult(previous: KnmProgress, result: KnmResult): KnmProgress {
  const wrong = new Set(previous.wrongQuestionIds);
  for (const item of result.items) { if (item.correct) wrong.delete(item.id); else wrong.add(item.id); }
  return { completedLessons: [...new Set([...previous.completedLessons, ...(result.completedLesson ? [result.completedLesson] : [])])], wrongQuestionIds: [...wrong] };
}
