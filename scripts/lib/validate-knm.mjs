export function validateKnm(curriculum, lessons, bank) {
  const errors = []; const add = (message) => errors.push(`KNM: ${message}`);
  if (!curriculum || !Array.isArray(curriculum.themes) || !Array.isArray(curriculum.objectives) || !Array.isArray(curriculum.sources) || !Array.isArray(curriculum.exams) || !Array.isArray(lessons) || !Array.isArray(bank?.questions)) return ["KNM: invalid content shape"];
  if (curriculum.effectiveFrom !== "2025-07-01" || bank.revision !== curriculum.revision) add("invalid curriculum revision");
  if (curriculum.themes.length !== 8 || curriculum.objectives.length !== 78 || lessons.length !== 32 || bank.questions.length < 250) add("incomplete authored inventory");
  const themeIds = curriculum.themes.map((t) => t.id), slugs = lessons.map((l) => l.slug), ids = bank.questions.map((q) => q.id), sourceIds = curriculum.sources.map((s) => s.id), objectives = curriculum.objectives.map((o) => o.id);
  for (const [label, values] of [["theme", themeIds], ["lesson", slugs], ["question", ids], ["source", sourceIds], ["objective", objectives]]) if (new Set(values).size !== values.length) add(`duplicate ${label}`);
  const bilingual = (value) => value && typeof value.nl === "string" && value.nl.trim().length > 2 && typeof value.ar === "string" && /[\u0600-\u06ff]/.test(value.ar);
  for (const source of curriculum.sources) {
    try { const u = new URL(source.url); if (u.protocol !== "https:" || !["zoek.officielebekendmakingen.nl", "www.inburgeren.nl", "cito.nl", "www.rijksoverheid.nl", "www.donorregister.nl", "www.zorginstituutnederland.nl", "ondernemersplein.kvk.nl", "www.kvk.nl"].includes(u.hostname)) add("unapproved source URL"); } catch { add("invalid source URL"); }
    if (source.checkedAt !== curriculum.reviewedAt) add("missing source review date");
  }
  for (const [index, lesson] of lessons.entries()) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.slug) || !themeIds.includes(lesson.themeId) || lesson.number !== index + 1 || !bilingual(lesson.title)) add(`invalid lesson ${lesson.slug}`);
    if (!Array.isArray(lesson.points) || lesson.points.length < 8 || lesson.points.some((p) => !bilingual(p) || !objectives.includes(p.objective) || !lesson.objectives.includes(p.objective))) add(`invalid knowledge points ${lesson.slug}`);
    if (lesson.vocabulary?.length < 6 || lesson.vocabulary.some((v) => !bilingual(v)) || !bilingual(lesson.example)) add(`missing enrichment ${lesson.slug}`);
    if (!Array.isArray(lesson.sourceIds) || !lesson.sourceIds.includes("endterms") || lesson.sourceIds.some((id) => !sourceIds.includes(id))) add(`invalid source links ${lesson.slug}`);
    if (lesson.questionIds?.length < 8 || new Set(lesson.questionIds).size !== lesson.questionIds.length || lesson.questionIds.some((id) => !bank.questions.some((q) => q.id === id && q.lessonSlug === lesson.slug))) add(`invalid question links ${lesson.slug}`);
  }
  const prompts = new Set();
  for (const q of bank.questions) {
    const lesson = lessons.find((l) => l.slug === q.lessonSlug);
    if (!lesson || lesson.themeId !== q.themeId || !lesson.questionIds.includes(q.id) || !lesson.objectives.includes(q.objective)) add(`unknown question reference ${q.id}`);
    if (!bilingual(q.prompt) || !bilingual(q.explanation)) add(`missing bilingual question ${q.id}`);
    if (prompts.has(q.prompt?.nl)) add(`duplicate prompt ${q.id}`); prompts.add(q.prompt?.nl);
    if (!Array.isArray(q.options) || q.options.length !== 3 || q.options.some((o) => typeof o !== "string" || !o.trim()) || new Set(q.options).size !== 3) add(`invalid options ${q.id}`);
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 2) add(`invalid answer key ${q.id}`);
  }
  for (const objective of curriculum.objectives) {
    if (!themeIds.includes(objective.themeId) || !objective.lessonSlugs?.length || objective.lessonSlugs.some((s) => !lessons.some((l) => l.slug === s && l.objectives.includes(objective.id))) || !bank.questions.some((q) => q.objective === objective.id)) add(`unmapped objective ${objective.id}`);
  }
  if (curriculum.exams.length !== 4 || curriculum.exams.some((e) => e.minutes !== 45 || e.questionCount !== 40)) add("invalid practice exam configuration");
  return errors;
}
