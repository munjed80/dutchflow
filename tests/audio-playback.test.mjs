import assert from "node:assert/strict";
import test from "node:test";
import { playAudio } from "../src/lib/audio-playback.ts";

function setup() {
  const media = [], spoken = [];
  const engine = { getVoices: () => [{ name: "Dutch female", lang: "nl-NL" }, { name: "Dutch male", lang: "nl-NL" }], cancel: () => {}, speak: (utterance) => spoken.push(utterance) };
  globalThis.window = { speechSynthesis: engine };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.Audio = class {
    constructor(path) { this.path = path; this.paused = false; media.push(this); }
    play() { return Promise.resolve(); }
    pause() { this.paused = true; }
  };
  const states = [];
  let completed = 0;
  const start = (options = {}) => playAudio({ text: "Goedemorgen", speed: "normal", voice: "female", onState: (state) => states.push(state), onComplete: () => completed++, ...options });
  return { media, spoken, engine, states, start, get completed() { return completed; } };
}

test("recorded playback only completes on ended and stopping invalidates stale events", async () => {
  const fixture = setup();
  const stop = fixture.start({ path: "/audio/test.mp3" });
  await Promise.resolve();
  assert.equal(fixture.completed, 0);
  assert.equal(fixture.states.at(-1).source, "recorded");
  const staleEnd = fixture.media[0].onended;
  stop(); staleEnd();
  assert.equal(fixture.completed, 0);
  assert.equal(fixture.media[0].paused, true);
  fixture.start({ path: "/audio/test.mp3" });
  fixture.media[1].onended();
  assert.equal(fixture.completed, 1);
});

test("a media failure falls back once to a Dutch device voice and respects slow playback", async () => {
  const fixture = setup();
  fixture.start({ path: "/missing.mp3", speed: "slow", voice: "male" });
  const staleMediaEnd = fixture.media[0].onended;
  fixture.media[0].onerror();
  staleMediaEnd();
  assert.equal(fixture.completed, 0);
  await Promise.resolve();
  assert.equal(fixture.spoken.length, 1);
  const utterance = fixture.spoken[0];
  assert.equal(utterance.lang, "nl-NL");
  assert.equal(utterance.voice.name, "Dutch male");
  assert.equal(utterance.rate, 0.72);
  assert.equal(fixture.completed, 0);
  utterance.onstart(); utterance.onend();
  assert.equal(fixture.completed, 1);
});

test("starting a new player cancels speech and ignores previous completion events", () => {
  const fixture = setup();
  fixture.start();
  const previousEnd = fixture.spoken[0].onend;
  const stop = fixture.start({ text: "Tot ziens" });
  previousEnd();
  assert.equal(fixture.completed, 0);
  fixture.spoken[1].onend();
  assert.equal(fixture.completed, 1);
  stop();
});

test("unavailable Dutch voices and speech errors never count as a completed listen", () => {
  const fixture = setup();
  fixture.engine.getVoices = () => [{ name: "English", lang: "en-US" }];
  fixture.start();
  assert.equal(fixture.spoken.length, 0);
  assert.match(fixture.states.at(-1).error, /صوت هولندي/);
  assert.equal(fixture.completed, 0);
  fixture.engine.getVoices = () => [{ name: "Dutch", lang: "nl-NL" }];
  fixture.start();
  fixture.spoken[0].onerror();
  assert.equal(fixture.completed, 0);
  assert.match(fixture.states.at(-1).error, /تعذّر/);
});
