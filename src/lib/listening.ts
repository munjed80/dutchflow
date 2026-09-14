import type { Phrase } from "./content";

export type ListeningRound = { phrase: Phrase; choices: { id: string; text: string }[] };
export type ListeningAttempt = { phraseId: string; correct: boolean; assisted: boolean };

export function buildListeningRounds(phrases: Phrase[]): ListeningRound[] {
  return phrases.map((phrase, index) => {
    const candidates = [...phrases.slice(index + 1), ...phrases.slice(0, index)];
    const choices = [{ id: phrase.id, text: phrase.arabic }];
    const used = new Set([phrase.arabic.trim()]);
    for (const candidate of candidates) {
      if (!used.has(candidate.arabic.trim())) {
        used.add(candidate.arabic.trim()); choices.push({ id: candidate.id, text: candidate.arabic });
        if (choices.length === 3) break;
      }
    }
    if (choices.length < 3) throw new Error(`Listening needs three distinct meanings: ${phrase.id}`);
    const offset = index % choices.length;
    return { phrase, choices: [...choices.slice(offset), ...choices.slice(0, offset)] };
  });
}
export function summarizeListening(attempts: ListeningAttempt[]) {
  const listening = attempts.filter((attempt) => !attempt.assisted);
  return { listening: listening.length, correct: listening.filter((attempt) => attempt.correct).length, assisted: attempts.length - listening.length };
}
