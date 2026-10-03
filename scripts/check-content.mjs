import { readFile } from "node:fs/promises";
import { readCourse } from "./lib/course-inventory.mjs";
import { validateCourse } from "./lib/validate-course.mjs";
import { validateCurriculum } from "./lib/validate-curriculum.mjs";
import { validateReadings } from "./lib/validate-readings.mjs";
import { validateScenarios } from "./lib/validate-scenarios.mjs";
import { validateReviewLinks } from "./lib/validate-review-links.mjs";
import { validatePlacement } from "./lib/validate-placement.mjs";
import { loadAudioInventory } from "./lib/audio-inventory.mjs";
import { planAudio } from "./lib/audio-assets.mjs";
const a1 = await readCourse("A1"), a2 = await readCourse("A2");
const lessons = [...a1.lessons, ...a2.lessons], readings = [...a1.readings, ...a2.readings];
const errors = [...validateCourse(a1, "A1"), ...validateCourse(a2, "A2"),
  ...validateCurriculum(lessons, [...a1.modules, ...a2.modules]),
  ...validateReadings(readings, lessons),
  ...validateScenarios([...a1.scenarios, ...a2.scenarios], lessons, [...a1.units, ...a2.units]),
  ...validateReviewLinks({ ...a1.reviewLinks, ...a2.reviewLinks }, readings, [...a1.practice, ...a2.practice], lessons),
  ...validatePlacement(JSON.parse(await readFile(new URL("../src/data/placement.json", import.meta.url), "utf8")), a1.lessons),
];
const questionIds = [...readings.flatMap((reading) => reading.questions), ...[...a1.practice, ...a2.practice].flatMap((pack) => [...pack.reading.questions, ...pack.listening.questions])].map((question) => question.id);
if (new Set(questionIds).size !== questionIds.length) errors.push("Course: duplicate comprehension question ID across levels/banks");
try { const { sources, overrides } = await loadAudioInventory(); planAudio(sources, overrides); } catch (error) { errors.push(error.message); }
if (errors.length) { for (const error of errors) console.error(error); process.exitCode = 1; }
else for (const [level, course] of [["A1", a1], ["A2", a2]]) console.log(`${level}: ${course.lessons.length} lessons, ${course.readings.length} readings, ${course.scenarios.length} scenarios and ${course.practice.length} integrated packs validated.`);
