import { loadAudioInventory } from "./lib/audio-inventory.mjs";
import { mkdir, open, unlink } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicJson, planAudio, publishableManifest, readJson, validateCatalog, verifyAsset } from "./lib/audio-assets.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { sources, overrides } = await loadAudioInventory();
const args = process.argv.slice(2);
if (args.length !== 1 || !/^--(approve|reject)=[a-z0-9-]+\.mp3$/.test(args[0])) throw new Error("After listening to a clip, use --approve=<filename.mp3> or --reject=<filename.mp3>. This is a human review declaration, not an automated quality score.");
const [action, filename] = args[0].slice(2).split("=");
const directory = join(root, "public/audio");
await mkdir(directory, { recursive: true });
const lockPath = join(directory, ".generation.lock");
const lock = await open(lockPath, "wx").catch(() => { throw new Error("Audio generation/review is locked; finish that process first."); });
try {
  const jobs = planAudio(sources, overrides);
  const catalogPath = join(root, "src/lib/audio-catalog.json");
  const catalog = await readJson(catalogPath);
  validateCatalog(catalog);
  const job = jobs.find((item) => item.filename === filename);
  if (action === "approve" && (!job || !(await verifyAsset(job, catalog, directory)))) throw new Error("Cannot approve missing, corrupted or stale audio. Regenerate the current phrase first.");
  if (!catalog.assets[filename]) throw new Error("Unknown audio file.");
  catalog.assets[filename].reviewed = action === "approve";
  await atomicJson(catalogPath, catalog);
  // Rebuild from all current, approved, hash-verified assets. Never retain stale URLs.
  await atomicJson(join(root, "src/lib/audio-manifest.json"), await publishableManifest(jobs, catalog, directory));
  console.log(`${action}: ${filename}. Published manifest rebuilt; commit approved MP3s, catalog, and manifest together.`);
} finally { await lock.close(); await unlink(lockPath); }
