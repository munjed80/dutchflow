export const MAX_WRITING_LENGTH = 500;

// Preserve accents, apostrophes, hyphens, numbers, and internal punctuation.
export function normalizeWriting(text: string): string {
  return text.normalize("NFC").toLowerCase().replace(/[’‘]/g, "'")
    .trim().replace(/[.!?…]+$/u, "").trim().replace(/\s+/g, " ");
}

export type WritingToken = { text: string; matched: boolean };
export type WritingComparison = { matches: boolean; answer: WritingToken[]; expected: WritingToken[] };
export type WritingAttempt = { phraseId: string; firstMatches: boolean; assisted: boolean };

export function compareWriting(answer: string, expected: string): WritingComparison {
  if (answer.length > MAX_WRITING_LENGTH || expected.length > MAX_WRITING_LENGTH) throw new Error("Writing text exceeds the length limit");
  const actualWords = normalizeWriting(answer).split(" ").filter(Boolean);
  const expectedWords = normalizeWriting(expected).split(" ").filter(Boolean);
  const actual = actualWords.map((text) => ({ text, matched: false }));
  const model = expectedWords.map((text) => ({ text, matched: false }));
  // Align words in order, including repeated words, without guessing grammar.
  const lengths = Array.from({ length: actual.length + 1 }, () => new Uint16Array(model.length + 1));
  for (let i = actual.length - 1; i >= 0; i--) {
    for (let j = model.length - 1; j >= 0; j--) {
      lengths[i][j] = actual[i].text === model[j].text ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  let i = 0, j = 0;
  while (i < actual.length && j < model.length) {
    if (actual[i].text === model[j].text) { actual[i++].matched = true; model[j++].matched = true; }
    else if (lengths[i + 1][j] >= lengths[i][j + 1]) i++;
    else j++;
  }
  return { matches: actual.length > 0 && actualWords.join(" ") === expectedWords.join(" "), answer: actual, expected: model };
}

export function summarizeWriting(attempts: WritingAttempt[]) {
  const independent = attempts.filter((attempt) => !attempt.assisted);
  return { independent: independent.length, matches: independent.filter((attempt) => attempt.firstMatches).length, assisted: attempts.length - independent.length };
}
