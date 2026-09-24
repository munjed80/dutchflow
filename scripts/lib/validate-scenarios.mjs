/** Validate authored contracts; a language educator must still review meaning and coherence. */
export function validateScenarios(scenarios, lessons, units) {
  if (!Array.isArray(scenarios) || !scenarios.length) return ["Scenarios: expected a nonempty array"];
  const errors = [], slugs = new Set(), turnIds = new Set();
  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  const arabic = (value) => text(value) && /[\u0600-\u06ff]/u.test(value);
  const dutch = (value) => text(value) && /[a-z]/iu.test(value);
  const id = (value) => text(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  const unique = (values) => new Set(values).size === values.length;
  const lessonIds = new Set(lessons.map((lesson) => lesson.slug));
  for (const scenario of scenarios) {
    if (!object(scenario)) { errors.push("Scenario: invalid object"); continue; }
    if (!id(scenario.slug) || slugs.has(scenario.slug)) errors.push("Scenario: invalid or duplicate slug");
    slugs.add(scenario.slug);
    if (![scenario.title, scenario.role, scenario.partner, scenario.mission].every(arabic) || !dutch(scenario.dutchTitle)) errors.push("Scenario: missing instructions or languages");
    const unit = units.find((item) => item.id === scenario.unitId);
    const sources = scenario.sourceLessons;
    if (!unit || !Array.isArray(sources) || !sources.length || !unique(sources) || sources.some((slug) => !lessonIds.has(slug)) || !sources.some((slug) => unit.lessonSlugs.includes(slug))) errors.push("Scenario: invalid unit or lesson links");
    if (!Array.isArray(scenario.turns) || scenario.turns.length < 3 || scenario.turns.length > 8) errors.push("Scenario: expected 3–8 turns");
    else for (const turn of scenario.turns) {
      if (!object(turn)) { errors.push("Scenario: invalid turn"); continue; }
      if (!id(turn.id) || turnIds.has(turn.id)) errors.push("Scenario: invalid or duplicate turn ID");
      turnIds.add(turn.id);
      if (![turn.goal, turn.translation, turn.responseTranslation].every(arabic) || ![turn.prompt, turn.response].every(dutch)) errors.push("Scenario: missing turn text or translation");
      if (!Array.isArray(turn.choices) || turn.choices.length !== 3 || turn.choices.some((option) => !object(option) || !dutch(option.text) || !arabic(option.translation) || !arabic(option.feedback))) errors.push("Scenario: invalid choices or feedback");
      else if (!unique(turn.choices.map((option) => option.text.trim().replace(/\s+/g, " ").toLowerCase()))) errors.push("Scenario: duplicate choices");
      if (!Number.isInteger(turn.correctIndex) || turn.correctIndex < 0 || turn.correctIndex >= (turn.choices?.length ?? 0)) errors.push("Scenario: invalid answer key");
    }
    const task = scenario.transfer;
    if (!object(task) || !arabic(task.prompt) || !dutch(task.model) || task.model.length > 500 || !arabic(task.translation) || !Array.isArray(task.checklist) || task.checklist.length < 2 || !task.checklist.every(arabic) || (task.cue !== undefined && !dutch(task.cue))) errors.push("Scenario: invalid transfer task");
  }
  return errors;
}
