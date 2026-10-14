import type { KnmQuestion, KnmResult } from "./types";
export function gradeKnm(questions: KnmQuestion[], answers: Record<string, number | null>, lessonSlug: string | null): KnmResult {
  const items = questions.map((q) => ({ ...q, chosen: answers[q.id] ?? null, correct: answers[q.id] === q.correctIndex }));
  const correct = items.filter((item) => item.correct).length;
  const themes = [...new Set(questions.map((q) => q.themeId))].map((id) => ({ id, total: items.filter((q) => q.themeId === id).length, correct: items.filter((q) => q.themeId === id && q.correct).length }));
  return { total: items.length, correct, completedLesson: lessonSlug && correct === items.length && items.length > 0 ? lessonSlug : null, items, themes };
}
export function validKnmAnswers(value: unknown, questions: KnmQuestion[]): value is Record<string, number | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length <= questions.length && entries.every(([id, answer]) => {
    const question = questions.find((q) => q.id === id);
    return question && (answer === null || typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < question.options.length);
  });
}
export function buildKnmExam(questions: KnmQuestion[], form: number, lessonSlugs?: string[]): KnmQuestion[] {
  if (!Number.isInteger(form) || form < 0 || form > 7) return [];
  const themes = [...new Set(questions.map((q) => q.themeId))];
  if (themes.length !== 8) return [];
  // Core forms retain their selection; comprehensive forms add the application lesson per theme.
  const expanded = form >= 4, cycle = form % 4, required = expanded ? 5 : 4;
  const groupsByTheme = themes.map((theme) => {
    const pool = questions.filter((q) => q.themeId === theme && (!lessonSlugs || lessonSlugs.includes(q.lessonSlug)));
    const slugs = [...new Set(pool.map((q) => q.lessonSlug))].slice(0, required);
    return slugs.map((slug) => pool.filter((q) => q.lessonSlug === slug));
  });
  if (groupsByTheme.some((groups) => groups.length !== required || groups.some((group) => group.length < 8))) return [];
  return groupsByTheme.flatMap((groups) => expanded ? groups.map((group) => group[cycle * 2]) : [...groups.map((group) => group[cycle * 2]), groups[0][cycle * 2 + 1]]);
}
export function projectKnmQuestion(q: KnmQuestion) {
  return { id: q.id, lessonSlug: q.lessonSlug, themeId: q.themeId, objective: q.objective, prompt: q.prompt, options: q.options, ...(q.visual ? { visual: { kind: q.visual.kind, title: q.visual.title, lines: q.visual.lines, description: { nl: q.visual.description.nl, ar: q.visual.description.ar } } } : {}) };
}
