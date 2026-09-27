import { createHash } from "node:crypto";
import { readFile, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";

export const voices = { female: "nl-NL-ColetteNeural", male: "nl-NL-MaartenNeural" };
export const speeds = { normal: "0%", slow: "-25%" };
export const format = "audio-24khz-48kbitrate-mono-mp3";
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const escapeXml = (text) => text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);

// Hash the exact synthesis request, including pronunciation markup and output settings.
export function planAudio(lessons, overrides = {}) {
  const phrases = lessons.flatMap((lesson) => lesson.phrases);
  const ids = new Set(phrases.map((phrase) => phrase.id));
  for (const [id, segments] of Object.entries(overrides)) {
    if (!ids.has(id) || !Array.isArray(segments) || !segments.length || segments.some((s) => !s || typeof s.text !== "string" || !s.text || (s.interpretAs !== undefined && s.interpretAs !== "characters"))) throw new Error(`Invalid pronunciation override: ${id}`);
    if (segments.map((s) => s.text).join("") !== phrases.find((p) => p.id === id).dutch) throw new Error(`Pronunciation override differs from current phrase: ${id}`);
  }
  return phrases.flatMap((phrase) => Object.entries(voices).flatMap(([voice, name]) => Object.entries(speeds).map(([speed, rate]) => {
    const content = overrides[phrase.id]?.map((s) => s.interpretAs ? `<say-as interpret-as="characters">${escapeXml(s.text)}</say-as>` : escapeXml(s.text)).join("") ?? escapeXml(phrase.dutch);
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="nl-NL"><voice name="${name}"><prosody rate="${rate}">${content}</prosody></voice></speak>`;
    const sourceHash = sha256(`${format}\n${ssml}`);
    return { phraseId: phrase.id, voice, speed, ssml, sourceHash, filename: `${phrase.id}-${voice}-${speed}-${sourceHash.slice(0, 16)}.mp3` };
  })));
}

export function isMp3(bytes) {
  return bytes.length >= 100 && (bytes.subarray(0, 3).toString() === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0));
}

export async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) { if (error.code === "ENOENT" && fallback !== undefined) return fallback; throw error; }
}

export async function atomicJson(path, value) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}

export function validateCatalog(catalog) {
  if (!catalog || catalog.version !== 1 || !catalog.assets || typeof catalog.assets !== "object" || Array.isArray(catalog.assets)) throw new Error("Invalid audio catalog; do not overwrite it. Restore or repair it first.");
  for (const [filename, asset] of Object.entries(catalog.assets)) {
    if (!/^[a-z0-9-]+\.mp3$/.test(filename) || !asset || !/^[a-z0-9-]+$/.test(asset.phraseId) || !Object.hasOwn(voices, asset.voice) || !Object.hasOwn(speeds, asset.speed) || !/^[a-f0-9]{64}$/.test(asset.sourceHash) || !/^[a-f0-9]{64}$/.test(asset.audioHash) || !Number.isInteger(asset.bytes) || asset.bytes < 100 || typeof asset.reviewed !== "boolean") throw new Error(`Invalid catalog entry: ${filename}`);
  }
}

export async function verifyAsset(job, catalog, directory) {
  const asset = catalog.assets[job.filename];
  if (!asset || asset.phraseId !== job.phraseId || asset.voice !== job.voice || asset.speed !== job.speed || asset.sourceHash !== job.sourceHash) return false;
  try {
    const bytes = await readFile(join(directory, job.filename));
    return bytes.length === asset.bytes && isMp3(bytes) && sha256(bytes) === asset.audioHash;
  } catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

export async function publishableManifest(jobs, catalog, directory) {
  const manifest = {};
  for (const job of jobs) {
    if (!catalog.assets[job.filename]?.reviewed || !(await verifyAsset(job, catalog, directory))) continue;
    manifest[job.phraseId] ??= {};
    manifest[job.phraseId][job.voice] ??= {};
    manifest[job.phraseId][job.voice][job.speed] = `/audio/${job.filename}`;
  }
  return manifest;
}

export async function synthesize(job, { key, region, fetcher = fetch, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let response;
    try {
      response = await fetcher(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: "POST", signal: AbortSignal.timeout(30000),
        headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": format, "User-Agent": "DutchFlow-AudioGenerator" }, body: job.ssml,
      });
    } catch {
      if (attempt === 2) throw new Error(`Speech request timed out or failed for ${job.filename}.`);
      await wait(1000 * 2 ** attempt); continue;
    }
    if (!response.ok) {
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) throw new Error(`Speech service returned HTTP ${response.status} for ${job.filename}.`);
      const seconds = Number(response.headers.get("retry-after"));
      await wait(Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 30000) : 1000 * 2 ** attempt); continue;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!response.headers.get("content-type")?.includes("audio") || !isMp3(bytes)) throw new Error(`Speech service did not return MP3 data for ${job.filename}.`);
    return bytes;
  }
}
