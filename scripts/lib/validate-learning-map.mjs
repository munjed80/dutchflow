/** Check curriculum links and enrichment contracts, not language proficiency. */
export function validateLearningMap(units, extensions, lessons, readings) {
  const errors = [];
  const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  const arabic = (value) => text(value) && /[\u0600-\u06ff]/u.test(value);
  const list = (value, predicate, minimum = 1) => Array.isArray(value) && value.length >= minimum && value.every(predicate);
  const unique = (values) => new Set(values).size === values.length;
  const lessonMap = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  const readingIds = new Set(readings.map((reading) => reading.slug));
  const assignedLessons = new Set(), assignedReadings = new Set(), unitIds = new Set();
  if (!Array.isArray(units) || !units.length) errors.push("Learning map: expected nonempty units");
  else for (const unit of units) {
    if (!record(unit)) { errors.push("Learning map: invalid unit"); continue; }
    if (!text(unit.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(unit.id) || unitIds.has(unit.id)) errors.push("Learning map: invalid or duplicate unit ID");
    unitIds.add(unit.id);
    if (!arabic(unit.title) || !list(unit.outcomes, arabic, 3) || !list(unit.remaining, arabic)) errors.push(`Learning map ${unit.id}: missing goals or remaining work`);
    if (!list(unit.lessonSlugs, (slug) => lessonMap.has(slug), 0) || !unique(unit.lessonSlugs)) errors.push(`Learning map ${unit.id}: invalid lesson links`);
    else for (const slug of unit.lessonSlugs) {
      if (assignedLessons.has(slug)) errors.push(`Learning map: duplicate lesson assignment ${slug}`);
      assignedLessons.add(slug);
    }
    if (!list(unit.readingSlugs, (slug) => readingIds.has(slug), 0) || !unique(unit.readingSlugs)) errors.push(`Learning map ${unit.id}: invalid reading links`);
    else unit.readingSlugs.forEach((slug) => assignedReadings.add(slug));
  }
  for (const slug of lessonMap.keys()) if (!assignedLessons.has(slug)) errors.push(`Learning map: unmapped lesson ${slug}`);
  for (const slug of readingIds) if (!assignedReadings.has(slug)) errors.push(`Learning map: unmapped reading ${slug}`);

  const enrichedLessons = new Set();
  if (!Array.isArray(extensions)) errors.push("Enrichment: expected array");
  else for (const extension of extensions) {
    if (!record(extension)) { errors.push("Enrichment: invalid object"); continue; }
    const lesson = lessonMap.get(extension.lessonSlug);
    if (!lesson || enrichedLessons.has(extension.lessonSlug)) errors.push("Enrichment: unknown or duplicate lesson");
    enrichedLessons.add(extension.lessonSlug);
    const phrases = new Set(lesson?.phrases.map((phrase) => phrase.id) ?? []);
    const terms = new Set();
    if (!list(extension.vocabulary, record, 6)) errors.push("Enrichment: at least six vocabulary entries required");
    else for (const word of extension.vocabulary) {
      if (!text(word.term) || !text(word.forms) || !arabic(word.meaning) || !["noun", "verb", "expression"].includes(word.kind)) errors.push("Enrichment: invalid vocabulary fields");
      const normalized = text(word.term) ? word.term.trim().toLowerCase() : "";
      if (terms.has(normalized)) errors.push("Enrichment: duplicate vocabulary term");
      terms.add(normalized);
      if (word.kind === "noun" && (!/^(de|het) \S/u.test(word.term) || !/^de \S/u.test(word.forms))) errors.push("Enrichment: noun requires article and plural");
      if (!phrases.has(word.phraseId)) errors.push("Enrichment: example must reference this lesson");
    }
    if (!list(extension.tasks, record, 2)) errors.push("Enrichment: at least two production tasks required");
    else for (const task of extension.tasks) {
      if (task.cue !== undefined && !text(task.cue)) errors.push("Enrichment: invalid production cue");
      if (!arabic(task.prompt) || !text(task.model) || task.model.length > 500 || !arabic(task.translation) || !list(task.checklist, arabic, 2)) errors.push("Enrichment: invalid production task");
    }
  }
  return errors;
}
