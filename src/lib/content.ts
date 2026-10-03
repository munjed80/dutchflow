import lessonsData from "@/data/lessons.json";
import a2Lessons from "@/data/a2-lessons.json";
import a2Modules from "@/data/a2-modules.json";
import type { CourseLevel } from "./levels";
import modulesData from "@/data/modules.json";

export type CourseModule = { id: string; title: string; description: string; level: CourseLevel };

export type Phrase = {
  id: string;
  dutch: string;
  arabic: string;
  tip: string;
};

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  slug: string;
  moduleId: string;
  level: CourseLevel;
  number: string;
  title: string;
  dutchTitle: string;
  description: string;
  durationMinutes: number;
  context: string;
  goal: string;
  grammar: { title: string; explanation: string; example: string; translation: string };
  phrases: Phrase[];
  dialogue: { speaker: string; phraseId: string }[];
  questions: Question[];
};

export const lessons: Lesson[] = [...lessonsData.map((lesson) => ({ ...lesson, level: "A1" as const })), ...a2Lessons.map((lesson) => ({ ...lesson, level: "A2" as const }))];
export const courseModules: CourseModule[] = [...modulesData.map((module) => ({ ...module, level: "A1" as const })), ...a2Modules.map((module) => ({ ...module, level: "A2" as const }))];
export function getLevelLessons(level: CourseLevel) { return lessons.filter((lesson) => lesson.level === level); }
export function getLevelModules(level: CourseLevel) { return courseModules.filter((module) => module.level === level); }
export function sourceLevel(sourceLessons: string[]): CourseLevel { return getLesson(sourceLessons[0])?.level ?? "A1"; }
export type LessonSummary = Pick<Lesson,
  "level" | "slug" | "moduleId" | "number" | "title" | "dutchTitle" | "description" | "durationMinutes"
>;

export function getLessonSummaries(level: CourseLevel = "A1"): LessonSummary[] {
  return getLevelLessons(level).map(({ slug, moduleId, number, title, dutchTitle, description, durationMinutes }) => ({
    level, slug, moduleId, number, title, dutchTitle, description, durationMinutes,
  }));
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}
