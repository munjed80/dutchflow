/** Structural/content-reference checks, never CEFR or pronunciation certification. */
export function validatePractice(packs, units) {
  const errors = [];
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  const arabic = (value) => text(value) && /[\u0600-\u06ff]/u.test(value);
  const list = (value, check, min = 1) => Array.isArray(value) && value.length >= min && value.every(check);
  const safe = (value) => text(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  const ids = new Set(), audioIds = new Set(), questionIds = new Set();
  const unitIds = new Set(units.map((unit) => unit.id));
  if (!Array.isArray(packs) || !packs.length) return ["Practice: expected packs"];
  for (const pack of packs) {
    if (!pack || !safe(pack.slug) || ids.has(pack.slug)) { errors.push("Practice: invalid/duplicate slug"); continue; }
    ids.add(pack.slug);
    if (!arabic(pack.title) || !list(pack.unitIds, (id) => unitIds.has(id)) || new Set(pack.unitIds).size !== pack.unitIds.length) errors.push("Practice: title or unit links");
    for (const kind of ["reading", "listening"]) {
      const source = pack[kind];
      if (!source || !text(source.text) || !arabic(source.translation)) { errors.push("Practice: source/translation"); continue; }
      if (kind === "listening") {
        if (!safe(source.id) || audioIds.has(source.id) || source.text.split(/\s+/u).length > 65) errors.push("Practice: audio ID or passage length");
        audioIds.add(source.id);
      }
      if (!list(source.questions, (q) => q && typeof q === "object", 2)) { errors.push("Practice: questions required"); continue; }
      const prompts = new Set();
      for (const q of source.questions) {
        const prompt = typeof q.prompt === "string" ? q.prompt.normalize("NFC").trim().replace(/\s+/gu, " ") : "";
        if (prompt && prompts.has(prompt)) errors.push(`Practice: duplicate question prompt in ${pack.slug}/${kind}`);
        prompts.add(prompt);
        if (!safe(q.id) || questionIds.has(q.id)) errors.push("Practice: question ID");
        questionIds.add(q.id);
        if (!arabic(q.prompt) || !arabic(q.explanation) || !text(q.evidence) || !source.text.includes(q.evidence)) errors.push("Practice: question evidence or explanation");
        if (!list(q.options, text, 3) || new Set(q.options.map((v) => typeof v === "string" ? v.trim().toLowerCase() : v)).size !== q.options.length || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) errors.push("Practice: answer options/key");
      }
      if (source.table && (!text(source.table.caption) || !list(source.table.headers, text, 2) || !list(source.table.rows, (row) => list(row, text) && row.length === source.table.headers.length, 2))) errors.push("Practice: invalid table");
    }
    if (!list(pack.writing, (task) => task && arabic(task.prompt) && text(task.model) && task.model.length <= 500 && arabic(task.translation) && list(task.checklist, arabic, 2))) errors.push("Practice: production task");
    if (!list(pack.speaking, (task) => task && arabic(task.prompt) && text(task.model) && task.model.length <= 500 && arabic(task.translation) && list(task.checklist, arabic, 2))) errors.push("Practice: production task");
    if (!list(pack.speaking, (task) => list(task?.partnerPrompts, text, 3))) errors.push("Practice: partner prompts");
  }
  for (const unit of unitIds) if (!packs.some((pack) => pack?.slug === unit && pack.unitIds?.length === 1 && pack.unitIds[0] === unit)) errors.push(`Practice: missing unit pack ${unit}`);
  const final = packs.find((pack) => pack?.slug === "final-review");
  if (!final || final.unitIds?.length !== unitIds.size || !final.unitIds.every((id) => unitIds.has(id))) errors.push("Practice: missing cumulative review");
  return errors;
}
