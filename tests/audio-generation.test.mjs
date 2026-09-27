import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { planAudio, sha256, isMp3, synthesize, verifyAsset, publishableManifest, validateCatalog, atomicJson } from "../scripts/lib/audio-assets.mjs";
const lesson = [{ phrases: [{ id: "sample-1", dutch: "Mijn naam is A & B.", arabic: "اسم خيالي" }] }];
const mp3 = Buffer.concat([Buffer.from("ID3"), Buffer.alloc(120, 3)]); // Container-signature fixture; not playable speech.
const record = (job, reviewed = false) => ({ phraseId: job.phraseId, voice: job.voice, speed: job.speed, sourceHash: job.sourceHash, audioHash: sha256(mp3), bytes: mp3.length, reviewed });

test("audio identities include spoken content, settings and pronunciation, but not translation", () => {
  const jobs = planAudio(lesson);
  assert.equal(jobs.length, 4);
  assert.equal(new Set(jobs.map((j) => j.filename)).size, 4);
  assert.match(jobs[0].ssml, /xmlns="http:\/\/www.w3.org\/2001\/10\/synthesis"/);
  assert.match(jobs[0].ssml, /A &amp; B/);
  const translation = structuredClone(lesson); translation[0].phrases[0].arabic = "تغيير الترجمة";
  assert.deepEqual(planAudio(translation), jobs);
  const spoken = structuredClone(lesson); spoken[0].phrases[0].dutch += " Hallo.";
  assert.notEqual(planAudio(spoken)[0].filename, jobs[0].filename);
  const overrides = { "sample-1": [{ text: "Mijn naam is " }, { text: "A & B", interpretAs: "characters" }, { text: "." }] };
  assert.notEqual(planAudio(lesson, overrides)[0].sourceHash, jobs[0].sourceHash);
  assert.match(planAudio(lesson, overrides)[0].ssml, /<say-as interpret-as="characters">A &amp; B<\/say-as>/);
  for (const invalid of [{ unknown: [{ text: "x" }] }, { "sample-1": [{ text: "stale text" }] }, { "sample-1": [{ text: lesson[0].phrases[0].dutch, interpretAs: "<injected>" }] }]) assert.throws(() => planAudio(lesson, invalid));
});

test("only current, approved, intact audio reaches playback; rejection or source changes remove it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dutchflow-audio-"));
  try {
    const jobs = planAudio(lesson), job = jobs[0];
    const catalog = { version: 1, assets: { [job.filename]: record(job) } };
    await writeFile(join(directory, job.filename), mp3);
    assert.equal(await verifyAsset(job, catalog, directory), true);
    assert.deepEqual(await publishableManifest(jobs, catalog, directory), {});
    catalog.assets[job.filename].reviewed = true;
    assert.equal((await publishableManifest(jobs, catalog, directory))[job.phraseId].female.normal, `/audio/${job.filename}`);
    const changed = structuredClone(lesson); changed[0].phrases[0].dutch = "Nieuwe tekst.";
    assert.deepEqual(await publishableManifest(planAudio(changed), catalog, directory), {});
    await writeFile(join(directory, job.filename), Buffer.concat([Buffer.from("ID3"), Buffer.alloc(120, 4)]));
    assert.equal(await verifyAsset(job, catalog, directory), false);
    assert.deepEqual(await publishableManifest(jobs, catalog, directory), {});
    await rm(join(directory, job.filename));
    assert.equal(await verifyAsset(job, catalog, directory), false);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("catalog validation rejects unsafe paths and malformed hashes without trusting nonempty files", () => {
  const job = planAudio(lesson)[0];
  validateCatalog({ version: 1, assets: { [job.filename]: record(job) } });
  for (const value of [null, {}, { version: 1, assets: [] }, { version: 1, assets: { "../outside.mp3": record(job) } }, { version: 1, assets: { [job.filename]: { ...record(job), audioHash: "bad" } } }]) assert.throws(() => validateCatalog(value));
  assert.equal(isMp3(Buffer.from("<html>not audio</html>".repeat(20))), false);
});

test("synthesis retries transient responses and network failures, and respects bounded Retry-After", async () => {
  const job = planAudio(lesson)[0], waits = []; let calls = 0;
  const result = await synthesize(job, { key: "test-secret", region: "westeurope", wait: async (ms) => waits.push(ms), fetcher: async (url, options) => {
    assert.match(url, /^https:\/\/westeurope\.tts\.speech\.microsoft\.com\//);
    assert.equal(options.headers["Ocp-Apim-Subscription-Key"], "test-secret");
    assert.ok(options.signal);
    calls++;
    if (calls === 1) throw new Error("connection failed");
    if (calls === 2) return new Response("", { status: 429, headers: { "retry-after": "1000" } });
    return new Response(mp3, { headers: { "content-type": "audio/mpeg" } });
  } });
  assert.equal(calls, 3); assert.deepEqual(waits, [1000, 30000]); assert.deepEqual(result, mp3);
});

test("synthesis does not retry bad credentials, accept HTML as MP3, or leak service bodies", async () => {
  const job = planAudio(lesson)[0]; let calls = 0;
  await assert.rejects(synthesize(job, { key: "test-secret", region: "westeurope", fetcher: async () => { calls++; return new Response("private diagnostic test-secret", { status: 401 }); } }), (error) => /HTTP 401/.test(error.message) && !/test-secret/.test(error.message));
  assert.equal(calls, 1);
  await assert.rejects(synthesize(job, { key: "test", region: "westeurope", fetcher: async () => new Response("<html>".repeat(100), { headers: { "content-type": "audio/mpeg" } }) }), /MP3/);
});

test("catalog checkpoints remain valid JSON when replaced", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dutchflow-catalog-"));
  try {
    const path = join(directory, "catalog.json");
    await atomicJson(path, { version: 1, assets: {} });
    const next = { version: 1, assets: { [planAudio(lesson)[0].filename]: record(planAudio(lesson)[0]) } };
    await atomicJson(path, next);
    assert.deepEqual(JSON.parse(await readFile(path, "utf8")), next);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("dry run needs no credentials; recorded release fails honestly while files are absent", () => {
  const dry = spawnSync(process.execPath, ["scripts/generate-audio.mjs", "--dry-run", "--limit=1"], { encoding: "utf8" });
  assert.equal(dry.status, 0, dry.stderr); assert.match(dry.stdout, /1 phrases, 4 variants/);
  const invalid = spawnSync(process.execPath, ["scripts/generate-audio.mjs", "--dry-run", "--limit=0"], { encoding: "utf8" });
  assert.notEqual(invalid.status, 0);
  const catalog = JSON.parse(spawnSync(process.execPath, ["-p", "require('fs').readFileSync('src/lib/audio-catalog.json','utf8')"], { encoding: "utf8" }).stdout);
  if (Object.keys(catalog.assets).length === 0) {
    const check = spawnSync(process.execPath, ["scripts/check-audio.mjs", "--require-complete"], { encoding: "utf8" });
    assert.equal(check.status, 1); assert.match(check.stderr, /incomplete/);
  }
});
