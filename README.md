# DutchFlow

An Arabic-first Dutch learning website built with Next.js and TypeScript. The long-term model is free lessons and optional full practice-exam attempts at **€4.95 each**. DutchFlow is independent and does not issue official Dutch-language certificates.

Five A2 units are now available as an authored preview: twenty lessons on recent activities, work coordination, housing/services, appointments/follow-up, and shopping/choices, plus reading, listening, writing and guided interaction. Use the level links on `/learn` or open `/a2`. A1 and A2 progress have separate totals; existing A1 URLs and progress are preserved. See [A2 unit 5 delivery notes](docs/A2_SHOPPING_CHOICES.md). This is not a complete A2 release; real recorded audio and independent review remain pending.

## Run locally

Requires Node.js 24 (also used in CI).

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Current learning experience

- Arabic RTL landing page and 53 introductory A1 lessons in four ordered modules. The catalogue includes 343 Dutch phrases, Arabic meanings, learning goals, short dialogues, a grammar note per lesson, and 192 graded questions.
- A `/curriculum` map links ten thematic goals to available resources and shows remaining work. All 53 lessons include 338 vocabulary/form notes and 116 original-response tasks with optional models and self-review questions. A rescheduling task includes a complete letter with a greeting, a new proposed time and a signature. These tasks are ungraded and temporary; see [A1 plan and readiness gates](docs/A1_CURRICULUM.md).
- A free `/scenarios` library adds ten guided text situations, 40 dialogue turns and ten new writing tasks across all ten thematic units. Choose a response, review specific feedback, continue the exchange and write with changed details. Linked from lessons and curriculum; attempts are temporary and do not grant completion or assess speaking. See [scenario behavior and authoring](docs/SCENARIOS.md).
- Search lessons in Arabic or Dutch, filter by module, continue with the first unfinished lesson, and browse previous/next lessons freely.
- Free listening practice for every lesson at `/learn/[slug]/listening`: hear each phrase, choose its Arabic meaning, and review feedback. Text-assisted answers are reported separately and never award lesson completion. See [listening and playback details](docs/LISTENING.md).
- Free guided writing for every lesson at `/learn/[slug]/writing`: recall the lesson sentence from its Arabic meaning, compare highlighted word differences, and rewrite. Results retain the first attempt and separate text help; answers are not saved and never award completion. This compares the lesson wording, not arbitrary translations or general Dutch proficiency. See [writing details](docs/WRITING.md).
- A free `/review` list collects explicitly selected phrases from lessons or training summaries. Filter by lesson and recall up to ten phrases per session, then repeat those you rated as difficult. Only phrase IDs are saved in the browser, shared by its users and separate from accounts; no answers/scores or completion are saved by this feature. See [review behavior and storage limits](docs/REVIEW.md).
- A free `/reading` library adds twenty-seven original everyday texts, 141 contextual vocabulary notes, twenty-seven grammar explanations, and 90 comprehension questions with passage evidence. Arabic translations can be revealed for help. Relevant lessons link to these texts. Guided practice results are not saved and do not certify a level; independent language review remains pending. See [reading content and authoring](docs/READING.md).
- Device speech synthesis for Dutch listening, with normal and slower playback. Playback requires an available Dutch device voice when a stored MP3 is absent; it reports errors instead of selecting an unrelated language. Device voice quality and availability vary; this is a temporary fallback until recorded audio is generated.
- Guest progress stays in the current browser. Optional email-link accounts store progress in PostgreSQL across devices. The account page offers explicit import of existing guest completions; account data is never copied into guest storage. Failed cloud saves show a retry action. See [account setup](docs/ACCOUNTS.md) to enable this feature.
- A free 16-question starting-point check at `/placement`, with server grading, corrections, a breakdown across vocabulary/sentence structure/reading, and up to three lesson recommendations. Answers can be resumed in the same browser tab; no account or database is required. This is not a validated CEFR placement test. See [starting-point check details](docs/PLACEMENT.md).
- Three free example exam questions and a clearly labelled **€4.95** future full-exam offer. Payment and full paid exams are **not enabled**. No money is collected.

The A1 lesson content lives in `src/data/lessons.json`, and ordered modules live in `src/data/modules.json`; A2 uses separate `a2-*.json` banks. Each phrase has a globally unique ID; the audio script and playback manifest use those IDs. The authored A1 scope and internal editorial passes are complete; recorded release and independent educator/learner validation remain open. See [content authoring guidance](docs/CONTENT_AUTHORING.md) before adding or reordering lessons.

## Integrated A1 practice

