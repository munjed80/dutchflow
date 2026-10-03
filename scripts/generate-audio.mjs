import { loadAudioInventory, audioLevel } from "./lib/audio-inventory.mjs";
import { mkdir, writeFile, rename, open, unlink } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicJson, planAudio, readJson, sha256, synthesize, validateCatalog, verifyAsset } from "./lib/audio-assets.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--dry-run" && !/^--limit=\d+$/.test(arg) && !arg.startsWith("--level="))) throw new Error("Supported arguments: --dry-run --limit=<positive phrase count> --level=A1|A2");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
if (limitArg && (!Number.isSafeInteger(limit) || limit < 1)) throw new Error("--limit must be a positive integer.");
const { sources, overrides, levels } = await loadAudioInventory();
const level = audioLevel(args);
const allJobs = planAudio(sources, overrides).filter((job) => !level || levels.get(job.phraseId) === level);
const jobs = allJobs.slice(0, limit === Infinity ? undefined : limit * 4);
const directory = join(root, "public/audio");
const catalogPath = join(root, "src/lib/audio-catalog.json");
const catalog = await readJson(catalogPath, { version: 1, assets: {} });
validateCatalog(catalog);
let cached = 0;
for (const job of jobs) if (await verifyAsset(job, catalog, directory)) cached++;
console.log(`Plan: ${jobs.length / 4} phrases, ${jobs.length} variants; ${cached} valid cached files, ${jobs.length - cached} to generate.`);
console.log(`Selected curriculum (${level ?? "all levels"}): ${allJobs.length / 4} phrases, ${allJobs.length} variants. Estimated MP3 storage at 48 kbit/s and 5 seconds/clip: ${(allJobs.length * 30000 / 1024 / 1024).toFixed(1)} MiB (actual duration varies).`);
if (!args.includes("--dry-run")) {
  const key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region || !/^[a-z0-9-]+$/.test(region)) throw new Error("Set AZURE_SPEECH_KEY and a valid AZURE_SPEECH_REGION in your local environment. Never paste or commit credentials.");
  await mkdir(directory, { recursive: true });
  const lockPath = join(directory, ".generation.lock");
  const lock = await open(lockPath, "wx").catch(() => { throw new Error("Audio generation/review is already locked. If a prior process crashed, verify it stopped before removing public/audio/.generation.lock."); });
  // Sequential checkpoints avoid losing successful paid requests after interruption.
  let failed = 0;
  try {
    // Reload after obtaining the lock; another process may have completed meanwhile.
    const current = await readJson(catalogPath, { version: 1, assets: {} });
    validateCatalog(current);
    for (const job of jobs) {
      if (await verifyAsset(job, current, directory)) continue;
      try {
        const bytes = await synthesize(job, { key, region });
        const path = join(directory, job.filename);
        await writeFile(`${path}.tmp`, bytes);
        await rename(`${path}.tmp`, path);
        current.assets[job.filename] = { phraseId: job.phraseId, voice: job.voice, speed: job.speed, sourceHash: job.sourceHash, audioHash: sha256(bytes), bytes: bytes.length, reviewed: false };
        await atomicJson(catalogPath, current);
        console.log(`Generated, awaiting listening review: ${job.filename}`);
      } catch (error) {
        failed++; console.error(error.message);
        // Stop on authentication/configuration failures instead of repeating every request.
        if (/HTTP (400|401|403|404)/.test(error.message)) break;
      }
    }
  } finally { await lock.close(); await unlink(lockPath); }
  if (failed) process.exitCode = 1;
  else console.log("Generation complete. Review each clip, approve it with audio:review, then run audio:check -- --require-complete before releasing recorded-only audio.");
}
