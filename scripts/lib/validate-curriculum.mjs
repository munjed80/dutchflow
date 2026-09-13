/** Validate authored content before building the app or generating audio. */
export function validateCurriculum(lessons, modules) {
  const errors = [];
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const isText = (value) => typeof value === "string" && value.trim().length > 0;
  const requireText = (value, path) => {
    if (!isText(value)) errors.push(`${path}: must be non-empty text`);
  };
  const requireId = (value, path, seen) => {
    if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      errors.push(`${path}: must be a lowercase URL-safe ID`);
      return;
    }
    if (seen.has(value)) errors.push(`${path}: duplicate ID ${value}`);
    seen.add(value);
  };

  if (!Array.isArray(modules) || !modules.length) errors.push("modules: must be a non-empty array");
  if (!Array.isArray(lessons) || !lessons.length) errors.push("lessons: must be a non-empty array");
  if (errors.length) return errors;

  const moduleIds = new Set();
  modules.forEach((module, index) => {
    const path = `modules[${index}]`;
    if (!isRecord(module)) { errors.push(`${path}: must be an object`); return; }
    requireId(module.id, `${path}.id`, moduleIds);
    requireText(module.title, `${path}.title`);
    requireText(module.description, `${path}.description`);
  });

  const slugs = new Set();
  const phraseIds = new Set();
  const questionIds = new Set();
  let previousModuleIndex = -1;

  lessons.forEach((lesson, index) => {
    const path = `lessons[${index}]`;
    if (!isRecord(lesson)) { errors.push(`${path}: must be an object`); return; }
    requireId(lesson.slug, `${path}.slug`, slugs);
    for (const key of ["title", "dutchTitle", "description", "context", "goal"]) requireText(lesson[key], `${path}.${key}`);
    if (lesson.level !== "A1") errors.push(`${path}.level: this curriculum currently supports A1 only`);
    if (lesson.number !== String(index + 1).padStart(2, "0")) errors.push(`${path}.number: must follow the lesson order`);
    if (!Number.isInteger(lesson.durationMinutes) || lesson.durationMinutes < 1) errors.push(`${path}.durationMinutes: must be a positive integer`);
    if (!moduleIds.has(lesson.moduleId)) errors.push(`${path}.moduleId: unknown module`);
    const moduleIndex = modules.findIndex((module) => module?.id === lesson.moduleId);
    if (moduleIndex >= 0 && moduleIndex < previousModuleIndex) errors.push(`${path}.moduleId: lessons must follow module order`);
    previousModuleIndex = Math.max(previousModuleIndex, moduleIndex);

    if (!isRecord(lesson.grammar)) errors.push(`${path}.grammar: must be an object`);
    else for (const key of ["title", "explanation", "example", "translation"]) requireText(lesson.grammar[key], `${path}.grammar.${key}`);

    const localPhraseIds = new Set();
    if (!Array.isArray(lesson.phrases) || !lesson.phrases.length) errors.push(`${path}.phrases: must be a non-empty array`);
    else lesson.phrases.forEach((phrase, phraseIndex) => {
      const phrasePath = `${path}.phrases[${phraseIndex}]`;
      if (!isRecord(phrase)) { errors.push(`${phrasePath}: must be an object`); return; }
      requireId(phrase.id, `${phrasePath}.id`, phraseIds);
      localPhraseIds.add(phrase.id);
      for (const key of ["dutch", "arabic", "tip"]) requireText(phrase[key], `${phrasePath}.${key}`);
    });

    if (!Array.isArray(lesson.dialogue) || lesson.dialogue.length < 2) errors.push(`${path}.dialogue: must contain at least two turns`);
    else lesson.dialogue.forEach((turn, turnIndex) => {
      const turnPath = `${path}.dialogue[${turnIndex}]`;
      if (!isRecord(turn)) { errors.push(`${turnPath}: must be an object`); return; }
      requireText(turn.speaker, `${turnPath}.speaker`);
      if (!isText(turn.phraseId) || !localPhraseIds.has(turn.phraseId)) errors.push(`${turnPath}.phraseId: must reference a phrase in this lesson`);
    });

    if (!Array.isArray(lesson.questions) || !lesson.questions.length) errors.push(`${path}.questions: must be a non-empty array`);
    else lesson.questions.forEach((question, questionIndex) => {
      const questionPath = `${path}.questions[${questionIndex}]`;
      if (!isRecord(question)) { errors.push(`${questionPath}: must be an object`); return; }
      requireId(question.id, `${questionPath}.id`, questionIds);
      requireText(question.prompt, `${questionPath}.prompt`);
      requireText(question.explanation, `${questionPath}.explanation`);
      if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`${questionPath}.options: must contain at least two answers`);
      else {
        question.options.forEach((option, optionIndex) => requireText(option, `${questionPath}.options[${optionIndex}]`));
        const normalized = question.options.filter(isText).map((option) => option.trim().toLowerCase());
        if (new Set(normalized).size !== normalized.length) errors.push(`${questionPath}.options: duplicate answer choices`);
      }
      if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= (question.options?.length ?? 0)) {
        errors.push(`${questionPath}.correctIndex: must point to an existing answer`);
      }
    });
  });

  for (const moduleId of moduleIds) {
    if (!lessons.some((lesson) => lesson?.moduleId === moduleId)) errors.push(`modules.${moduleId}: contains no lessons`);
  }
  return errors;
}
