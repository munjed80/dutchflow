import lessonsData from "@/data/lessons.json";

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
  level: string;
  number: string;
  title: string;
  dutchTitle: string;
  description: string;
  durationMinutes: number;
  context: string;
  phrases: Phrase[];
  dialogue: { speaker: string; phraseId: string }[];
  questions: Question[];
};

export const lessons: Lesson[] = lessonsData;

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}
