import readingsData from "@/data/readings.json";

export type ReadingQuestion = { id: string; prompt: string; options: string[]; correctIndex: number; evidence: string; explanation: string };
export type Reading = {
  slug: string; title: string; dutchTitle: string; topic: string; sourceLessons: string[];
  text: string; translation: string;
  vocabulary: { term: string; excerpt: string; meaning: string }[];
  grammar: { title: string; example: string; translation: string; explanation: string };
  questions: ReadingQuestion[];
};
export const readings: Reading[] = readingsData;
export function getReading(slug: string) { return readings.find((reading) => reading.slug === slug); }
