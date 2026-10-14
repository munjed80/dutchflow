# KNM: curriculum, practice and progress

## Authoritative basis and content inventory

The eight themes and 78 knowledge objectives are mapped to the amended KNM end terms in Staatscourant 2024, 15802, effective **1 July 2025**. DUO's current knowledge-exam information states a **45-minute** duration. Cito describes the revision as direct knowledge questions with photographs instead of introductory films. Sources were checked on **14 October 2026**; the consolidated Wetten site was unavailable to retrieval, so the published amendment and current DUO/Cito announcements form the version baseline. Do not invent a later curriculum or a DUO question count/pass threshold.

- 40 original bilingual lessons, five per official theme: 32 core lessons and eight expanded application lessons.
- 353 original three-option questions with Dutch/Arabic prompts and explanations.
- At least eight knowledge points, six vocabulary items and an authored everyday scenario per lesson.
- Four core 40-question forms: five questions per theme and coverage of each theme's four core lessons within each form. Each form samples one question from all four core lessons and a second question from the first lesson of each theme; across the four disjoint forms all eight questions of those introductory lessons appear, including the visual contexts. Equal theme weighting and the 40-question count are **DutchFlow practice choices**, not confirmed DUO specifications.
- Four additional comprehensive 40-question forms sample one question from each of the 40 lessons. They are disjoint from each other, but deliberately repeat some core-form questions; all eight forms are not mutually disjoint.
- Every one of the 78 knowledge-objective IDs has linked lessons and at least one question. This is objective-level traceability, not a claim that every subindicator was independently audited or that a learner will pass.

The factual content is original educational writing. No commercial textbook, official exam items, official photographs or protected exam interface is copied. The timed forms combine text with eight original SVG/document-style contexts, one per theme. These are teaching illustrations, not the photographic format of the official exam; learners are linked to official DUO visual practice. Each context has visible Dutch text, a Dutch accessible description and optional Arabic help in lesson/review mode. The same context appears in post-submission feedback. There is no official score, certificate, paid entitlement or verified CEFR classification. KNM currently ships as free instructional practice within the no-payment preview; the broader paid independent-exam launch remains deferred.

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

`/knm` is a searchable theme catalogue with the next unfinished lesson when progress is known. `/knm/lessons/[slug]` has fragment navigation, Dutch text with optional Arabic translations, vocabulary, a realistic scenario, quiz and sources. `/knm/exams` exposes eight forms, `/knm/progress` groups completion by theme, and `/knm/review` offers saved wrong/unanswered questions by theme in sessions of up to 5, 10 (default), or 20 items. Progress links to each theme’s saved mistakes; with no pending mistakes it recommends the next unfinished lesson or an exam. The catalogue provides a short-review link whenever known progress contains mistakes. Discoverability is added to the existing learning-resource disclosure and exam page.

A quiz displays one question at a time, an answer count, flags, navigation and keyboard focus. Lesson/review submission requires answers for all selected questions; a timed form permits unanswered questions after explicit confirmation. The timer uses an absolute deadline, locks responses on expiry and allows explicit submission/retry. Results show named themes, a filter for wrong/unanswered questions, Dutch/Arabic evidence and source-lesson links after submission, with no pass/fail cutoff. Arabic help is available only in lesson/review mode and is reported as assistance.

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

Content/audio checks, 76 native tests, TypeScript and a fresh production build passed. All 11 focused KNM browser tests passed. The full browser run passed all 179 permanent tests plus one temporary screenshot inspection case (180 total); that inspection case is not part of the committed CI inventory. The original PR head also passed GitHub CI. Visual contexts were checked for overflow at 320, 390 and 1280px, and cv/dike screenshots were inspected at 390px. GitHub CI with PostgreSQL remains the independent merge gate.

### Visual/editorial follow-up (revision v2)

Eight question contexts were revised for specific everyday situations, bilingual equivalence and more relevant alternatives: a cv, appointment card, housing search, GP contact, dike diagram, phishing message, parliamentary debate and transition after group 8. IDs and tested knowledge remain stable; the content revision changes so old timed drafts cannot resume against a changed form. The public visual projection explicitly whitelists fields and never embeds answer keys. This is a focused internal editorial pass, not independent review of the entire bank.

## Guided review follow-up

Review selection uses public lesson/question-ID metadata, without client answer-bank imports. Counts and lesson links require known progress. Saved order is preserved, stale/duplicate IDs are excluded, and only the frozen submitted batch updates review state. A valid `?theme=` link preselects the theme; an unknown value falls back to all themes with an explanation. An empty filtered theme offers a return to all mistakes, without implying mastery.

Requests are aborted on account, filter, size changes and unmount; generation/owner/readiness checks prevent a stale response from opening a session. Lesson completion, grading, persistence schema and content revision are unchanged. Review starts with “ابدأ مراجعة الأسئلة” rather than the lesson-training label.

Guided-review validation: content/audio checks, 77 native tests, TypeScript and a fresh production build passed. The initial complete browser run passed 180 of 181 cases and found one header overflow at 721px. After tightening only intermediate-width navigation spacing, a fresh build and all 17 KNM/general-learning-UX browser tests passed, including the corrected 320/390/721/1280 catalogue checks. The 390px guided-review screenshot was visually inspected. The final CI inventory contains 181 cases; the complete local suite was not repeated after this localized CSS fix.

## Expanded application lessons (revision v3)

Eight additional 22-minute teaching estimates cover work/illness/privacy, neighbours/social participation, moving/household costs, care conversations/coverage, geography/water/travel, official letters/safe help, civic rights/voting and parent-school support. Each has 12 bilingual knowledge points, 12 original questions with relevant alternatives, eight vocabulary entries, one contextual scenario and four bilingual dialogue turns. The catalogue marks these as expanded application lessons and lesson fragment navigation includes the dialogue.

Original 32 lessons and 257 questions remain identical as parsed objects, including IDs and answer keys. New lessons are appended as numbers 33–40; existing completion stays valid while the denominator becomes 40. `examLessonSlugs` fixes the four core lessons per theme; `applicationExamLessonSlugs` lists all five for the additional comprehensive forms. The content revision invalidates older timed drafts. No new database migration, A1/A2 content/audio or progress contract is introduced.

All objectives remain linked. Moving includes a cross-theme link to official BRP objective 6.2.1; this is intentional, rather than assigning address registration to the housing objective alone. Supplementary official sources clarify medical confidentiality, GP/extra-testing costs, moving deadlines, safe DigiD authorisation, objections/debt support, foreign-resident voting requirements and ordinary-school versus internationally-oriented expat-school contribution rules. The AP page rejected full retrieval (403); its indexed official text and the government Arboportaal corroborated the narrow workplace-privacy statements. Independent native-speaker/educator review remains pending; this expansion does not certify every official subindicator or reproduce DUO's photographic format.

Expanded-curriculum validation: content/audio checks, 79 native tests, TypeScript and a fresh production build passed. All 15 focused KNM browser cases passed; after final source/wording refinements the complete 183-case browser suite passed. Tests cover all 40 lesson routes, eight exam routes, new dialogues and 320/390/721/1280 layouts, twelve-question grading, preserved legacy completion, private projection and comprehensive exam selection. A 390px parent-school dialogue screenshot was visually inspected.
