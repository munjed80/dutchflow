import type { Lesson } from "./content";
import type { LessonExtension } from "./curriculum";

export type VocabularyEntry = {
  id: string;
  term: string;
  kind: string;
  forms: string;
  meaning: string;
  lessonSlug: string;
  lessonTitle: string;
  moduleId: string;
  phraseId: string;
  example: string;
  translation: string;
};

// Explicit projection: never send lesson quizzes or production models to this page.
export function buildVocabulary(lessons: Lesson[], extensions: LessonExtension[]): VocabularyEntry[] {
  const lessonMap = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  return extensions.flatMap((extension) => {
    const lesson = lessonMap.get(extension.lessonSlug);
    if (!lesson) throw new Error(`Unknown vocabulary lesson: ${extension.lessonSlug}`);
    return extension.vocabulary.map((word) => {
      const phrase = lesson.phrases.find((item) => item.id === word.phraseId);
      if (!phrase) throw new Error(`Unknown vocabulary example: ${word.phraseId}`);
      return {
        id: `${lesson.slug}:${word.term}`, term: word.term, kind: word.kind,
        forms: word.forms, meaning: word.meaning, lessonSlug: lesson.slug,
        lessonTitle: lesson.title, moduleId: lesson.moduleId,
        phraseId: phrase.id, example: phrase.dutch, translation: phrase.arabic,
      };
    });
  });
}

export function normalizeVocabularySearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f\u0640\u064b-\u065f\u0670]/g, "")
    .replace(/[’‘]/g, "'").toLowerCase().trim();
}

export function filterVocabulary(entries: VocabularyEntry[], query: string, kind = "all", moduleId = "all") {
  const tokens = normalizeVocabularySearch(query).split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    if (kind !== "all" && entry.kind !== kind) return false;
    if (moduleId !== "all" && entry.moduleId !== moduleId) return false;
    const text = normalizeVocabularySearch(`${entry.term} ${entry.forms} ${entry.meaning} ${entry.example} ${entry.translation} ${entry.lessonTitle}`);
    return tokens.every((token) => text.includes(token));
  });
}
