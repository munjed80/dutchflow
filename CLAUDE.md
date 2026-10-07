# DutchFlow — project continuity

Read this file and `README.md` before changing the project. Update this file after each meaningful PR so another coding assistant can continue from the actual repository state. Verify claims against code before marking a feature complete.

## Product and owner decisions

- Owner: Munjed Alsaied (`munjed80`). GitHub repository: `munjed80/dutchflow`.
- Goal: teach practical Netherlands Dutch to Arabic-speaking learners through everyday situations, not dry lists of grammar rules. Audience includes people living or working in the Netherlands.
- Main UI is Arabic RTL; Dutch phrases must use `lang="nl"` and LTR direction. Source code, identifiers, comments, and developer documentation are in English.
- **All learning lessons stay free.** Full independent practice exams should cost **€4.95 per attempt**, with no recurring subscription required. Do not put a paywall in regular lessons.
- The platform is not affiliated with DUO, Inburgering, or Staatsexamen NT2. Never describe a practice result as an official certificate.
- Audio strategy: generate Dutch phrase audio once, store and reuse the files. Aim for male/female voices and normal/slow speed. Do not generate TTS anew on each learner request.
- The visual direction is clean and mature, avoiding a childish game aesthetic.

## Current implementation

- Next.js App Router, React, TypeScript, and plain CSS. `src/app` holds routes; `src/components` holds interactive UI; `src/data/lessons.json` holds authored lessons and `src/data/modules.json` defines their module order.
- Pages: `/`, `/learn`, `/learn/[slug]`, `/learn/[slug]/listening`, `/learn/[slug]/writing`, `/reading`, `/reading/[slug]`, `/curriculum`, `/review`, `/exams`, `/progress`, `/account`, `/placement`, `/vocabulary`, `/scenarios`, `/scenarios/[slug]`, `/a1-practice`, `/a1-practice/[slug]`, `/grammar`, and `/pronunciation`.
- The introductory A1 path has 53 lessons in four modules: first steps, around town, daily life, and appointments. It contains 343 phrases, 192 questions, goals, contextual dialogues, and grammar notes. **Authored A1 coverage and internal editorial passes are complete; recorded release and independent educator/learner validation remain open.**
- The catalogue supports Arabic/Dutch search, module filters, completion badges, and a suggested next unfinished lesson. Progress is grouped by module, and previous/next navigation is available without locking free lessons. Only three featured lessons appear on the homepage.
- Original lesson slugs and audio IDs remain stable, so old bookmarks, audio mappings, and saved completion survive the revised order. Display lesson numbers are not persistent identifiers. Read `docs/CONTENT_AUTHORING.md` before editing the curriculum.
- Catalogue and progress pages pass lesson summaries from the server; they do not send all lesson phrases and questions to their client components. The shared `LearningProvider` loads identity and progress; `useLearningProgress` exposes its completed slugs.
- Lessons and free sample exam questions work. Guest completion uses the existing `dutchflow-progress-v1` localStorage key. Optional Better Auth email-link accounts store completion in PostgreSQL. Links expire after 10 minutes, are single use, and are stored hashed. Sessions last up to 30 days with daily renewal. No passwords or social login are enabled.
- Read `docs/ACCOUNTS.md` before changing auth, migrations, or progress. Configure the five server-only account variables to enable sign-in; otherwise guest learning remains available. Production database/SMTP have **not** been provisioned or verified by this PR.
- Guest import is explicit on `/account`; never automatically attribute shared-device progress to a user. Cloud completion is union-only/idempotent. Server identity comes from the validated session; `expectedUserId` only guards against stale tabs. Reject unknown slugs, cross-origin writes, and oversized bodies. These self-reported free-lesson completions must **never** grant paid attempts or official results.
- Account progress is not cached in localStorage. Save failures stay visible with a retry button; no offline sync queue exists. Sign-out revokes the current session and reloads into the original guest progress. Focus/online refreshes account identity and progress. Avoid silently falling back to guest storage when session lookup fails.
- Quiz feedback reflects the current attempt, independently of past lesson completion. An incorrect retry keeps earlier completion credit but displays the current score and corrections. The lesson player is keyed by lesson slug so a different lesson starts with fresh quiz state.
- Every lesson has free listening practice at `/learn/[slug]/listening`, linked after the phrase section. It reuses all 343 existing phrase IDs and translations. `buildListeningRounds` provides three distinct Arabic meanings for each phrase; answer order is deterministic. Content checks in the native suite protect these invariants.
- Read `docs/LISTENING.md` before changing listening/playback. Choices unlock only after a complete playback event or explicit transcript reveal. A stopped/failed clip cannot count as heard. Revealing the transcript marks the round assisted; results separate those rounds from independent listening. These are free in-memory practice results, not CEFR scores or lesson completion. Refresh starts over; no listening answers or scores are saved to the account or browser storage.
- Audio playback controls are disabled until the component mounts; the browser test explicitly delays JavaScript to verify this boundary before exercising unavailable-voice feedback.
- `AudioButton` delegates to `src/lib/audio-playback.ts`, with one active owner across recorded and device playback, cleanup on unmount, stale-event guards, a stop button, a 30-second timeout, and error feedback. Listening mode uses neutral accessible button labels to avoid revealing the sentence. Device fallback requires an available Dutch voice. No real audio quality has been validated in automated tests.
- `AudioButton` currently falls back to browser speech synthesis in `nl-NL`. Device availability varies. `scripts/generate-audio.mjs` can generate reusable Azure Speech MP3s; explicit listening approval through `audio:review` populates `src/lib/audio-manifest.json`, but the repository contains no MP3 files until a key is supplied and the script is run. Keep credentials server-side/offline.
- Every lesson also has free guided writing at `/learn/[slug]/writing`, linked after its dialogue. It reuses the 343 known phrases: recall the lesson wording from the Arabic meaning, compare words/order, and rewrite after feedback. Read `docs/WRITING.md` before changing it. This is deterministic model comparison, not free-translation or grammar evaluation; alternate valid Dutch must not be labelled a linguistic error.
- `src/lib/writing.ts` tolerates case, whitespace, NFC/curly-apostrophe variants, and sentence-final punctuation, while retaining accents, numbers, internal punctuation, and word order. Word alignment highlights differences in both texts. Input is capped at 500 code units. Immutable first-submission results prevent retries from inflating scores; pre-answer model reveals are counted separately as assisted. The summary lists phrases to review. Writing answers stay in memory only; navigation/reload/replay reset them and never affect guest/cloud completion.
- `/review` offers an explicit browser-local phrase list and up to ten recall cards per session, with source-lesson filtering, reveal-before-self-rating, difficult-card replay, individual removal, and confirmed clear. `SaveReviewButton` adds individual lesson phrases or incorrect/nonmatching/assisted phrases from training summaries only on request. Read `docs/REVIEW.md` before changing this flow.
- `ReviewProvider` stores only validated, unique phrase IDs under `dutchflow-review-v1` (version 1). It receives allowed IDs from the server, not the full lesson/question bank. The list is shared by users of that browser, survives sign-out, and never syncs to accounts; the UI states this. Storage commits precede visible success; failures remain visible/retryable and malformed data requires explicit clear. Storage/focus events refresh tabs and mutations reread current data, but simultaneous writes are not transactional. Active recall sessions are in-memory snapshots; self-ratings neither change the saved list nor grant completion. No automatic scheduling exists.
- `/placement` provides a free 16-question starting-point check in vocabulary (6), sentence structure (5), and short reading (5). It gives a raw score, skill counts, corrections, and up to three lessons linked to missed answers. **It is not a validated CEFR assessment, a complete exam, or a certificate.** Listening, speaking, and writing are not assessed. Qualified language review is still pending.
- Read `docs/PLACEMENT.md` before changing this check. Its private answer bank is `src/data/placement.json`, imported through `src/lib/server/placement.ts`. An explicit public projection sends only prompts/options to the client. `/api/placement` validates all 16 answers and the content revision before computing the result, without accounts, database writes, progress credit, or payments. Never reuse this free stateless endpoint as paid-exam authorization.
- Anonymous placement drafts use `sessionStorage` key `dutchflow-placement-draft-v1`, separate from guest progress and account data. Reload offers explicit resume; a completed draft returns to review for server regrading. Restart replaces the draft. Missing storage permits in-memory use, and failed submissions keep answers available for retry. Bump the bank revision for any content/key/mapping change.
- `/exams` links to the free starting-point check, describes the €4.95 offer and lets users try three free questions. **No checkout, paid exam, payment webhook, paid-exam scoring backend, or certificate exists yet.** The paid button is intentionally disabled.
- `/reading` adds twenty-seven original short everyday texts, 141 contextual vocabulary/expression notes, twenty-seven grammar explanations with passage examples, and 90 evidenced comprehension questions. The catalogue and relevant lessons link to reading pages. Read `docs/READING.md` before editing `src/data/readings.json`. Texts now cover all ten thematic units with extra unseen practice for introductions, time, school, home, shopping, travel, health, services, work, and leisure; independent Dutch/Arabic review is still pending.
- Reading is open-text guided practice with a revealable Arabic translation. `ReadingQuiz` reports the current attempt, explains every answer, and quotes the authored passage evidence. Edits invalidate the previous result; retry/reload/navigation reset state. Nothing is persisted or awarded as completion. Passages/vocabulary/grammar render on the server; only the current questions enter the client. Reading content is separate from existing audio/review phrase IDs and is not included in audio generation.

