import { readFile } from "node:fs/promises";
export async function readCourse(level) {
  const names = level === "A1" ? ["lessons", "modules", "a1-roadmap", "lesson-extensions", "readings", "scenarios", "a1-practice", "a1-review-links"] : ["a2-lessons", "a2-modules", "a2-roadmap", "a2-lesson-extensions", "a2-readings", "a2-scenarios", "a2-practice", "a2-review-links"];
  if (!["A1", "A2"].includes(level)) throw new Error("Unsupported course level");
  const records = await Promise.all(names.map(async (name) => JSON.parse(await readFile(new URL(`../../src/data/${name}.json`, import.meta.url), "utf8"))));
  return Object.fromEntries(["lessons", "modules", "units", "extensions", "readings", "scenarios", "practice", "reviewLinks"].map((key, index) => [key, records[index]]));
}