- `/a1-practice` supplies ten unit reviews and a cumulative free review: 11 new reading sources, 11 short connected listening passages, 90 evidenced questions, 22 writing tasks and 22 oral/partner tasks with examples and self-review criteria. These sources are separate from the 27 reading-library texts.
- `/grammar` collects the 53 lesson grammar notes plus four foundation tables for verbs, questions, noun plurals and pronouns/possession. `/pronunciation` supplies 13 sound/alphabet drills.
- A fictional travel timetable and accessible route map support practical interpretation. Listening questions unlock only after full playback or explicit text help; retry after seeing evidence is marked assisted. All attempts stay in memory and grant no completion or proficiency score.
- The audio inventory includes the unchanged A1 bank (343 lesson phrases, 11 passages and 13 drills: 1,468 variants) plus 160 A2 phrases and five passages (660 variants): **2,128 variants planned, zero approved MP3s in the repository**. Use `--level=A1` to continue only the existing recordings. Missing Dutch device voices have explicit text-help fallback. See [A1 scope and remaining release gates](docs/A1_COMPLETION.md).

## Validation

```bash
npm run content:check
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The content checks catch duplicate audio IDs, broken dialogue references, invalid answer keys, missing goals or grammar, and invalid starting-point question/lesson links before publication. Browser tests cover search/filtering, existing progress, quiz completion and retries, lesson navigation, all 53 lesson routes, and mobile overflow. Playwright starts the production server, an isolated SMTP inbox, and an in-memory PGlite database automatically; build first. Account tests cover actual email links, expiry/replay, origin checks, rate limits, import, cross-device isolation, sign-out, and failed-save recovery. GitHub Actions uses PostgreSQL 17 for the same tests on each PR. No real emails are sent. Listening tests cover all 343 phrases, text assistance, playback completion/cancellation/errors, stale events, and route changes using controlled media/speech events; they do not verify real voice quality. Starting-point tests cover partial drafts, answer changes, failed-submit retry, grading, unknown answers, malformed requests, stale revisions, recommended lessons, and exclusion of answer explanations from initial HTML/client assets.

Writing validation additionally covers all 343 phrases, spelling/normalization boundaries, missing/repeated/reordered words, first-attempt results, help/retries, review lists, navigation reset, input limits, and mobile layout with long answers.

Review tests cover validated phrase IDs, explicit additions from lessons and both summaries, ten-card sessions, self-ratings, filtering/removal/reset, unchanged progress, malformed data, failed writes and retry, sequential tab updates, and mobile layout.

Reading validation checks lesson links, vocabulary excerpts, grammar examples, question identifiers/options, and evidence quoted from each passage. Browser tests cover all reading routes, translations, feedback/regrading, resets, mobile layout, and completion isolation. Structural validation does not replace qualified linguistic review.

## Generate reusable Dutch audio

The Azure Speech pipeline generates two Dutch voices at normal/slow speed. It uses content fingerprints, verified cache entries and explicit listening approval before playback URLs are published. No real MP3s have been generated yet; credentials are not configured.

```bash
npm run audio:generate -- --dry-run
npm run audio:check
```

Follow [generation, review and release instructions](docs/AUDIO_PRODUCTION.md). The strict recorded-audio release check (`npm run audio:check -- --require-complete`) intentionally fails until the whole bank is generated and reviewed.

## Roadmap

1. Review and complete the A1 units using [the curriculum readiness gates](docs/A1_CURRICULUM.md). The PR #21 enrichment editorial review is complete; see [the review ledger](docs/A1_ENRICHMENT_REVIEW.md). Owner-managed recorded audio and independent educator/learner validation remain open. The remaining A2 plan lives in [docs/A2_CURRICULUM.md](docs/A2_CURRICULUM.md).
2. Generate and review the audio. Add a content authoring workflow and audio quality checks.
3. Configure production PostgreSQL and SMTP, verify delivery and backups, and add account export/deletion and a published privacy policy before public launch.
4. **Deferred by the owner until A1 and audio are ready:** build secure paid practice exams: authenticated purchases, one €4.95 attempt per payment, server-side scoring, provider webhooks, receipts, and clear retry/refund handling. Do not unlock an exam based on a browser redirect alone.
5. Add result breakdowns and revision recommendations. Keep all standard lessons free.

## Vocabulary lookup

The free `/vocabulary` library searches authored lesson vocabulary in Arabic or Dutch, including plural/conjugated forms and example translations. Filter by type and module, listen to an example sentence, or explicitly save it to browser-local review. Repeated terms keep their lesson context. This does not award completion or claim dictionary/CEFR completeness. See [vocabulary behavior and validation](docs/VOCABULARY.md).

See `CLAUDE.md` for project continuity and contribution guidance.

See [September editorial review and remaining gaps](docs/A1_REVIEW_2026-09.md).
