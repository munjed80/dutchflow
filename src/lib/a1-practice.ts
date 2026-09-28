import data from "@/data/a1-practice.json";
import type { ReadingQuestion } from "@/lib/readings";
import type { ProductionTask } from "@/lib/curriculum";

export type PracticePack = {
  slug: string; title: string; unitIds: string[];
  reading: { text: string; translation: string; questions: ReadingQuestion[]; table?: { caption: string; headers: string[]; rows: string[][] } };
  listening: { id: string; text: string; translation: string; questions: ReadingQuestion[] };
  writing: ProductionTask;
  speaking: ProductionTask & { partnerPrompts: string[] };
};
export const practicePacks: PracticePack[] = data;
