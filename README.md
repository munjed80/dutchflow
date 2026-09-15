# DutchFlow

An Arabic-first Dutch learning website built with Next.js and TypeScript. The long-term model is free lessons and optional full practice-exam attempts at **€4.95 each**. DutchFlow is independent and does not issue official Dutch-language certificates.

## Run locally

Requires Node.js 24 (also used in CI).

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Current learning experience

- Arabic RTL landing page and 20 introductory A1 lessons in four ordered modules. The catalogue includes 101 Dutch phrases, Arabic meanings, learning goals, short dialogues, a grammar note per lesson, and 60 graded questions.
- Search lessons in Arabic or Dutch, filter by module, continue with the first unfinished lesson, and browse previous/next lessons freely.
- Free listening practice for every lesson at `/learn/[slug]/listening`: hear each phrase, choose its Arabic meaning, and review feedback. Text-assisted answers are reported separately and never award lesson completion. See [listening and playback details](docs/LISTENING.md).
- Free guided writing for every lesson at `/learn/[slug]/writing`: recall the lesson sentence from its Arabic meaning, compare highlighted word differences, and rewrite. Results retain the first attempt and separate text help; answers are not saved and never award completion. This compares the lesson wording, not arbitrary translations or general Dutch proficiency. See [writing details](docs/WRITING.md).
- A free `/review` list collects explicitly selected phrases from lessons or training summaries. Filter by lesson and recall up to ten phrases per session, then repeat those you rated as difficult. Only phrase IDs are saved in the browser, shared by its users and separate from accounts; no answers/scores or completion are saved by this feature. See [review behavior and storage limits](docs/REVIEW.md).
- A free `/reading` library adds eight original everyday texts, 40 contextual vocabulary notes, eight grammar explanations, and 24 comprehension questions with passage evidence. Arabic translations can be revealed for help. Relevant lessons link to these texts. Guided practice results are not saved and do not certify a level; independent language review remains pending. See [reading content and authoring](docs/READING.md).
- Device speech synthesis for Dutch listening, with normal and slower playback. Playback requires an available Dutch device voice when a stored MP3 is absent; it reports errors instead of selecting an unrelated language. Device voice quality and availability vary; this is a temporary fallback until recorded audio is generated.
- Guest progress stays in the current browser. Optional email-link accounts store progress in PostgreSQL across devices. The account page offers explicit import of existing guest completions; account data is never copied into guest storage. Failed cloud saves show a retry action. See [account setup](docs/ACCOUNTS.md) to enable this feature.
- A free 16-question starting-point check at `/placement`, with server grading, corrections, a breakdown across vocabulary/sentence structure/reading, and up to three lesson recommendations. Answers can be resumed in the same browser tab; no account or database is required. This is not a validated CEFR placement test. See [starting-point check details](docs/PLACEMENT.md).
- Three free example exam questions and a clearly labelled **€4.95** future full-exam offer. Payment and full paid exams are **not enabled**. No money is collected.

The lesson content lives in `src/data/lessons.json`, and ordered modules live in `src/data/modules.json`. Each phrase has a globally unique ID; the audio script and playback manifest use those IDs. This is an introductory learning path, not a complete A1 syllabus. See [content authoring guidance](docs/CONTENT_AUTHORING.md) before adding or reordering lessons.

## Validation

```bash
npm run content:check
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The content checks catch duplicate audio IDs, broken dialogue references, invalid answer keys, missing goals or grammar, and invalid starting-point question/lesson links before publication. Browser tests cover search/filtering, existing progress, quiz completion and retries, lesson navigation, all 20 lesson routes, and mobile overflow. Playwright starts the production server, an isolated SMTP inbox, and an in-memory PGlite database automatically; build first. Account tests cover actual email links, expiry/replay, origin checks, rate limits, import, cross-device isolation, sign-out, and failed-save recovery. GitHub Actions uses PostgreSQL 17 for the same tests on each PR. No real emails are sent. Listening tests cover all 101 phrases, text assistance, playback completion/cancellation/errors, stale events, and route changes using controlled media/speech events; they do not verify real voice quality. Starting-point tests cover partial drafts, answer changes, failed-submit retry, grading, unknown answers, malformed requests, stale revisions, recommended lessons, and exclusion of answer explanations from initial HTML/client assets.

Writing validation additionally covers all 101 phrases, spelling/normalization boundaries, missing/repeated/reordered words, first-attempt results, help/retries, review lists, navigation reset, input limits, and mobile layout with long answers.

Review tests cover validated phrase IDs, explicit additions from lessons and both summaries, ten-card sessions, self-ratings, filtering/removal/reset, unchanged progress, malformed data, failed writes and retry, sequential tab updates, and mobile layout.

Reading validation checks lesson links, vocabulary excerpts, grammar examples, question identifiers/options, and evidence quoted from each passage. Browser tests cover all reading routes, translations, feedback/regrading, resets, mobile layout, and completion isolation. Structural validation does not replace qualified linguistic review.

## Generate reusable Dutch audio

The generator supports two Netherlands Dutch voices and normal/slow speed. It generates MP3 files once and reuses existing files on reruns. See [Microsoft's Speech REST API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech) and [Dutch voice list](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) for account setup and voice availability.

Create a local `.env` from `.env.example` and supply an Azure Speech resource key and its region. **Never commit `.env` or a key.**

```bash
npm run audio:generate -- --dry-run
node --env-file=.env scripts/generate-audio.mjs --limit=2
node --env-file=.env scripts/generate-audio.mjs
```

The script writes MP3s to `public/audio/` and updates `src/lib/audio-manifest.json`. The app uses these files automatically and falls back to the device voice when a variant is absent. Commit generated MP3 files and the manifest together for a small catalogue. At larger scale, move assets to object storage/CDN and adjust the manifest URLs; avoid growing Git with thousands of binary files.

## Roadmap

1. Review this introductory A1 path and the starting-point questions with a qualified Dutch speaker; add further A1 practice and structured A2 and B1 content.
2. Generate and review the audio. Add a content authoring workflow and audio quality checks.
3. Configure production PostgreSQL and SMTP, verify delivery and backups, and add account export/deletion and a published privacy policy before public launch.
4. Build secure paid practice exams: authenticated purchases, one €4.95 attempt per payment, server-side scoring, provider webhooks, receipts, and clear retry/refund handling. Do not unlock an exam based on a browser redirect alone.
5. Add result breakdowns and revision recommendations. Keep all standard lessons free.

See `CLAUDE.md` for project continuity and contribution guidance.