- `/curriculum` maps ten thematic goal areas to every published lesson and reading, with explicit remaining work. It shows partial coverage, never mastery or CEFR completion. Read `docs/A1_CURRICULUM.md` before extending the syllabus. The four existing catalogue modules remain broad browsing groups.
- All 53 lessons now have 338 vocabulary/form notes and 116 production tasks in `src/data/lesson-extensions.json`, covering foundation, numbers/time, leisure, family/school, services/messages, home/neighbourhood, travel, work, health, and food/shopping enrichment. Noun articles/plurals, selected verb forms and same-lesson examples render on the server. Only current tasks enter `ProductionPractice`. Its 500-character answers stay in component state; optional examples and self-review questions do not grade valid alternatives, save data or grant completion. The original phrase-recall writing exercise remains separate. Audio is still device-dependent and no MP3s were generated.
- The initial 20 lesson slugs and 101 spoken phrase IDs/texts are protected by `tests/fixtures/original-phrases.json`; changing that fixture requires intentional compatibility review. Numbering is presentation-only; current completion uses 53 lessons. `validateLearningMap` checks map coverage/links, same-lesson vocabulary references, noun fields and production contracts.

- The numbers/time expansion adds `dates-and-calendar` and `weekly-routine` (16 phrases, eight questions), plus vocabulary/form notes and self-review tasks for these and the existing `numbers-and-age`/`time-and-days` lessons. At the numbers/time release the four enriched lessons supplied 24 vocabulary/form notes and eight self-review tasks. `a-week-of-language-lessons` is a longer original reading with six vocabulary notes and four evidenced questions, including lesson duration versus separate practice time. The numbers/time map still shows partial coverage. The September review adds the wider month/number bank; recorded listening and conversation remain pending.
- The leisure expansion adds `free-time-hobbies`, `weather-today`, and `invitations-and-plans` (24 phrases, 12 questions), plus 18 vocabulary/form notes and six self-review tasks for those lessons. The new reading `a-saturday-park-plan` links hobbies, weather, and invitations with four evidenced questions. The leisure unit now has partial coverage instead of a planned-only placeholder, but connected listening and unseen invitation tasks are still pending.
- The family/school expansion adds `family-at-home` and `message-to-school` (16 phrases, eight questions), enriches `school-and-family`, and adds the reading `a-message-about-absence` with four evidenced questions. The unit now has three linked lessons, two readings, 18 new vocabulary/form notes and six new self-review tasks across the unit, but reviewed listening and direct school-interaction tasks are still pending.
- The services/messages expansion adds `filling-in-a-form` and `changing-an-appointment` (18 phrases, eight questions), enriches `municipal-appointment`, `phone-calls`, and `letters-and-messages`, and adds the reading `a-missing-document-message` with four evidenced questions. The unit now has five linked lessons, one reading, 30 new vocabulary/form notes and ten new self-review tasks across the unit, but reviewed voicemail listening, shorter original writing feedback, and direct role-play tasks are still pending.
- `docs/A2_FIRST_UNIT.md` records the delivered four-lesson A2 slice. `docs/A2_CURRICULUM.md` retains the remaining sequence and release boundaries; do not present planned units as delivered content.

