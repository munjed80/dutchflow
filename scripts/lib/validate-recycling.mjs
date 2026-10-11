const text = (value) => typeof value === "string" && value.trim().length > 0;

export function validateRecycling(sets, units, extensions) {
  if (!Array.isArray(sets) || !sets.length) return ["Recycling: expected a nonempty set bank"];
  const errors = [], slugs = new Set();
  for (const set of sets) {
    const label = `Recycling ${set?.slug ?? "unknown"}`;
    if (!set || !text(set.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(set.slug) || slugs.has(set.slug)) errors.push(`${label}: invalid or duplicate slug`);
    slugs.add(set?.slug);
    if (!text(set?.title) || !text(set?.goal)) errors.push(`${label}: title and goal required`);
    const anchorUnits = new Set(), anchorLessons = new Set();
    if (!Array.isArray(set?.anchors) || set.anchors.length < 2) errors.push(`${label}: at least two anchors required`);
    else for (const anchor of set.anchors) {
      const extension = extensions.find((item) => item.lessonSlug === anchor?.lessonSlug);
      const unit = units.find((item) => item.lessonSlugs.includes(anchor?.lessonSlug));
      if (!unit || !extension || !extension.languageDepth?.collocations.some((item) => item.dutch === anchor?.chunk)) errors.push(`${label}: unknown lesson or collocation anchor`);
      if (anchorLessons.has(anchor?.lessonSlug)) errors.push(`${label}: duplicate lesson anchor`);
      anchorLessons.add(anchor?.lessonSlug);
      if (unit) anchorUnits.add(unit.id);
    }
    if (anchorUnits.size < 2) errors.push(`${label}: anchors must span different units`);
    if (!Array.isArray(set?.tasks) || set.tasks.length !== 2) errors.push(`${label}: one retrieval and one transformation task required`);
    else {
      if (set.tasks[0]?.cue !== undefined || !text(set.tasks[1]?.cue)) errors.push(`${label}: retrieval must have no cue; transformation needs a cue`);
      for (const task of set.tasks) {
        if (!task || ![task.prompt, task.model, task.translation].every(text) || task.model.length > 500) errors.push(`${label}: task text required and model must fit input limit`);
        if (!Array.isArray(task?.checklist) || task.checklist.length < 2 || !task.checklist.every(text)) errors.push(`${label}: meaningful self-review checklist required`);
      }
    }
  }
  return errors;
}
