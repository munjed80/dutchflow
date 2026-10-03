import { loadAudioInventory, audioLevel } from "./lib/audio-inventory.mjs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { planAudio, publishableManifest, readJson, validateCatalog, verifyAsset } from "./lib/audio-assets.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const { sources, overrides, levels } = await loadAudioInventory();
if (process.argv.slice(2).some((arg) => arg !== "--require-complete" && !arg.startsWith("--level="))) throw new Error("Supported arguments: --require-complete --level=A1|A2");
const level = audioLevel(process.argv.slice(2));
const jobs = planAudio(sources, overrides);
const catalog = await readJson(join(root, "src/lib/audio-catalog.json"));
validateCatalog(catalog);
const directory = join(root, "public/audio");
const manifest = await readJson(join(root, "src/lib/audio-manifest.json"));
const expected = await publishableManifest(jobs, catalog, directory);
const stable = (value) => JSON.stringify(value, (_, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a],[b]) => a.localeCompare(b))) : v);
const errors = [];
if (stable(manifest) !== stable(expected)) errors.push("Published manifest differs from approved current assets. Run audio:review to rebuild it; never ship stale, missing or unreviewed URLs.");
const selectedJobs = jobs.filter((job) => !level || levels.get(job.phraseId) === level);
let generated = 0, approved = 0;
for (const job of jobs) {
  const valid = await verifyAsset(job, catalog, directory);
  if (valid) { if (!level || levels.get(job.phraseId) === level) { generated++; if (catalog.assets[job.filename].reviewed) approved++; } }
  else if (catalog.assets[job.filename]) errors.push(`Missing or corrupt catalog asset: ${job.filename}`);
}
const stale = Object.keys(catalog.assets).filter((filename) => !jobs.some((job) => job.filename === filename));
console.log(`Audio (${level ?? "all levels"}): ${generated}/${selectedJobs.length} generated; ${approved}/${selectedJobs.length} reviewed and publishable; ${stale.length} old variants (not publishable).`);
if (process.argv.includes("--require-complete") && approved !== selectedJobs.length) errors.push("Recorded audio release is incomplete. Generate and listen to all required clips before approving them.");
for (const error of errors) console.error(error);
if (errors.length) process.exitCode = 1;
