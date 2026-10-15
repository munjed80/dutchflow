/** Validate the authored preparation path against existing A2 resources. */
export function validateNewcomers(path, course) {
  if (!Array.isArray(path) || path.length !== 4) return ["Newcomers: expected four applications"];
  const errors = [], seen = new Set();
  const text = (v) => typeof v === "string" && v.trim().length > 0;
  const arabic = (v) => text(v) && /[\u0600-\u06ff]/u.test(v);
  for (const item of path) {
    const pack = course.practice.find((p) => p.slug === item?.slug);
    if (!item || seen.has(item.slug) || !pack || item.title !== pack.title) {
      errors.push("Newcomers: missing/duplicate pack or title mismatch"); continue;
    }
    seen.add(item.slug);
    if (!arabic(item.goal) || !Number.isInteger(item.minutes) || item.minutes < 15 || item.minutes > 90) errors.push("Newcomers: goal or duration");
    if (!Array.isArray(item.lessonSlugs) || item.lessonSlugs.length < 2 || new Set(item.lessonSlugs).size !== item.lessonSlugs.length || item.lessonSlugs.some((slug) => !course.lessons.some((l) => l.slug === slug && l.level === "A2" && pack.unitIds.some((id) => course.units.find((u) => u.id === id)?.lessonSlugs.includes(slug))))) errors.push("Newcomers: invalid preparation lesson links");
    if (!Array.isArray(item.vocabulary) || item.vocabulary.length !== 6 || new Set(item.vocabulary.map((v) => v?.dutch)).size !== 6 || item.vocabulary.some((v) => !text(v?.dutch) || !text(v?.forms) || !arabic(v?.arabic))) errors.push("Newcomers: bilingual vocabulary/forms");
    if (!Array.isArray(item.phrases) || item.phrases.length !== 3 || item.phrases.some((p) => !text(p?.dutch) || !arabic(p?.arabic))) errors.push("Newcomers: bilingual help phrases");
    if (pack.reading.questions.length !== 4 || pack.listening.questions.length !== 4 || pack.writing.length !== 2 || pack.speaking.length !== 2) errors.push("Newcomers: incomplete skill coverage");
  }
  for (const pack of course.practice.filter((p) => p.slug.startsWith("a2-newcomer-"))) if (!seen.has(pack.slug)) errors.push("Newcomers: unlisted application");
  return errors;
}