- PR #12 review repairs the form dialogue (birth-date question answered with a full fictional date) and the rescheduling dialogue (explicit Friday 14:00 offer, acceptance, then confirmation). Two new phrase IDs were added; only the two unmerged form phrases `a1-filling-in-a-form-03` and `-05` changed their spoken text. No recorded assets exist. All 181 phrases from the merged 30-lesson catalogue remain unchanged. The rescheduling production task now transfers the pattern to a Tuesday 10:30 letter; letter passages, cues, models and translations preserve paragraphs. Enrichment browser checks run independently per lesson, using the default timeout.

## Next priorities

1. The 2026-09-29 core lesson and full enrichment/reading/scenario/integrated-practice editorial passes are complete for the pre-enrichment snapshot; see `docs/A1_DETAILED_REVIEW.md`. The PR #21 enrichment follow-up is complete; see `docs/A1_ENRICHMENT_REVIEW.md`. Obtain independent educator/learner feedback on difficulty and outcomes. The 16 placement questions remain a separate starting-point bank and were not part of this detailed pass.
2. The owner handles real audio generation and listening approval. Preserve all 367 spoken source texts/IDs and pronunciation overrides; do not synthesize or change recordings without a new task.
3. Provision production PostgreSQL/SMTP, run the reviewed migrations, verify delivery and proxy rate limiting, and add account export/deletion and privacy documentation before a public launch.
4. **Deferred by the owner on 2026-09-25 until A1 and recorded audio are ready.** Implement paid exam inventory and secure €4.95 per-attempt checkout with a chosen provider (Mollie or Stripe), server-side webhook verification, attempt entitlements, and server-side result computation. Never make the payment confirmation screen alone grant an attempt.
5. Add accessibility and mobile device checks for lessons, audio, quizzes, and checkout before public launch.

## Working rules

- Create a dedicated branch and open a pull request targeting `main` for future changes. The initial foundation was committed directly to `main`; the owner requested the pull-request workflow afterwards. Leave merging to the owner unless explicitly authorized.
- Make small focused changes. Run `npm run content:check`, `npm test`, `npm run typecheck`, and `npm run build` before submitting a PR. Run `npm run test:e2e` for lesson, navigation, catalogue, or progress changes; install Chromium with `npx playwright install chromium` first. Use Node.js 24. E2E starts a test SMTP inbox plus ephemeral PGlite locally, or the dedicated `TEST_DATABASE_URL` in CI (PostgreSQL 17); never point it at a production database. CI runs all of these checks.
- Native content tests protect schema integrity, answer keys, dialogue references, original IDs, starting-point content, public/private projection, grading boundaries, and recommendation links. Playwright covers search, module filters, retained progress, retries, navigation, lesson routes, and mobile overflow. Account E2E also checks real email links, hashed/expired/replayed tokens, rate limiting, authorization, explicit import, cross-device isolation, retry recovery, and guest-only deployments. Starting-point E2E covers resume/edit/retry, unknown answers, independent operation during account lookup failure, malformed requests/revisions, no initial answer leakage, and mobile result layout. Listening/media tests cover round uniqueness, assisted scoring, real UI transitions driven by mocked speech events, missing voices, stop/error/stale callbacks, mobile layout, route cleanup, and every listening URL. They do not validate actual audio quality. Audio generation validates the full curriculum before processing even a limited batch.
- Keep `README.md` and this file aligned with actual features. Never silently treat planned features as shipped.
- Writing tests protect normalization/spelling boundaries, word alignment, all phrase lengths, first-attempt scoring, help/retries, review lists, storage independence, route reset, and mobile long-input layout. Keep the distinction between model comparison and linguistic correctness visible to learners.
- Review tests protect schema/version/ID bounds, explicit persistence, sessions and replay, filtering/removal/clear, training-summary additions, failed writes/recovery, sequential tab updates, mobile layout, and completion isolation. Listening/writing answers and scores remain in memory; only explicitly selected phrase IDs enter review storage.
- `content:check` includes the reading bank. Reading tests protect schema, existing lesson links, unique IDs/options, vocabulary excerpts, exact grammar/evidence references, and answer-key bounds. Browser tests cover discovery, all routes/404, translation, regrading/reset, mobile layout, and storage isolation. Evidence presence is not a proof of linguistic accuracy or logical entailment; qualified content review remains necessary.
- Do not commit API keys, `.env` files, personal learner information, or bulk audio without reviewing storage costs and repository size.
- Avoid unrelated migrations, hosting changes, or architecture rewrites. Ask the owner only for genuinely necessary choices or secrets; progress on independent work first.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Vocabulary library handoff

- `/vocabulary` indexes all authored lesson-enrichment notes dynamically. Read `docs/VOCABULARY.md` before changing it. The server explicitly projects vocabulary and same-lesson phrase examples; no quiz bank or production models enter `VocabularyLibrary`.
- Search covers Dutch/Arabic terms, forms, meanings, example text and lesson titles, with type/module filters and 24-result batches. Normalization is search-only; it is not stemming or translation. Search/filter state is temporary. Duplicate terms in different lessons remain separate contexts.
- Audio and explicit review actions target the full example phrase through existing components and IDs, never isolated headword audio or new storage. Filtering out a playing card cancels it. Browsing does not grant completion.
- PR #12 (services/messages) and PR #13 (vocabulary library) are both merged. The library automatically includes home/neighbourhood and food/shopping enrichment; it now indexes 246 contextual entries across 41 lessons. Native and browser tests cover projection, search, filtering, context links, save failures/retry, persistence, audio cleanup and mobile layout.

## Home and neighbourhood handoff

