export function validateKnm(curriculum, lessons, bank) {
  const errors = []; const add = (message) => errors.push(`KNM: ${message}`);
  if (!curriculum || !Array.isArray(curriculum.themes) || !Array.isArray(curriculum.objectives) || !Array.isArray(curriculum.sources) || !Array.isArray(curriculum.exams) || !Array.isArray(lessons) || !Array.isArray(bank?.questions)) return ["KNM: invalid content shape"];
  if (curriculum.effectiveFrom !== "2025-07-01" || bank.revision !== curriculum.revision) add("invalid curriculum revision");
  if (curriculum.themes.length !== 8 || curriculum.objectives.length !== 78 || lessons.length < 48 || bank.questions.length < 449) add("incomplete authored inventory");
  const themeIds = curriculum.themes.map((t) => t.id), slugs = lessons.map((l) => l.slug), ids = bank.questions.map((q) => q.id), sourceIds = curriculum.sources.map((s) => s.id), objectives = curriculum.objectives.map((o) => o.id);
  for (const [label, values] of [["theme", themeIds], ["lesson", slugs], ["question", ids], ["source", sourceIds], ["objective", objectives]]) if (new Set(values).size !== values.length) add(`duplicate ${label}`);
  const bilingual = (value) => value && typeof value.nl === "string" && value.nl.trim().length > 2 && typeof value.ar === "string" && /[\u0600-\u06ff]/.test(value.ar);
  const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(curriculum.reviewedAt)) add("invalid latest source review date");
  for (const source of curriculum.sources) {
    try { const u = new URL(source.url); if (u.protocol !== "https:" || !["zoek.officielebekendmakingen.nl", "www.inburgeren.nl", "cito.nl", "www.rijksoverheid.nl", "www.donorregister.nl", "www.zorginstituutnederland.nl", "ondernemersplein.kvk.nl", "www.kvk.nl", "www.autoriteitpersoonsgegevens.nl", "www.digid.nl", "www.kiesraad.nl", "www.onderwijsinspectie.nl", "www.arboportaal.nl", "www.nederlandwereldwijd.nl", "idw.nl", "www.4en5mei.nl", "www.nationaalarchief.nl", "rijksvaccinatieprogramma.nl", "www.rivm.nl", "www.belastingdienst.nl", "www.rechtspraak.nl", "duo.nl", "www.duo.nl"].includes(u.hostname)) add("unapproved source URL"); } catch { add("invalid source URL"); }
    if (!validDate(source.checkedAt) || source.checkedAt > curriculum.reviewedAt) add("invalid source review date");
  }
  for (const [index, lesson] of lessons.entries()) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.slug) || !themeIds.includes(lesson.themeId) || lesson.number !== index + 1 || !bilingual(lesson.title)) add(`invalid lesson ${lesson.slug}`);
    if (!Array.isArray(lesson.points) || lesson.points.length < 8 || lesson.points.some((p) => !bilingual(p) || !objectives.includes(p.objective) || !lesson.objectives.includes(p.objective))) add(`invalid knowledge points ${lesson.slug}`);
    if (lesson.vocabulary?.length < 6 || lesson.vocabulary.some((v) => !bilingual(v)) || !bilingual(lesson.example)) add(`missing enrichment ${lesson.slug}`);
    if (!Array.isArray(lesson.sourceIds) || !lesson.sourceIds.includes("endterms") || lesson.sourceIds.some((id) => !sourceIds.includes(id))) add(`invalid source links ${lesson.slug}`);
    if (lesson.questionIds?.length < 8 || new Set(lesson.questionIds).size !== lesson.questionIds.length || lesson.questionIds.some((id) => !bank.questions.some((q) => q.id === id && q.lessonSlug === lesson.slug))) add(`invalid question links ${lesson.slug}`);
  }
  if (!Array.isArray(curriculum.examLessonSlugs) || curriculum.examLessonSlugs.length !== 32 || new Set(curriculum.examLessonSlugs).size !== 32 || curriculum.examLessonSlugs.some((slug) => !slugs.includes(slug)) || themeIds.some((id) => lessons.filter((lesson) => lesson.themeId === id && curriculum.examLessonSlugs.includes(lesson.slug)).length !== 4)) add("invalid core exam lesson selection");
  if (!Array.isArray(curriculum.applicationExamLessonSlugs) || curriculum.applicationExamLessonSlugs.length !== 40 || new Set(curriculum.applicationExamLessonSlugs).size !== 40 || curriculum.applicationExamLessonSlugs.some((slug) => !slugs.includes(slug)) || themeIds.some((id) => lessons.filter((lesson) => lesson.themeId === id && curriculum.applicationExamLessonSlugs.includes(lesson.slug)).length !== 5)) add("invalid comprehensive exam lesson selection");
  if (!Array.isArray(curriculum.extendedExamLessonSlugs) || curriculum.extendedExamLessonSlugs.length !== 48 || new Set(curriculum.extendedExamLessonSlugs).size !== 48 || curriculum.extendedExamLessonSlugs.some((slug) => !slugs.includes(slug)) || themeIds.some((id) => lessons.filter((lesson) => lesson.themeId === id && curriculum.extendedExamLessonSlugs.includes(lesson.slug)).length !== 6)) add("invalid extended exam lesson selection");
  if (themeIds.some((id) => lessons.filter((lesson) => lesson.themeId === id).length < 6)) add("missing expanded theme coverage");
  for (const lesson of lessons) {
    if (lesson.kind && lesson.kind !== "application") add(`unknown lesson kind ${lesson.slug}`);
    if (lesson.kind === "application" && (lesson.points?.length < 12 || lesson.questionIds?.length < 12 || lesson.vocabulary?.length < 8 || lesson.dialogue?.length < 4)) add(`missing application depth ${lesson.slug}`);
    if (lesson.dialogue && (!Array.isArray(lesson.dialogue) || lesson.dialogue.some((turn) => !bilingual(turn) || typeof turn.speaker !== "string" || !turn.speaker.trim()))) add(`invalid dialogue ${lesson.slug}`);
  }
  const prompts = new Set();
  for (const q of bank.questions) {
    const lesson = lessons.find((l) => l.slug === q.lessonSlug);
    if (!lesson || lesson.themeId !== q.themeId || !lesson.questionIds.includes(q.id) || !lesson.objectives.includes(q.objective)) add(`unknown question reference ${q.id}`);
    if (!bilingual(q.prompt) || !bilingual(q.explanation)) add(`missing bilingual question ${q.id}`);
    if (prompts.has(q.prompt?.nl)) add(`duplicate prompt ${q.id}`); prompts.add(q.prompt?.nl);
    if (!Array.isArray(q.options) || q.options.length !== 3 || q.options.some((o) => typeof o !== "string" || !o.trim()) || new Set(q.options).size !== 3) add(`invalid options ${q.id}`);
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 2) add(`invalid answer key ${q.id}`);
    if (q.visual && (!["document", "calendar", "home", "care", "water", "message", "government", "school"].includes(q.visual.kind) || typeof q.visual.title !== "string" || !q.visual.title.trim() || !Array.isArray(q.visual.lines) || q.visual.lines.length < 1 || q.visual.lines.length > 4 || q.visual.lines.some((line) => typeof line !== "string" || !line.trim()) || !bilingual(q.visual.description))) add(`invalid visual context ${q.id}`);
  }
  for (const objective of curriculum.objectives) {
    if (!themeIds.includes(objective.themeId) || !objective.lessonSlugs?.length || objective.lessonSlugs.some((s) => !lessons.some((l) => l.slug === s && l.objectives.includes(objective.id))) || !bank.questions.some((q) => q.objective === objective.id)) add(`unmapped objective ${objective.id}`);
  }
  if (curriculum.exams.length !== 12 || curriculum.exams.some((e) => e.minutes !== 45 || e.questionCount !== 40)) add("invalid practice exam configuration");
  return errors;
}
