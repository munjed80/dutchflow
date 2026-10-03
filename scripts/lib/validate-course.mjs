import { validateCurriculum } from "./validate-curriculum.mjs";
import { validateLearningMap } from "./validate-learning-map.mjs";
import { validateReadings } from "./validate-readings.mjs";
import { validateScenarios } from "./validate-scenarios.mjs";
import { validatePractice } from "./validate-a1-practice.mjs";
import { validateReviewLinks } from "./validate-review-links.mjs";
export function validateCourse(course, level) {
  const { lessons, modules, units, extensions, readings, scenarios, practice, reviewLinks } = course;
  return [
    ...lessons.filter((lesson) => lesson.level !== level).map(() => "Course: unexpected lesson level"),
    ...validateCurriculum(lessons, modules), ...validateLearningMap(units, extensions, lessons, readings),
    ...validateReadings(readings, lessons), ...validateScenarios(scenarios, lessons, units),
    ...validatePractice(practice, units, { requireCumulative: level === "A1" }),
    ...validateReviewLinks(reviewLinks, readings, practice, lessons),
  ];
}
