import { readFile } from "node:fs/promises";
import { readCourse } from "./course-inventory.mjs";
import { validateCourse } from "./validate-course.mjs";
import { audioSources } from "./audio-sources.mjs";
/** Shared ordered inventory: preserve all A1 requests before appending A2. */
export async function loadAudioInventory() {
  const a1 = await readCourse("A1"), a2 = await readCourse("A2");
  const errors = [...validateCourse(a1, "A1"), ...validateCourse(a2, "A2")];
  if (errors.length) throw new Error(`Invalid curriculum:\n${errors.join("\n")}`);
  const read = async (name) => JSON.parse(await readFile(new URL(`../../src/data/${name}.json`, import.meta.url), "utf8"));
  const pronunciation = await read("pronunciation"), overrides = await read("audio-pronunciation");
  const a1Sources = audioSources(a1.lessons, a1.practice, pronunciation);
  const a2Sources = audioSources(a2.lessons, a2.practice, []);
  // Validate global identity, including between levels, with the same source contract.
  const sources = audioSources([...a1Sources, ...a2Sources], [], []);
  const levels = new Map([...a1Sources.flatMap((source) => source.phrases).map((phrase) => [phrase.id, "A1"]), ...a2Sources.flatMap((source) => source.phrases).map((phrase) => [phrase.id, "A2"])]);
  return { sources, overrides, levels };
}
export function audioLevel(args) {
  const flags = args.filter((arg) => arg.startsWith("--level="));
  if (flags.length > 1 || flags.some((arg) => !/^--level=A[12]$/.test(arg))) throw new Error("Use a single --level=A1 or --level=A2");
  return flags[0]?.slice(8);
}