- `rooms-at-home` and `furniture-and-location` add 16 phrases and eight questions. Their insertion after `home-and-address` changes display numbers only. All 199 previously merged phrase records and all existing lesson slugs are preserved.
- Five home lessons now supply 30 lexical notes and ten self-review tasks, including a multiline repair request and a rescheduling response that does not imply confirmation. No user text is graded or stored.
- `a-room-for-a-guest` adds six vocabulary notes, a spatial grammar note and four reading questions. The home map now links five lessons and three readings, including the existing neighbour text shared with the introduction unit. All ten units still show partial coverage.
- At the home/neighbourhood release (PR #14), totals were: 34 lessons, 215 phrases, 116 lesson questions; 23 enriched lessons, 138 lexical notes, 46 production tasks; 13 readings, 67 reading notes, 13 reading grammar notes, 44 reading questions. Audio planning is 860 variants (two voices × two speeds); no MP3s were generated.
- Browser validation covers plural vocabulary discovery into the new lesson, mobile example writing and reading evidence/regrading. Generic suites also exercise new routes, enrichment, listening and writing content. Independent linguistic/audio review remains pending.

## Food and shopping handoff

- PR #14 is merged. `groceries-and-quantities` and `clothes-and-sizes` add 16 phrases and eight questions after `cafe-order`. All 34 previously merged lessons (apart from display numbers), 215 phrase records, 23 enrichments and 13 readings are preserved.
- Four food/shopping lessons now include 24 vocabulary/form notes and eight self-review tasks. The vocabulary library automatically exposes the around-town module and forms such as `jassen` and `tomaten`. No answer or score is persisted by these tasks.
- `a-shopping-list-message` adds six reading notes and four questions. Prices are fictional: the reading's four-euro kilogram / two-euro half kilogram differs from the lesson's three-euro kilogram / one-euro-fifty half kilogram. Milk is not needed; white bread is a conditional substitute. Preserve these distinctions when editing answer keys or evidence.
- Totals at the food/shopping release: 36 lessons, 231 phrases, 124 lesson questions; 27 enriched lessons, 162 lexical notes, 54 production tasks; 14 readings, 73 reading notes, 14 reading grammar notes, 48 reading questions. Audio dry-run plans 924 variants; no MP3s are generated.
- Browser coverage adds mobile plural search, the new module filter, changed-size self-review with explicit phrase saving, and shopping-list price feedback/regrading. All units remain partially covered A1; independent language/audio review is pending.

## Guided scenarios handoff

- PR #15 is merged. `/scenarios` and `/scenarios/[slug]` now provide ten guided text situations, 40 turns and ten original-response transfer tasks, covering all ten curriculum themes. Read `docs/SCENARIOS.md` before changing content or player behavior.
- `src/data/scenarios.json` is a separate authored bank. Every turn has a goal, Dutch partner prompt, three translated choices with specific Arabic feedback, one suitable-choice index and an authored partner reply. The final transfer task reuses `ProductionPractice`; it is not graded.
- `reduceScenario` in `src/lib/scenario-session.ts` gates advancement until a suitable response or explicit model help. It retains the first checked choice across retries, marks assistance separately and ignores repeated actions on resolved turns. State and writing stay in memory; restart/reload/different-scenario navigation reset them. No progress, review, account or payment writes occur.
- Catalogue and source links are server-rendered; only the selected scenario is passed to the client player. The free current scenario includes its answers in client props. Never use this format as a paid exam authorization/scoring boundary.
- `/learn`, relevant lessons and all ten curriculum units expose scenario links. Unit coverage remains partial. These are linear text-choice exchanges, not branching/AI conversations or speech assessment. No audio is added to scenarios in this release.
- At the scenario release, lesson inventory remained 36 lessons / 231 phrases / 124 questions, with 162 lexical notes and 54 production tasks; reading inventory remains 14 texts / 73 notes / 48 questions. Scenario content is additional and does not change original phrase/audio/review identities or the completion denominator. Audio planning remains 924 variants; no MP3s were generated.
- `validateScenarios` participates in `content:check`. Native tests cover authoring contracts and reducer boundaries. Browser checks traverse all ten scenarios on mobile and cover retries/model help, first-choice retention, keyboard/focus, transfer writing, storage isolation, account failure, route reset and 404. Independent language/audio review remains pending.

## A1 review and audio readiness handoff (2026-09-25)

- PR #16 is merged. Owner explicitly deferred paid exams and prioritized A1 review/completion, then real lesson audio.
- Current totals: 41 lessons / 271 phrases / 144 questions; all 41 lessons enriched with 246 notes and 82 tasks; 17 readings / 91 notes / 60 questions. Scenario bank remains eight situations / 32 turns / eight tasks. All ten thematic units remain partial.
- Read `docs/A1_REVIEW_2026-09.md` for exact corrections, new resources, compatibility, review scope and remaining gaps. Never represent the coding assistant's editorial pass as independent qualified review or complete A1.
- `docs/AUDIO_PRODUCTION.md` is the audio runbook. Generator filenames fingerprint SSML/voice/speed/format, catalog stores source/audio hashes and review flags, and only `audio:review -- --approve=<filename>` publishes verified current files. New generation does not auto-publish. `audio:check` runs in CI; `--require-complete` is the strict release gate.
- New lexical content supports the exact uncountable forms marker `geen meervoud in deze betekenis`; do not invent a plural just to satisfy the schema.
- No Azure credentials or real MP3s exist in this workspace/repository. Dry-run plans 1,084 clips, not a completed audio release. First run one phrase/four variants, listen, then continue. Keep credentials private; do not bypass the missing service access with unofficial endpoints.

## Calendar and health scenarios handoff (2026-09-28)

- PR #17 is merged. Two additional free text scenarios cover the previously unrepresented numbers/time and health units: `planning-a-study-session` and `explaining-a-symptom`. Current scenario totals are ten situations, 40 turns and ten transfer tasks, one situation per thematic unit. Earlier handoff counts describe their release snapshots.
- Calendar practice separates availability, duration and Dutch half-hour clock expressions. Health practice uses fictional symptom/onset details and clarification requests, with no medical advice. Each transfer changes details rather than copying the dialogue. Read `docs/SCENARIOS.md` for exact constraints.
- Lesson/reading inventories and audio IDs are unchanged. All ten A1 units remain partial. No real MP3s are generated in this batch; Azure configuration and actual listening approval remain necessary. Paid exams remain deferred.

## Expanded A1 course handoff (PR #18, 2026-09-28)

The owner requested all A1 work in this same PR. This section supersedes earlier inventory snapshots; do not open a separate PR for this batch.

- 53 lessons / 343 phrases / 192 lesson questions; all 53 enriched with 318 lexical/form notes and 106 production tasks. Twelve new lessons fill pronouns/questions, articles/possession, daily-action order, food, clothing/colours, preferences/negation, directions, describing people, household actions, occupations, modal verbs and body/feelings. Previously merged lesson/phrase records are unchanged except display numbers.
- `/a1-practice` and `/a1-practice/[slug]` add ten unit packs and a cumulative free review. `src/data/a1-practice.json` contains 11 new readings, 11 distinct connected listening passages, 48 evidenced questions, 11 writing tasks and 11 oral/partner tasks. The separate reading library then had 17 texts/60 questions; scenarios stay at 10/40/10. Do not double-count these banks or call the free final review a paid/validated exam.
- `PassageListening` unlocks questions after successful playback completion or explicit assistance. Stop/error/stale events cannot unlock. Model/evidence-based retries are assisted. Restart/navigation/reload clear answers. No microphone capture, speech recognition, recording, account writes or CEFR scoring are added.
- `/grammar` groups existing grammar notes and four foundation tables. `/pronunciation` renders 13 drills with explicit unreviewed-device-audio limits. The travel pack includes a semantic timetable and accessible SVG map. Read `docs/A1_COMPLETION.md` before making completion/readiness claims.
- `audioSources` is shared by generation, review, integrity checking and content validation. It adds passages and drills to the immutable lesson IDs and rejects duplicate IDs. Inventory: 367 audio sources × four variants = 1,468 clips; none generated or approved. Alphabet generation uses explicit character SSML. Listen to actual sounds/letters before approving any clip.
- Existing phrase playback still defaults to 30 seconds; connected passages can request a bounded 90-second timeout. Tests cover timeout without false completion. `ReadingQuiz` accepts custom heading/description and a retry callback; original reading behavior remains unchanged.
- Automated checks cover schema, every thematic pack, cumulative coverage, evidence, answer keys, sound/grammar contracts, stable audio hashes, discovery, complete mobile practice, missing voices, assistance/retries, resets and storage isolation. They do not prove pronunciation quality or independent linguistic validity.
- Authored practice now exists across the ten themes and five skill activities, but **the A1 production release is not complete**: real approved audio, independent language/pedagogy review and observed learner performance remain unverified. Do not erase those gates to satisfy the owner's completion request. Paid exams and A2 remain deferred.

### Post-expansion editorial handoff (current)

PR #19 contains both the core-lesson sequence pass and the complete detailed review requested on 2026-09-29. See `docs/A1_EDITORIAL_REVIEW.md` and `docs/A1_DETAILED_REVIEW.md`. All 318 enrichment notes, 106 lesson tasks, 17 readings/60 questions, ten scenarios/40 turns/ten transfer tasks and eleven integrated packs/48 questions/22 production tasks in that snapshot have been reviewed. The detailed ledger lists every record, corrections and exact file hashes for that reviewed state.

Corrections align prompts, models and checklists, complete numerical evidence, clarify vocabulary and translations, and make partner examples respond to changed plans. This is an AI-assisted editorial pass, not independent educator certification. No requested bank remained queued for that pass. Preserve stable IDs/answer keys and all 367 spoken sources while the owner generates recordings. Earlier handoff sections describe historical release snapshots; later enrichment waves must be tracked separately rather than silently treated as reviewed.

### Targeted practice review handoff

`docs/A1_TARGETED_REVIEW.md` describes question-level remediation for all 90 library reading and 90 integrated questions. Maintain `src/data/a1-review-links.json` when question IDs/objectives change; `validateReviewLinks` runs in content validation. Only checked mistakes produce suggestions; duplicate lesson links aggregate question numbers. Editing, retry, reload and navigation clear stale suggestions. Reading/listening remain separate, and listening assistance rules still apply. Server-only `getQuestionReviewLessons` projects current-question lesson titles/slugs into client props; never import the entire mapping/lesson bank into client code. Integrated navigation ends at the final review. The lesson/audio IDs and 367 spoken sources remain unchanged.

### PR #21 enrichment and follow-up review (current, 2026-10-03)

PR #21 is merged. Its single delivery includes the all-unit enrichment, integrated question expansion, final-review deepening and second writing/speaking tasks. Earlier references to separate PRs #22/#23 for those additions were incorrect. Current totals: 53 lessons / 343 phrases / 192 lesson questions; 338 enrichment notes / 116 lesson tasks; 27 readings / 141 notes / 90 questions; ten scenarios / 40 turns / ten transfers; eleven integrated packs / 90 questions / 22 writing tasks / 22 speaking tasks; 180 remediation mappings.

The complete focused editorial pass is in `docs/A1_ENRICHMENT_REVIEW.md`, including every added record and source hashes. It removes 17 repeated comprehension objectives, aligns prompts/models/partner cues, repairs Arabic explanations and clarifies readings. Keep all question IDs/answer indices and the 367 audio sources stable. Exact duplicate prompts within one reading/listening activity now fail validation; semantic duplication still requires editorial review.

A2 implementation is authorized by the owner's latest request. `docs/A2_CURRICULUM.md` defines the ordered proposal, first four-lesson slice, acceptance criteria and level-aware technical work. The first unit is now implemented; see the newer handoff below. Remaining units are planning only. A1's owner-managed recording approval and independent educator/learner validation remain separate release gates. Do not use A1 completion or the existing placement bank as A2 certification. Paid exams remain deferred.

### First A2 unit handoff (2026-10-03, current)

PR #22 is merged and its final CI passed. The owner authorized the next implementation step. Read `docs/A2_FIRST_UNIT.md` before editing this slice. A2 now has four lessons / 32 phrases / 16 questions, 24 lexical notes / eight lesson tasks, one reading / six notes / four questions, one four-turn scenario with transfer, and one integrated pack with three reading and three listening questions plus writing/partner tasks. UI labels it the first A2 unit, not a complete level or certified course.

`?level=A2` selects level-specific catalogue, progress, reading, scenarios, grammar and vocabulary; default URLs preserve A1. `/a2` is the new map; `/a2-practice` contains its integrated practice. Keep totals and recommendations within level (A1 53, A2 four), including previous/next links. `IntegratedPractice` is the shared server renderer for both route prefixes. Client catalogue/filter components are keyed by level to clear old filters.

A2 banks use separate `a2-*.json` files and stable prefixed IDs. `validateCourse` validates per-level resources; combined checks reject identity collisions. `content.ts` aggregates published lessons for API-known slugs, optional account import and phrase review. Storage keys, DB schema, auth boundaries and the A1 placement bank are unchanged. No automatic promotion, score or paid entitlement follows from completion.

`loadAudioInventory` is now the shared loader for generation, approval and checking: all 1,468 A1 jobs remain unchanged and first; 132 A2 variants follow (400 sources / 1,600 total). `--level=A1` or `--level=A2` scopes generation and strict completeness checks; approval always rebuilds the complete manifest so another level cannot be dropped. All authored A1 data and pronunciation overrides remain unchanged. Owner handles generation and listening review; no MP3s generated here. Read the revised `AUDIO_PRODUCTION.md` commands.

Continue with unit 2 after reviewing this slice; reuse the recent-activity patterns in work coordination. Independent educator/learner feedback and actual audio quality are still unverified. Paid exams remain deferred.

Validation: 60 native tests and all 128 unique Chromium end-to-end tests passed (run in three batches; the four A2 cases also repeated in the final batch). Content/audio checks, TypeScript and production build passed. Mobile (390px) catalogue and desktop map were inspected; no horizontal overflow. Local account coverage used disposable PGlite/SMTP; GitHub CI uses PostgreSQL.

### A2 unit 2 handoff (2026-10-04, current)

PR #23 is merged; its CI passed. `docs/A2_WORK_COORDINATION.md` now records the current delivery and internal editorial review. A2 has two units / eight lessons / 64 phrases / 32 lesson questions, 48 notes / 16 lesson tasks, two readings / 12 notes / eight questions, two four-turn scenarios with transfer, and two integrated packs (12 questions / two writing / two partner tasks). Earlier first-unit totals above are historical snapshots.

New unit `a2-work-coordination` teaches task progress, delay with `want`, polite clarification, and responsibility/deadlines (`voor`, `om`, `uiterlijk`). New lesson numbers are 05–08. Navigation now continues from unit 1 to unit 2 and ends there. Existing A1 authored data and every unit 1 record remain unchanged. A1 progress remains out of 53; A2 is now out of eight. Keep level labels and counts data-driven as units grow.

Audio now totals 433 sources / 1,732 variants (A1 1,468; A2 264). The 1,600 previously planned requests retain their exact synthesis content and filenames; the unit 1 passage can shift in list order, which is not an identity. A native fingerprint regression protects its 132 requests. No recording generation or approval was performed; the owner remains responsible. Paid exams stay deferred.

Next planned unit is housing/services, recycling past events, reasons, clarification and time agreements. External educator review, learner feedback and audio quality remain unverified; neither eight lessons nor completion percentages constitute A2 certification.

Validation for unit 2: 61 native tests and 41 focused Chromium tests passed, plus content/audio checks, TypeScript and production build. Mobile partner practice and desktop unit map visually checked. The full CI suite runs on the PR.

### A2 unit 3 handoff (2026-10-04, current)

PR #24 was still open (not merged) when the owner requested the next step. Its original head `219331c` passed CI. Unit 3 is a follow-up on the same PR, not a duplicate request. Read `docs/A2_HOUSING_SERVICES.md` for the current inventory, editorial scope and source facts. Earlier unit totals above are historical snapshots.

A2 now has three units / 12 lessons / 96 phrases / 48 lesson questions, 72 lexical notes / 24 lesson tasks, three readings / 18 notes / 12 questions, three four-turn scenarios with transfers, and three integrated packs (18 comprehension questions / three writing / three partner tasks). New lesson numbers 09–12 belong to `a2-housing-services`: report recurrence/onset, compare observed conditions, negotiate a repair window, and distinguish resolved from unresolved problems. A callback is not a confirmed visit; a time window is not an exact arrival hour. Housing examples are fictional language tasks, not technical or legal advice.

All existing A1 files and every A2 unit 1–2 record remain unchanged. Navigation continues to unit 3 and stops there; progress totals are A1 53 / A2 12. Browser tests now derive general catalogue/grammar counts from data but explicitly verify the new 09/12 boundary and endpoint behavior. No account schema, storage key, placement or score changes.

Audio: 466 sources / 1,864 variants, including 396 A2 variants. A new native fingerprint protects all 264 requests from the preceding two units, alongside unit 1 and A1 checks. No synthesis or approval took place; the owner handles recordings. Independent educator review and learner feedback remain outstanding. Paid exams stay deferred. Next planned unit: appointments/follow-up with guided reason clauses, comparing offers and confirming replacements.

Unit 3 validation: 62 native tests and 44 focused Chromium tests passed, plus content/audio checks, A2 dry-run planning, TypeScript and production build. Mobile lesson and desktop map visually inspected without overflow. Full CI runs on the updated PR.

### A2 unit 4 handoff (2026-10-04, current)

The owner requested appointments/follow-up explicitly. PR #24 was still open, and housing head `c880dce` passed full CI; this is another follow-up on the same PR. `docs/A2_APPOINTMENTS_FOLLOWUP.md` is now the current delivery inventory and internal editorial ledger. Older unit totals above are historical.

A2 now has four units / 16 lessons / 128 phrases / 64 lesson questions, 96 lexical notes / 32 lesson writing tasks, four readings / 24 notes / 16 questions, four four-turn scenarios with transfers, and four integrated packs (24 comprehension questions / four writing / four partner tasks). Unit `a2-appointments-followup` uses lesson numbers 13–16: explain conflicts with simple `omdat` clauses, compare alternatives, confirm replacements/early arrival, and follow up on unconfirmed requests. Receipt or a stated preference is not confirmation; a reply deadline is not a booked meeting; early arrival is not an earlier meeting start.

All A1 authored files and every A2 unit 1–3 record remain unchanged. A1 progress stays out of 53; A2 is out of 16. Navigation connects the fourth resources and stops at their endpoints. No schema, storage, account-import or placement changes. Audio totals are 499 sources / 1,996 variants (A1 1,468; A2 528). A regression fingerprint protects the 396 previous A2 requests, in addition to the earlier fingerprints. `--level=A2` selects the entire available level, not just the newest unit; its documentation now makes this explicit.

No recording generation or approval was performed. Independent language review and learner observation remain open; authored-unit counts are not proficiency percentages. Paid exams stay deferred. Next planned unit is shopping/choices, recycling comparisons and polite requests with demonstratives and quantities in unfamiliar purchase problems.

Unit 4 validation: 63 native tests and 47 focused Chromium tests passed; content/audio checks, A2 dry-run planning, TypeScript and production build passed. Mobile partner practice and desktop reading visually inspected with no overflow. Full CI runs separately on the updated PR.

### A2 unit 5 handoff (2026-10-04, historical)

PR #24 is merged at `e30b755`; its final head `285ffed` passed full GitHub CI. This delivery starts a new branch from main. `docs/A2_SHOPPING_CHOICES.md` is the current inventory and internal editorial ledger; earlier counts above are historical snapshots.

A2 now has five units / 20 lessons / 160 phrases / 80 lesson questions, 120 lexical notes / 40 lesson writing tasks, five readings / 30 notes / 20 questions, five four-turn scenarios with transfers, and five integrated packs (30 comprehension questions / five writing / five partner tasks). Unit `a2-shopping-choices` contains lessons 17–20: purchase problems, product comparison, quantities/unit prices, and confirming alternatives. Teach `dit/dat` with singular het, `deze/die` with singular de and plurals; compare with `dan`, distinguish sets from pieces, total from surcharge, available stock from ready/reserved orders, and requests from acceptance. Shop examples are fictional, not legal return policies.

All A1 files and all A2 units 1–4 records remain unchanged. Progress is A1 53 / A2 20; navigation connects the new resources and stops at their endpoints. Account/storage/placement contracts are unchanged. Audio inventory is 532 sources / 2,128 variants (A1 1,468; A2 660). The new regression fingerprint preserves all 528 earlier A2 requests exactly. The owner continues to handle generation and listening approval; no MP3 synthesis or approval was performed here.

Unit 5 validation: all 64 native tests and all 140 Chromium end-to-end tests passed, plus content/audio checks, A2 dry-run planning, TypeScript and production build. Mobile partner practice and desktop reading were visually inspected without horizontal overflow. Full GitHub CI runs separately on the new PR. Independent educator review and learner observation remain open. A2 is still an authored preview; paid exams stay deferred. Next planned unit is school/local messages with required versus optional actions, deadlines and short relevant replies.

### A2 unit 6 handoff (2026-10-05, historical)

The owner requested continuing in PR #25. Its shopping head `0bb9459` passed full CI; this is a follow-up on the same branch. `docs/A2_SCHOOL_LOCAL_MESSAGES.md` is the current inventory and internal editorial ledger. Earlier totals above are historical snapshots.

A2 now has six units / 24 lessons / 192 phrases / 96 lesson questions, 144 lexical notes / 48 lesson tasks, six readings / 36 notes / 24 questions, six four-turn scenarios with transfers and six integrated packs (36 comprehension questions / six writing / six partner tasks). Unit `a2-school-local-messages` contains lessons 21–24: school instructions, reply deadlines, form clarification and relevant replies. Preserve optional participation versus required reply/registration, lack of necessity versus prohibition, applicant-inclusive counts, optional fields, and event times versus response deadlines. The listening update requires a new reply only if participant count changes. All institutional examples are fictional.

All A1 files and all preceding A2 records remain unchanged. Progress is A1 53 / A2 24; navigation connects the new resources and stops at their endpoints. Account/storage/placement contracts are unchanged. Audio inventory is 565 sources / 2,260 variants (A1 1,468; A2 792). The new fingerprint protects all 660 previous A2 requests. No synthesis or approval was performed; the owner handles recordings.

Content/audio checks, A2 dry-run planning, all 65 native tests, all 143 Chromium end-to-end tests, TypeScript and production build passed locally. Mobile writing practice (390px) and desktop reading were visually inspected without horizontal overflow. The diff check passed. Full GitHub CI runs separately on the updated PR. Independent educator review and learner observation remain outstanding. A2 is still an authored preview; paid exams stay deferred. Next planned unit: travel and plans with `gaan`, routes, delays and alternatives.

### A2 unit 7 handoff (2026-10-05, current)

PR #25 is merged at `854589f`. This delivery starts a new branch from merged main. `docs/A2_TRAVEL_PLANS.md` is the current inventory and internal editorial ledger; earlier totals above are historical snapshots.

A2 now has seven units / 28 lessons / 224 phrases / 112 lesson questions, 168 lexical notes / 56 lesson tasks, seven readings / 42 notes / 28 questions, seven four-turn scenarios with transfers and seven integrated packs (42 comprehension questions / seven writing / seven partner tasks). Unit `a2-travel-plans` contains lessons 25–28: day-trip planning, route comparison, delay reporting and agreed alternatives. Teach action plans with `gaan`, present tense for schedules, meeting/departure/arrival, total duration including waiting, direct versus fastest, cancellation versus delay, estimated arrival versus certainty, and proposal versus acceptance. Scenario includes final walking time; listening changes transport/meeting and removes the old time buffer. All schedules are fictional.

All A1 files and preceding A2 records remain unchanged. Progress is A1 53 / A2 28; account/storage/placement contracts are unchanged. Audio inventory is 598 sources / 2,392 variants (A1 1,468; A2 924). New fingerprint protects the preceding 792 A2 requests. No synthesis or listening approval took place; owner handles recordings.

Content/audio checks, A2 dry-run planning, all 66 native tests, all 146 Chromium end-to-end tests, TypeScript, production build and diff checks passed locally. Mobile partner practice (390px) and desktop reading were visually inspected without horizontal overflow. Full GitHub CI runs separately on the new PR. Independent educator review and learner observation remain outstanding; A2 stays an authored preview and paid exams remain deferred. Next planned unit: social experiences/invitations, followed by a whole-sequence coverage audit before claiming complete A2.


### A2 unit 8 handoff (2026-10-06, current)

Unit 8 is authored on `feat/a2-social-invitations` from merged main after PR #26. Read `docs/A2_SOCIAL_EXPERIENCES.md` for the current inventory and editorial scope. The eight-unit sequence proposed in `docs/A2_CURRICULUM.md` is now authored, but this is **not** a claim of complete A2 proficiency coverage.

A2 now has eight units / 32 lessons / 256 phrases / 128 lesson questions, 192 lexical notes / 64 lesson tasks, eight readings / 48 notes / 32 questions, eight four-turn scenarios with transfers, and eight integrated packs (48 comprehension questions / eight writing / eight partner tasks). Unit `a2-social-experiences` contains lessons 29–32: share a short social experience, ask distinct follow-up questions, respond to an invitation with a reason/alternative, and confirm the accepted plan after changes.

The reception tasks distinguish event facts from opinions, known details from useful follow-up questions, an invitation from an accepted time, and initial proposals from final confirmation. The integrated listening update changes the start time, attendees, requested item and meeting detail from the written source; learners must use the newest information rather than preserve the original plan.

All A1 authored files and A2 units 1–7 remain stable. Progress is A1 53 / A2 32. Account/storage/placement contracts are unchanged. Audio planning becomes 631 sources / 2,524 variants (A1 1,468; A2 1,056). No synthesis or approval is performed here.

**Next work is not unit 9.** Run a whole-sequence A2 coverage audit first: descriptor/task coverage, progression, grammar recycling, repeated objectives, reading/listening difficulty, interaction breadth, writing demands and remediation. Decide from evidence whether A2 needs targeted additions before calling the authored level complete. Independent educator review, learner observation and real recorded audio remain open; paid exams stay deferred.


### A2 full coverage audit handoff (2026-10-07, current)

Merged PR #27 completed the proposed eight-unit / 32-lesson A2 authored sequence. The whole-sequence audit is now recorded in `docs/A2_FULL_COVERAGE_AUDIT.md`.

Decision: **do not add unit 9**. Domain coverage is already broad across personal, public, educational and professional use. Interaction, transactional reading/writing, reasons, comparisons, clarification and plan negotiation are well represented. The main gaps are cross-unit transfer, explicit relay/mediation to a third person, public-announcement listening variety, and a cumulative end-of-level task.

Next implementation should be one cumulative `a2-final-review` covering all eight unit IDs. It should combine a written source, a later spoken update that supersedes multiple details, evidence-backed comprehension, a short relay message to a third person, and a partner interaction requiring clarification, a reason/preference, a proposal and final confirmation. Include at least one public-announcement style listening source. Do not create a proficiency score/certificate.

After that pack, make only targeted reinforcement edits (2–3 relay tasks, listening variety, word-order/address consistency), then perform the full Dutch/Arabic editorial pass. Independent educator review, learner observation and real recorded audio remain separate release gates.


### A2 final integrated review handoff (2026-10-07, current)

The main structural action from `docs/A2_FULL_COVERAGE_AUDIT.md` is implemented on `feat/a2-final-integrated-review`. Read `docs/A2_FINAL_REVIEW.md` before changing A2 practice sequencing.

A2 remains eight units / 32 lessons / 256 lesson phrases / 128 lesson questions, 192 lexical notes / 64 lesson production tasks, eight readings and eight guided scenarios. Practice now has **nine packs**: eight unit packs plus cumulative `final-review`. The final pack covers all eight unit IDs and combines a practical written notice with a later public-announcement update, eight evidenced comprehension questions, two writing tasks (including explicit relay/mediation to a third person), and one partner task requiring clarification, reason/preference, proposal and final confirmation.

`validateCourse` now requires a cumulative `final-review` for every published level. For A2 the final pack is terminal navigation and must not write lesson-completion state or claim proficiency. The level page links to it explicitly and labels it as training rather than an exam/certificate.

The final review adds one connected listening source, so audio planning is A2 265 sources / 1,060 variants and combined A1+A2 632 sources / 2,528 variants. No synthesis or listening approval is performed in this delivery.

Do **not** add unit 9. After this PR passes full CI, proceed with targeted relay/listening reinforcement in 2–3 existing tasks, then run the complete Dutch/Arabic editorial consistency pass across all 32 lessons and nine A2 practice packs. Real audio, independent educator review and learner observation remain separate gates.


### A2 targeted mediation reinforcement handoff (2026-10-07, current)

After the cumulative final review, three existing lesson production tasks were revised to add spaced relay/mediation without changing lesson counts or the audio bank. See `docs/A2_TARGETED_REINFORCEMENT.md`.

- `a2-clarifying-instructions`: relay ordered work instructions to a colleague who missed them and request confirmation of understanding.
- `a2-writing-a-relevant-reply`: explain an organiser's current registration/laptop options to a sister who has not read the message, preserving allowed/available/required distinctions.
- `a2-reporting-a-travel-delay`: relay an expected arrival time and current meeting point to a third person without turning the estimate into a confirmed time.

The cumulative `final-review` already provides the missing public-announcement listening format, so earlier listening/audio sources remain unchanged. Counts remain A2 8 units / 32 lessons / 64 lesson production tasks / 9 practice packs and 265 spoken sources / 1,060 variants.

Next work: run the complete Dutch/Arabic editorial consistency pass across all 32 lessons and nine A2 practice packs. Do not add unit 9.
