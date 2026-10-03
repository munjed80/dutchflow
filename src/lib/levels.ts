export const courseLevels = ["A1", "A2"] as const;
export type CourseLevel = typeof courseLevels[number];
export function parseLevel(value: unknown): CourseLevel { return value === "A2" ? "A2" : "A1"; }
export function levelHref(path: string, level: CourseLevel) { return level === "A1" ? path : `${path}?level=A2`; }
export function curriculumHref(level: CourseLevel) { return level === "A1" ? "/curriculum" : "/a2"; }
export function practiceHref(level: CourseLevel) { return level === "A1" ? "/a1-practice" : "/a2-practice"; }
