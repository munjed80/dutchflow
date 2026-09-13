import lessonsData from "@/data/lessons.json";
import modulesData from "@/data/modules.json";

export type CourseModule = { id: string; title: string; description: string };

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
  level: string;
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

export const lessons: Lesson[] = lessonsData;
export const courseModules: CourseModule[] = modulesData;
export type LessonSummary = Pick<Lesson,
  "slug" | "moduleId" | "number" | "title" | "dutchTitle" | "description" | "durationMinutes"
>;

export function getLessonSummaries(): LessonSummary[] {
  return lessons.map(({ slug, moduleId, number, title, dutchTitle, description, durationMinutes }) => ({
    slug, moduleId, number, title, dutchTitle, description, durationMinutes,
  }));
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}
