import data from "@/data/a2-recycling.json";
import type { ProductionTask } from "./curriculum";

export type RecyclingSet = {
  slug: string;
  title: string;
  goal: string;
  anchors: { lessonSlug: string; chunk: string }[];
  tasks: ProductionTask[];
};
export const a2Recycling: RecyclingSet[] = data;
