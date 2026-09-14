export function validatePlacement(bank, lessons) {
  const errors = [];
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  if (!bank || typeof bank !== "object" || Array.isArray(bank)) return ["Placement bank must be an object"];
  if (!text(bank.revision)) errors.push("Placement revision is required");
  if (!Array.isArray(bank.skills) || !bank.skills.length || !Array.isArray(bank.questions) || bank.questions.length !== 16) return [...errors, "Placement requires skills and 16 questions"];
  const skills = new Set();
  for (const skill of bank.skills) {
    if (!skill || !text(skill.id) || !text(skill.title) || skills.has(skill.id)) errors.push("Invalid or duplicate placement skill");
    else skills.add(skill.id);
  }
  const slugs = new Set(lessons.map((lesson) => lesson.slug));
  const ids = new Set();
  for (const [index, question] of bank.questions.entries()) {
    const prefix = `Placement question ${index + 1}`;
    if (!question || typeof question !== "object") { errors.push(`${prefix}: invalid question`); continue; }
    if (!text(question.id) || ids.has(question.id)) errors.push(`${prefix}: invalid or duplicate id`);
    ids.add(question.id);
    if (!skills.has(question.skill)) errors.push(`${prefix}: unknown skill`);
    for (const field of ["prompt", "explanation"]) if (!text(question[field])) errors.push(`${prefix}: missing ${field}`);
    if (question.passage !== undefined && !text(question.passage)) errors.push(`${prefix}: invalid passage`);
    if (!["ar", "nl"].includes(question.optionLanguage)) errors.push(`${prefix}: invalid option language`);
    if (!slugs.has(question.lessonSlug)) errors.push(`${prefix}: unknown lesson`);
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 4 || !question.options.every(text)) errors.push(`${prefix}: invalid options`);
    else {
      if (new Set(question.options.map((option) => option.trim().toLowerCase())).size !== question.options.length) errors.push(`${prefix}: duplicate options`);
      if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length) errors.push(`${prefix}: invalid answer key`);
    }
  }
  for (const skill of skills) if (!bank.questions.some((question) => question?.skill === skill)) errors.push(`Placement skill ${skill} has no questions`);
  return errors;
}
