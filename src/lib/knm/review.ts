import type { Bilingual } from "./types";

export type KnmReviewLesson = { slug: string; themeId: string; title: Bilingual; questionIds: string[] };

/** Keep the saved review order while excluding stale, duplicate and out-of-scope IDs. */
export function knmReviewIds(lessons: KnmReviewLesson[], wrongIds: string[], themeId = "all"): string[] {
  const allowed = new Set(lessons.filter((lesson) => themeId === "all" || lesson.themeId === themeId).flatMap((lesson) => lesson.questionIds));
  return [...new Set(wrongIds)].filter((id) => allowed.has(id));
}

export function knmReviewBatch(lessons: KnmReviewLesson[], wrongIds: string[], themeId: string, size: number): string[] {
  if (![5, 10, 20].includes(size)) return [];
  return knmReviewIds(lessons, wrongIds, themeId).slice(0, size);
}

export function knmReviewGroups(lessons: KnmReviewLesson[], wrongIds: string[], themeId = "all") {
  const pending = new Set(knmReviewIds(lessons, wrongIds, themeId));
  return lessons.map((lesson) => ({ ...lesson, count: lesson.questionIds.filter((id) => pending.has(id)).length })).filter((lesson) => lesson.count > 0);
}
