# KNM: curriculum, practice and progress

## Authoritative basis and content inventory

The eight themes and 78 knowledge objectives are mapped to the amended KNM end terms in Staatscourant 2024, 15802, effective **1 July 2025**. DUO's current knowledge-exam information states a **45-minute** duration. Cito describes the revision as direct knowledge questions with photographs instead of introductory films. Sources were checked on **14 October 2026**; the consolidated Wetten site was unavailable to retrieval, so the published amendment and current DUO/Cito announcements form the version baseline. Do not invent a later curriculum or a DUO question count/pass threshold.

- 32 original bilingual lessons, four per official theme.
- 257 original three-option questions with Dutch/Arabic prompts and explanations.
- At least eight knowledge points, six vocabulary items and an authored everyday scenario per lesson.
- Four distinct 40-question forms: five questions per theme and coverage of each theme's four lessons within each form. Equal weighting and the 40-question count are **DutchFlow practice choices**, not confirmed DUO specifications.
- Every one of the 78 knowledge-objective IDs has linked lessons and at least one question. This is objective-level traceability, not a claim that every subindicator was independently audited or that a learner will pass.

The factual content is original educational writing. No commercial textbook, official exam items, official photographs or protected exam interface is copied. The timed forms are text-based; learners are linked to official DUO visual practice. There is no official score, certificate, paid entitlement or verified CEFR classification. KNM currently ships as free instructional practice within the no-payment preview; the broader paid independent-exam launch remains deferred.

## Sources and editorial decisions

`src/data/knm/curriculum.json` contains the source URLs, reviewed dates, themes and objective mapping. `lessons.json` contains the teaching content; `questions.json` is the answer bank, imported only by server modules and validation/tests. Sources and mapping are visible at `/knm/sources` and per lesson.

The published end terms simplify some legal/administrative rules. Supplementary current official sources preserve important distinctions:

- Starting a company while receiving benefits requires checking UWV/municipal conditions; KVK registration does not universally cancel all support.
- Municipal voting rights distinguish EU citizens and other foreign residents, including age/legal-residence conditions.
- Building insurance is commonly required by the mortgage lender, not a universal statutory obligation for every owner.
- Children’s physiotherapy and adult dental care have coverage conditions; the course does not promise unlimited reimbursement.
- Parents’ liability differs below age 14 and at ages 14–15.
- School attendance distinguishes compulsory attendance and qualification duty with exceptions.
- Donor registration explains the adult letter process and `geen bezwaar`, not automatic donation in every individual case.
- Naturalisation renunciation has exceptions; voluntary school contributions must not exclude children from extra activities.
- Current office-holder names are dated and linked to official profiles. Review these before release and whenever the government changes.

The internal editorial pass includes Dutch/Arabic meaning, one-best-answer wording, distinct relevant distractors, answer-key distribution and knowledge rather than stereotyped “best behavior” judgments. Qualified independent educator/native-speaker review and observation of real learners remain release-quality work, not something automated checks prove. Do not advertise DutchFlow as a DUO-approved method.

## Routes and learner flow

`/knm` is a searchable theme catalogue with the next unfinished lesson when progress is known. `/knm/lessons/[slug]` has fragment navigation, Dutch text with optional Arabic translations, vocabulary, a realistic scenario, quiz and sources. `/knm/exams` exposes the four forms, `/knm/progress` groups completion by theme, and `/knm/review` selects up to 20 saved wrong/unanswered questions. Discoverability is added to the existing learning-resource disclosure and exam page.

A quiz displays one question at a time, an answer count, flags, navigation and keyboard focus. Lesson/review submission requires answers for all selected questions; a timed form permits unanswered questions after explicit confirmation. The timer uses an absolute deadline, locks responses on expiry and allows explicit submission/retry. Results show Dutch/Arabic evidence and source-lesson links after submission, with no pass/fail cutoff. Arabic help is available only in lesson/review mode and is reported as assistance.

Timed drafts use `sessionStorage` under `dutchflow-knm-draft-v1:*`. Revision, account owner, question IDs/options, index, deadline and flags are checked before restoring. Invalid/stale drafts are discarded with an explanation. A draft is cleared after successful grading or explicit restart. This deadline is a practice convenience, **not** an authoritative proctored exam clock. Storage failures never claim a successful save; unknown account identity must not attribute an old attempt to a new account.

## Isolated persistence

The A1/A2 content, totals, `dutchflow-progress-v1`, `learning_progress` and audio inventory are unchanged. KNM has its own provider and storage contracts:

- Guests: `dutchflow-knm-progress-v1`, version 1, containing only known completed lesson slugs and question IDs needing review. No answer text, exam score or account snapshot is saved locally.
- Accounts: migration `002_knm_progress.sql`, with separate `knm_completed_lessons` and `knm_question_progress` tables and cascading user foreign keys. Apply through the existing idempotent/checksummed migration runner. Do not edit applied migrations.
- There is no automatic guest import when signing in. Account progress is held in memory and fetched from the authenticated endpoint. Signing out returns to the separate guest record.
- A perfect lesson quiz adds a free practice completion marker. Review or exam scores never award lesson completion. Later mistakes do not erase existing completion.
- Only questions attempted in a submitted selection update review state. Wrong and omitted questions are added; corrected questions are removed. Other pending mistakes remain.
- Last confirmed account submission wins for each question's review status; completion is union-only. This is not a spaced-repetition/mastery model.

`/api/knm/grade` validates the current revision, mode, selection and bounded answers and grades against the server bank. `/api/knm/review` projects only public question fields. `/api/knm/progress` checks the session and exact origin for mutations, accepts a guarded `expectedUserId`, recalculates results and transactionally writes only the session owner’s rows. Streamed JSON is bounded to 16 KiB. It never accepts client-provided scores/completion lists. All progress responses are private/no-store. Failure keeps static lessons accessible; KNM retries are explicit, without an offline write queue.

## Validation

`content:check` includes `validate-knm.mjs` for inventory, language fields, unique IDs/prompts/options, correct-index ranges, sources, references and all 78 objective mappings. Native tests exercise projection, four disjoint balanced forms, grading, incomplete answers and progress transitions. Browser tests cover discovery, all routes, Arabic help, mobile overflow, A1/A2 isolation, mistake review, timer/draft/flags, network/storage recovery, API tampering and real email-authenticated account separation/cross-device persistence.

Use the standard content/audio/native/type/build gates and the full Chromium suite before PR publication. Local E2E uses isolated PGlite; GitHub CI uses PostgreSQL 17. Neither proves accessibility in every assistive technology, real-device Safari behavior or independent pedagogical validation.

### Completed local verification

Content/audio checks, 75 native tests, TypeScript and production build passed. The full regression suite passed all 176 tests; after final pending-save/recovery refinements, a fresh build and all 10 focused KNM browser tests passed. The final CI inventory has 178 browser tests. Catalogue, lesson and exam screenshots were visually inspected at 320, 390 and 1280px, including horizontal overflow checks. GitHub CI with PostgreSQL remains the independent merge gate.
