type Resource = { slug: string; title: string };
type Unit = { id: string; title: string; lessonSlugs: string[]; readingSlugs: string[] };
export type StudyUnit = {
  id: string; title: string; lessons: Resource[];
  readings: Resource[]; scenarios: Resource[]; recycling: Resource[];
};
export function buildStudyPath(
  units: Unit[], lessons: Resource[], readings: Resource[],
  scenarios: (Resource & { sourceLessons: string[] })[],
  recycling: (Resource & { anchors: { lessonSlug: string }[] })[],
): StudyUnit[] {
  const project = ({ slug, title }: Resource): Resource => ({ slug, title });
  const resolve = (bank: Resource[], slug: string): Resource => {
    const resource = bank.find((item) => item.slug === slug);
    if (!resource) throw new Error(`Missing study resource: ${slug}`);
    return project(resource);
  };
  return units.map((unit) => ({
    id: unit.id, title: unit.title,
    lessons: unit.lessonSlugs.map((slug) => resolve(lessons, slug)),
    readings: unit.readingSlugs.map((slug) => resolve(readings, slug)),
    scenarios: scenarios.filter((item) => item.sourceLessons.some((slug) => unit.lessonSlugs.includes(slug))).map(project),
    recycling: recycling.filter((item) => item.anchors.some((anchor) => unit.lessonSlugs.includes(anchor.lessonSlug))).map(project),
  }));
}
export function getStudyPosition(units: Pick<StudyUnit, "id" | "lessons">[], completed: string[]) {
  const known = new Set(completed);
  const completedUnits = units.filter((unit) => unit.lessons.length > 0 && unit.lessons.every((lesson) => known.has(lesson.slug))).map((unit) => unit.id);
  for (const unit of units) {
    const next = unit.lessons.find((lesson) => !known.has(lesson.slug));
    if (next) return { next: { unitId: unit.id, ...next }, completedUnitIds: completedUnits };
  }
  return { next: null, completedUnitIds: completedUnits };
}
