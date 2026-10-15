import data from "@/data/knm/lessons.json";
import curriculum from "@/data/knm/curriculum.json";
import type { KnmLesson } from "./types";
export const knmLessons = data as KnmLesson[];
export const knmCurriculum = curriculum;
export const knmLessonSummaries = knmLessons.map(({ slug, themeId, number, title, durationMinutes, kind }) => ({ slug, themeId, number, title, durationMinutes, kind }));
export function getKnmLesson(slug: string) { return knmLessons.find((lesson) => lesson.slug === slug); }

export const knmReviewLessons = knmLessons.map(({ slug, themeId, title, questionIds }) => ({ slug, themeId, title, questionIds }));
