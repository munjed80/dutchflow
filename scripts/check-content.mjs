import { readFile } from "node:fs/promises";
import { validateCurriculum } from "./lib/validate-curriculum.mjs";

const lessons = JSON.parse(await readFile(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const modules = JSON.parse(await readFile(new URL("../src/data/modules.json", import.meta.url), "utf8"));
const errors = validateCurriculum(lessons, modules);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Content valid: ${modules.length} modules, ${lessons.length} lessons, ${lessons.reduce((sum, lesson) => sum + lesson.phrases.length, 0)} phrases, ${lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0)} questions.`);
}
