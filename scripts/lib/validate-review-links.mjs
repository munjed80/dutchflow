/** Validate authored remediation links; relevance still requires editorial review. */
export function validateReviewLinks(links, readings, packs, lessons) {
  if (!links || typeof links !== "object" || Array.isArray(links)) return ["Review links: expected an object"];
  const errors = [];
  const questions = [
    ...readings.flatMap((reading) => reading.questions),
    ...packs.flatMap((pack) => [...pack.reading.questions, ...pack.listening.questions]),
  ];
  const ids = new Set(questions.map((question) => question.id));
  const slugs = new Set(lessons.map((lesson) => lesson.slug));
  for (const id of ids) {
    const targets = Object.hasOwn(links, id) ? links[id] : undefined;
    if (!Array.isArray(targets) || targets.length < 1 || targets.length > 2 || targets.some((slug) => !slugs.has(slug)) || new Set(targets).size !== targets.length) {
      errors.push(`Review links: ${id} requires one or two unique published lessons`);
    }
  }
  for (const id of Object.keys(links)) if (!ids.has(id)) errors.push(`Review links: unknown question ${id}`);
  return errors;
}
