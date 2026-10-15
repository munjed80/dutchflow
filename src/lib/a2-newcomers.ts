import data from "@/data/a2-newcomers.json";

/** Preparation metadata remains server-rendered; no extra progress or assessment. */
export const newcomerPath = data;
export const getNewcomerPreparation = (slug: string) => newcomerPath.find((item) => item.slug === slug);
