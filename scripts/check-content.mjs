import { audioSources } from "./lib/audio-sources.mjs";
import { validatePractice } from "./lib/validate-a1-practice.mjs";
import { planAudio } from "./lib/audio-assets.mjs";
import { validateScenarios } from "./lib/validate-scenarios.mjs";
import { readFile } from "node:fs/promises";
import { validatePlacement } from "./lib/validate-placement.mjs";
import { validateCurriculum } from "./lib/validate-curriculum.mjs";
import { validateReadings } from "./lib/validate-readings.mjs";
import { validateLearningMap } from "./lib/validate-learning-map.mjs";

const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const modules = JSON.parse(await readFile(new URL("../src/data/modules.json", import.meta.url), "utf8"));
const placement = JSON.parse(await readFile(new URL("../src/data/placement.json", import.meta.url), "utf8"));
const readings = JSON.parse(await readFile(new URL("../src/data/readings.json", import.meta.url), "utf8"));
const units = JSON.parse(await readFile(new URL("../src/data/a1-roadmap.json", import.meta.url), "utf8"));
const extensions = JSON.parse(await readFile(new URL("../src/data/lesson-extensions.json", import.meta.url), "utf8"));
const scenarios = JSON.parse(await readFile(new URL("../src/data/scenarios.json", import.meta.url), "utf8"));
const practice = JSON.parse(await readFile(new URL("../src/data/a1-practice.json", import.meta.url), "utf8"));
const pronunciation = JSON.parse(await readFile(new URL("../src/data/pronunciation.json", import.meta.url), "utf8"));
const errors = [...validatePractice(practice, units), ...validateCurriculum(lessons, modules), ...validatePlacement(placement, lessons), ...validateReadings(readings, lessons), ...validateLearningMap(units, extensions, lessons, readings), ...validateScenarios(scenarios, lessons, units)];

try { planAudio(audioSources(lessons, practice, pronunciation), JSON.parse(await readFile(new URL("../src/data/audio-pronunciation.json", import.meta.url), "utf8"))); } catch (error) { errors.push(error.message); }

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`A1 practice valid: ${practice.length} packs; ${pronunciation.length} sound drills.`);
  console.log(`Scenarios valid: ${scenarios.length} situations, ${scenarios.reduce((sum, scenario) => sum + scenario.turns.length, 0)} guided turns.`);
  console.log(`Learning map valid: ${units.length} units, ${extensions.length} enriched lessons.`);
  console.log(`Content valid: ${modules.length} modules, ${lessons.length} lessons, ${lessons.reduce((sum, lesson) => sum + lesson.phrases.length, 0)} phrases, ${lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0)} questions; ${placement.questions.length} placement questions; ${readings.length} readings, ${readings.reduce((sum, reading) => sum + reading.questions.length, 0)} reading questions.`);
}
