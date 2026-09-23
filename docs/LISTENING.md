# Free listening practice and audio playback

## Learning flow

Each lesson links to `/learn/[slug]/listening`. All 34 lesson routes reuse their existing phrase IDs and Dutch/Arabic content, covering 215 phrases in total. Each round plays one phrase and offers three distinct Arabic meanings from the same lesson. The learner explicitly checks an answer before moving on. Correct meanings, the Dutch transcript, and the existing phrase tip appear after checking.

Before checking, the Dutch sentence is absent from visible content and accessible play-button labels. This is a free client-side practice tool; the underlying phrase remains in client data and is not an exam secret. Choice order is deterministic, and repeating the same round may benefit from memory.

A complete `ended`/speech `end` event unlocks the answers. Starting a clip, stopping it, a playback error, or a stale event from an earlier clip cannot unlock a new question. Playback events do not prove the learner actually heard the audio (volume and device output are outside the app's control).

“Show text for help” remains available for accessibility or unavailable audio. Revealing it permanently marks that round as text-assisted, even if the learner later replays the clip. The summary separates independent listening answers from assisted rounds. If every round used the transcript, it explicitly says there is no independent listening result. Attempts are held in React state only, restart/refresh resets them, and they never modify local or account lesson completion.

The summary offers an explicit button to add incorrect or assisted phrases to the browser-local review list. Only phrase IDs are stored; listening answers, playback status, and results remain in memory. See `docs/REVIEW.md` for storage scope and removal.

## Player lifecycle

`src/lib/audio-playback.ts` owns one active playback session across all `AudioButton` components:

- A new play request stops the previous owner, whether it used an MP3 or device speech.
- Recorded media is preferred when the manifest has the requested voice and speed. A file/load/play failure attempts device speech once.
- Device speech uses an available Dutch voice; it never falls back to an unrelated-language voice. Normal/slow device rates are 0.95/0.72. A requested gender is a best-effort name match, not a guarantee about the device voice.
- `AudioButton` preloads the voice list on mount. Some browsers populate voices later; the user can retry if the initial list has no Dutch voice. Actual quality and availability depend on the OS/browser.
- Stop, route unmount, completion, error, and timeout release owned media and callbacks. A 30-second watchdog recovers from speech engines that never emit an end/error event; phrases are short.
- Cancelled sessions and stale callbacks cannot complete a new round. A late media event after fallback cannot incorrectly finish device speech.

`AudioButton` accepts `concealText` for neutral accessible labels and `onPlaybackComplete` for successful completion only. Keep those boundaries when adding new audio exercises. Voice switching is shown only when multiple stored voice variants exist.

## Assets and limits

The repository still contains no generated lesson MP3s. This change does not provision Azure or generate new audio. The existing `scripts/generate-audio.mjs` workflow and `src/lib/audio-manifest.json` remain the source of stored variants; see README. This practice works without an account or database and does not require a new API or migration.

The exercise reuses known phrases and is not a validated listening assessment, paid exam, or certificate. New listening passages and independent Dutch/Arabic content review remain future work.

## Validation

`npm test` validates every phrase's three-choice round and separates assisted results, then checks playback lifecycle events with media/speech doubles. Playwright exercises completion gating, stop/replay/error, missing Dutch voices, route cleanup, summaries, restart, mobile overflow, and all lesson listening routes. Existing lesson/account/placement tests continue to run.

Automated speech/media doubles validate UI and event handling only. They do not verify actual Dutch pronunciation, speaker quality, volume, browser speech permissions, or physical-device playback. Listen to generated assets and test target phones before public launch.

Playback controls remain disabled in server-rendered HTML until their client component mounts. The browser suite holds JavaScript loading to verify this boundary before testing missing-voice feedback, so an early click cannot be silently lost.
