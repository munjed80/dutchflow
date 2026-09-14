import type { Phrase } from "./content";

export const REVIEW_KEY = "dutchflow-review-v1";
export const REVIEW_SESSION_SIZE = 10;
export type ReviewPhrase = Phrase & { lessonSlug: string; lessonTitle: string };

export function parseReview(raw: string | null, allowed: ReadonlySet<string>): string[] {
  if (raw === null) return [];
  if (raw.length > 50000) throw new Error("Review data is too large");
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1 || !("phraseIds" in value) || !Array.isArray(value.phraseIds) || value.phraseIds.length > 1000 || value.phraseIds.some((id) => typeof id !== "string")) throw new Error("Invalid review data");
  return [...new Set(value.phraseIds as string[])].filter((id) => allowed.has(id));
}

export function updateReview(current: string[], change: { add?: string[]; remove?: string[] }, allowed: ReadonlySet<string>): string[] {
  const removed = new Set(change.remove ?? []);
  return [...new Set([...current, ...(change.add ?? [])])].filter((id) => allowed.has(id) && !removed.has(id));
}

export function buildReviewSession(ids: string[], phrases: ReviewPhrase[]): ReviewPhrase[] {
  const byId = new Map(phrases.map((phrase) => [phrase.id, phrase]));
  return [...new Set(ids)].flatMap((id) => { const phrase = byId.get(id); return phrase ? [phrase] : []; }).slice(0, REVIEW_SESSION_SIZE);
}
