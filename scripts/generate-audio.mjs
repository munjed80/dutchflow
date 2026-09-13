import { readFile, mkdir, stat, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCurriculum } from "./lib/validate-curriculum.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const lessons = JSON.parse(await readFile(join(root, "src/data/lessons.json"), "utf8"));
const modules = JSON.parse(await readFile(join(root, "src/data/modules.json"), "utf8"));
const contentErrors = validateCurriculum(lessons, modules);
if (contentErrors.length) throw new Error(`Invalid curriculum:\n${contentErrors.join("\n")}`);
const outputDirectory = join(root, "public/audio");
const manifestPath = join(root, "src/lib/audio-manifest.json");
const dryRun = process.argv.includes("--dry-run");
const limitArgument = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArgument ? Number(limitArgument.split("=")[1]) : Infinity;

if (limitArgument && (!Number.isInteger(limit) || limit < 1)) {
  throw new Error("--limit must be a positive integer.");
}

const voices = {
  female: "nl-NL-ColetteNeural",
  male: "nl-NL-MaartenNeural",
};
const speeds = { normal: "0%", slow: "-25%" };
const phrases = lessons.flatMap((lesson) => lesson.phrases).slice(0, limit);
const ids = phrases.map((phrase) => phrase.id);

if (new Set(ids).size !== ids.length || ids.some((id) => !/^[a-z0-9-]+$/.test(id))) {
  throw new Error("Phrase IDs must be unique and use only lowercase letters, numbers, and hyphens.");
}

const jobs = phrases.flatMap((phrase) =>
  Object.entries(voices).flatMap(([voice, voiceName]) =>
    Object.entries(speeds).map(([speed, rate]) => ({ phrase, voice, voiceName, speed, rate })),
  ),
);

if (dryRun) {
  console.log(`Would process ${phrases.length} phrases and ${jobs.length} voice/speed files.`);
  process.exit(0);
}

const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;

if (!key || !region || !/^[a-z0-9-]+$/.test(region)) {
  throw new Error("Set AZURE_SPEECH_KEY and a valid AZURE_SPEECH_REGION before generating audio.");
}

const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
await mkdir(outputDirectory, { recursive: true });

function escapeXml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char]);
}

async function fileExists(path) {
  try {
    const file = await stat(path);
    return file.size > 0;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function generate(job) {
  const filename = `${job.phrase.id}-${job.voice}-${job.speed}.mp3`;
  const path = join(outputDirectory, filename);

  if (!(await fileExists(path))) {
    const ssml = `<speak version="1.0" xml:lang="nl-NL"><voice name="${job.voiceName}"><prosody rate="${job.rate}">${escapeXml(job.phrase.dutch)}</prosody></voice></speak>`;
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "DutchFlow-AudioGenerator",
        },
        body: ssml,
      });
      if (response.ok) break;
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
        throw new Error(`Speech service returned HTTP ${response.status} for ${filename}.`);
      }
      await sleep(1000 * 2 ** attempt);
    }
    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 100 || !response.headers.get("content-type")?.includes("audio")) {
      throw new Error(`Speech service did not return valid audio for ${filename}.`);
    }
    const temporaryPath = `${path}.tmp`;
    await writeFile(temporaryPath, audio);
    await rename(temporaryPath, path);
  }

  manifest[job.phrase.id] ??= {};
  manifest[job.phrase.id][job.voice] ??= {};
  manifest[job.phrase.id][job.voice][job.speed] = `/audio/${filename}`;
  console.log(`Ready: ${filename}`);
}

let cursor = 0;
const failures = [];

async function worker() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    try {
      await generate(job);
    } catch (error) {
      failures.push({ id: job.phrase.id, voice: job.voice, speed: job.speed, message: error.message });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(3, jobs.length) }, () => worker()));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (failures.length) {
  console.error(`${failures.length} files failed. Re-run the command to resume cached results.`);
  for (const failure of failures) console.error(`${failure.id}/${failure.voice}/${failure.speed}: ${failure.message}`);
  process.exitCode = 1;
} else {
  console.log(`Done: ${jobs.length} audio variants. Commit the generated MP3 files and manifest together.`);
}
