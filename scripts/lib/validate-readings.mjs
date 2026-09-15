export function validateReadings(readings, lessons) {
  if (!Array.isArray(readings) || !readings.length) return ["Readings must be a nonempty array"];
  const errors = [];
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  const arabic = (value) => text(value) && /[\u0600-\u06ff]/u.test(value);
  const slugs = new Set(), questionIds = new Set();
  const lessonSlugs = new Set(lessons.map((lesson) => lesson.slug));
  for (const [index, reading] of readings.entries()) {
    const prefix = `Reading ${index + 1}`;
    if (!reading || typeof reading !== "object") { errors.push(`${prefix}: invalid object`); continue; }
    if (!text(reading.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(reading.slug) || slugs.has(reading.slug)) errors.push(`${prefix}: invalid or duplicate slug`);
    slugs.add(reading.slug);
    for (const field of ["title", "topic", "translation"]) if (!arabic(reading[field])) errors.push(`${prefix}: missing Arabic ${field}`);
    if (!text(reading.dutchTitle)) errors.push(`${prefix}: missing Dutch title`);
    const passage = text(reading.text) ? reading.text : "";
    const words = passage.trim().split(/\s+/).filter(Boolean);
    if (words.length < 35 || words.length > 150) errors.push(`${prefix}: expected 35–150 words`);
    if (!Array.isArray(reading.sourceLessons) || !reading.sourceLessons.length || new Set(reading.sourceLessons).size !== reading.sourceLessons.length || reading.sourceLessons.some((slug) => !lessonSlugs.has(slug))) errors.push(`${prefix}: invalid lesson links`);
    if (!Array.isArray(reading.vocabulary) || reading.vocabulary.length < 5) errors.push(`${prefix}: at least five vocabulary notes required`);
    else {
      const terms = new Set();
      for (const word of reading.vocabulary) {
        if (!word || !text(word.term) || !text(word.excerpt) || !arabic(word.meaning)) { errors.push(`${prefix}: invalid vocabulary`); continue; }
        const term = word.term.trim().toLowerCase();
        if (terms.has(term)) errors.push(`${prefix}: duplicate vocabulary term`);
        terms.add(term);
        if (!passage.toLowerCase().includes(word.excerpt.toLowerCase())) errors.push(`${prefix}: vocabulary excerpt absent from passage`);
      }
    }
    const grammar = reading.grammar;
    if (!grammar || !arabic(grammar.title) || !arabic(grammar.explanation) || !arabic(grammar.translation) || !text(grammar.example) || !passage.includes(grammar.example)) errors.push(`${prefix}: invalid grammar or example absent from passage`);
    if (!Array.isArray(reading.questions) || reading.questions.length < 3) { errors.push(`${prefix}: at least three questions required`); continue; }
    for (const question of reading.questions) {
      if (!question || typeof question !== "object") { errors.push(`${prefix}: invalid question`); continue; }
      if (!text(question.id) || questionIds.has(question.id)) errors.push(`${prefix}: invalid or duplicate question id`);
      questionIds.add(question.id);
      if (!arabic(question.prompt) || !arabic(question.explanation)) errors.push(`${prefix}: missing question explanation/prompt`);
      if (!text(question.evidence) || !passage.includes(question.evidence)) errors.push(`${prefix}: answer evidence absent from passage`);
      if (!Array.isArray(question.options) || question.options.length !== 3 || !question.options.every(text)) errors.push(`${prefix}: invalid options`);
      else {
        if (new Set(question.options.map((option) => option.trim().toLowerCase())).size !== question.options.length) errors.push(`${prefix}: duplicate options`);
        if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length) errors.push(`${prefix}: invalid answer key`);
      }
    }
  }
  return errors;
}
