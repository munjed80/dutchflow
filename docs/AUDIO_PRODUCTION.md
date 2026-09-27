# Recorded Dutch audio: generation and release

## Current status

No production credentials or MP3s are present. The manifest is empty, so playback still uses the Dutch device voice. The 41-lesson bank contains 271 phrases and plans 1,084 variants (two voices, two speeds). Paid exams are deferred while A1 and audio are completed.

This pipeline generates **lesson phrases only**. Readings and guided scenarios do not silently enter the audio bank. Complete phrase audio does not satisfy the curriculum requirement for unseen connected listening passages.

## Configure and generate

Create a local `.env` using `.env.example`. Set `AZURE_SPEECH_KEY` and the matching `AZURE_SPEECH_REGION` for an Azure Speech resource. Keep the key in a local environment/secret store; never send it in chat, commit it, or expose it through `NEXT_PUBLIC_*`. The operator must have authorized access to the resource.

```bash
npm run content:check
npm run audio:generate -- --dry-run
node --env-file=.env scripts/generate-audio.mjs --limit=1
```

The first batch has four clips. Listen before generating the remaining bank:

```bash
node --env-file=.env scripts/generate-audio.mjs
```

Azure receives only authored Dutch teaching phrases, not learner answers. Synthesis is a paid external operation according to the resource plan; the dry run prints job counts, cache hits and an approximate storage budget. At 48 kbit/s and an assumed five seconds per clip the current bank is about 31 MiB; real lengths vary. Review actual size before committing binaries. The existing deployment serves `/audio/` from `public/audio`; object storage/CDN migration remains future work.

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
