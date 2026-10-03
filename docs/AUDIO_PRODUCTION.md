# Recorded Dutch audio: generation and release

## Current status

The repository manifest contains no approved recordings. Playback falls back to a Dutch device voice. The shared inventory has 433 sources / 1,732 variants: A1 has 343 lesson phrases + 11 connected passages + 13 drills (1,468 variants); A2 adds 64 lesson phrases + two connected passages (264 variants). No synthesis was performed in this implementation.

`loadAudioInventory` is the common source for generation, approval and integrity checks. All A1 jobs remain unchanged and first. Library readings, writing models and text scenarios are not silently added to audio. Paid exams remain deferred.

## Configure and generate

Create a local `.env` using `.env.example`. Set `AZURE_SPEECH_KEY` and the matching `AZURE_SPEECH_REGION` for an Azure Speech resource. Keep the key in a local environment/secret store; never send it in chat, commit it, or expose it through `NEXT_PUBLIC_*`. The operator must have authorized access to the resource.

```bash
npm run content:check
npm run audio:generate -- --dry-run --level=A1
node --env-file=.env scripts/generate-audio.mjs --level=A1 --limit=1
```

The first batch has four clips. Listen before generating the remaining bank:

```bash
node --env-file=.env scripts/generate-audio.mjs --level=A1
```

Azure receives only authored Dutch teaching phrases, not learner answers. Synthesis is a paid external operation according to the resource plan; the dry run prints job counts, cache hits and an approximate storage budget. At 48 kbit/s and an assumed five seconds per clip the combined bank is about 50 MiB; real lengths vary. Review actual size before committing binaries. The existing deployment serves `/audio/` from `public/audio`; object storage/CDN migration remains future work.

## Integrity and resumability

- Filenames include a fingerprint of the exact SSML, voice, speed and output format. A Dutch text or pronunciation change creates a new filename; an Arabic-only edit does not.
- `src/data/audio-pronunciation.json` adds character-level SSML for spelling, a postcode and clothing size letters. Its segments must reproduce the current written phrase exactly. It is not a substitute for listening to the result.
- `src/lib/audio-catalog.json` tracks source fingerprint, byte digest, size and explicit listening-review status. Never trust an old nonempty filename as proof it matches the lesson.
- Each successful generated clip is saved atomically and checkpointed before the next request. Reruns reuse only matching, hash-verified files. A crash between saving a clip and checkpointing may require regenerating that one clip.
- Requests have a 30-second timeout and at most three attempts for temporary service/network failures. Authentication/configuration HTTP failures stop the run. Error output excludes the key and service response bodies.
- A filesystem lock prevents overlapping generation/review processes. After a crash, verify the old process stopped before removing `public/audio/.generation.lock`.
- A successful HTTP response, MP3 signature and digest only establish basic integrity. They do not prove complete decoding, pronunciation, naturalness, loudness, or educational suitability.

## Listen, approve, publish

Generated files start **unreviewed** and are not added to playback automatically. For each clip, compare the whole recording with the source phrase. Check no missing beginning/end, correct Dutch voice, normal/slow pace, numbers, dates, `half` times, letters, postcodes and names. Play the file in a real audio player to confirm decoding. Check especially the long number lists at slow speed.

After actually listening, approve the exact basename printed by the generator:

```bash
npm run audio:review -- --approve=<generated-filename.mp3>
npm run audio:check
```

The review command rebuilds `src/lib/audio-manifest.json` using only current, approved, intact files. Existing `AudioButton` consumes that manifest without a separate URL migration. Approval is a declaration by the operator, not automatic or independent linguistic certification. To withdraw a clip:

```bash
npm run audio:review -- --reject=<generated-filename.mp3>
```

Rejecting a clip removes its playback URL. If pronunciation needs repair, edit its safe SSML segments/lesson text and regenerate. A changed source cannot inherit prior approval. Do not delete old assets until checking that no published manifest still references them.

Before claiming recorded audio for the whole lesson bank:

```bash
npm run audio:check -- --require-complete
```

The strict command currently fails intentionally because all 1,084 variants are absent. Ordinary CI runs `audio:check`, which permits an explicitly incomplete bank but rejects inconsistent playback URLs or missing/corrupted current catalog files. Commit approved clips, catalog and manifest together, then build and exercise playback in the deployed site on desktop and iPhone. Unavailable variants retain the existing device fallback; the app must not advertise recorded-only playback prematurely.

## References

- [Azure REST synthesis](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech)
- [SSML structure and required namespace](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-structure)
- [Voice availability](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)

Checked against Microsoft documentation on 2026-09-25. Provider access, real synthesis and audible quality are still unverified in this environment.

## Expanded A1 inventory (PR #18)

The shared `audioSources` inventory includes **343 lesson phrases, 11 connected review passages and 13 pronunciation drills**: 367 sources / 1,468 variants. Generation, approval and integrity checks all read the same inputs. Lesson identities and SSML hashes stay unchanged for unchanged text. Reading-library passages and text scenarios are still not generated.

The earlier five-second-per-clip storage estimate is a rough reference, not a cost quote: connected passages and the alphabet are longer. Current passage playback permits up to 90 seconds; all recordings, including slow playback, must actually finish within that bound. Check the 26-letter alphabet and sound contrasts with a Dutch speaker; device fallback does not honor SSML pronunciation overrides and is not an approved reference recording.

No real credentials, synthesis, audio decoding or listening approval was available during this expansion. `audio:check -- --require-complete --level=A1` still fails at 0/1,468. Do not flip review flags without listening or mark the course recording gate complete.

## Choosing a level

Use `--level=A1` to continue the existing recording project or `--level=A2` for the new 33-source slice. Without a level flag, generation and completeness cover both levels. `--limit` applies after level selection. No credentials are needed for a dry run.

```bash
npm run audio:generate -- --dry-run --level=A2
npm run audio:check -- --require-complete --level=A1
npm run audio:check -- --require-complete --level=A2
```

A scoped strict check measures completeness only for that level, but still verifies global manifest consistency and existing catalog-asset integrity. Approval/rejection always rebuilds the full manifest; approving A2 must never remove approved A1 URLs. The new native test compares every legacy request, filename and SSML byte before the appended jobs.
