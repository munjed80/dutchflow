import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { planAudio, publishableManifest, readJson, validateCatalog, verifyAsset } from "./lib/audio-assets.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
if (process.argv.slice(2).some((arg) => arg !== "--require-complete")) throw new Error("Supported argument: --require-complete");
const jobs = planAudio(await readJson(join(root, "src/data/lessons.json")), await readJson(join(root, "src/data/audio-pronunciation.json")));
const catalog = await readJson(join(root, "src/lib/audio-catalog.json"));
validateCatalog(catalog);
const directory = join(root, "public/audio");
const manifest = await readJson(join(root, "src/lib/audio-manifest.json"));
const expected = await publishableManifest(jobs, catalog, directory);
const stable = (value) => JSON.stringify(value, (_, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a],[b]) => a.localeCompare(b))) : v);
const errors = [];
if (stable(manifest) !== stable(expected)) errors.push("Published manifest differs from approved current assets. Run audio:review to rebuild it; never ship stale, missing or unreviewed URLs.");
let generated = 0, approved = 0;
for (const job of jobs) {
  const valid = await verifyAsset(job, catalog, directory);
  if (valid) { generated++; if (catalog.assets[job.filename].reviewed) approved++; }
  else if (catalog.assets[job.filename]) errors.push(`Missing or corrupt catalog asset: ${job.filename}`);
}
const stale = Object.keys(catalog.assets).filter((filename) => !jobs.some((job) => job.filename === filename));
console.log(`Audio: ${generated}/${jobs.length} generated; ${approved}/${jobs.length} reviewed and publishable; ${stale.length} old variants (not publishable).`);
if (process.argv.includes("--require-complete") && approved !== jobs.length) errors.push("Recorded audio release is incomplete. Generate and listen to all required clips before approving them.");
for (const error of errors) console.error(error);
if (errors.length) process.exitCode = 1;
