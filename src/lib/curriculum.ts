import roadmapData from "@/data/a1-roadmap.json";
import extensionData from "@/data/lesson-extensions.json";

export type CurriculumUnit = { id: string; title: string; outcomes: string[]; lessonSlugs: string[]; readingSlugs: string[]; remaining: string[] };
export type ProductionTask = { prompt: string; cue?: string; model: string; translation: string; checklist: string[] };
export type LessonExtension = {
  lessonSlug: string;
  vocabulary: { term: string; kind: string; forms: string; meaning: string; phraseId: string }[];
  tasks: ProductionTask[];
};
export const curriculum: CurriculumUnit[] = roadmapData;
export const lessonExtensions: LessonExtension[] = extensionData;
