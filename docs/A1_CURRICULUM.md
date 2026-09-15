# A1 curriculum plan and coverage

## Purpose and scope

Build a coherent practical beginner course for Arabic-speaking learners. `src/data/a1-roadmap.json` is the ordered thematic map shown at `/curriculum`; each unit defines communicative goals, real lesson/reading links, and remaining work. The ten themes are our editorial organization, not official CEFR units. The four existing catalogue modules remain broad browsing groups; their IDs and saved lesson slugs are unchanged.

Use the Council of Europe's [global scale](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale) and [descriptor search](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search) when refining outcomes with a language educator. A1 involves basic everyday expressions, personal details and simple interaction with a helpful interlocutor. Do not infer a CEFR level from lesson counts, word counts, quiz scores, or this map. A qualified educator still needs to verify descriptor alignment and curricular completeness.

## Candidate sequence

| Unit | Communicative focus | Supporting language to teach and recycle | Independent task to build |
| --- | --- | --- | --- |
| 1. Introducing yourself | Names, origin, contact details, clarification | Personal/possessive pronouns; basic questions; `zijn`, `heten`, `wonen`; alphabet and spelling | Register for a class, correct a detail, request clarification |
| 2. Numbers and time | Age, appointments, daily routine | Numbers, days, months, clock time; present tense; main-clause order | Understand a new schedule and describe a day |
| 3. Family and school | Family relationships, school messages | Kinship, pronouns, articles, plurals and simple descriptions | Read a school message and write a short reply |
| 4. Home and neighbourhood | Rooms, neighbours, repairs | Furniture, places, prepositions; introductory `er is/er zijn`; negation | Describe a room and request a repair |
| 5. Food and shopping | Requests, quantities, preferences, prices | Food/clothing vocabulary; quantities; `willen`, `graag`, `niet/geen` | Make a shopping list and complete a purchase |
| 6. Travel and directions | Routes, tickets, departures | Directions, transport, time questions, simple instructions | Plan a short trip from a new timetable |
| 7. Health and care | Simple symptoms, appointments, clarification | Body vocabulary, `hebben`, duration expressions and polite questions | Describe a basic problem and ask for repetition |
| 8. Services and messages | Forms, calls, short requests | Personal information, separable verbs, dates, message conventions | Fill a fictional form and request a different appointment |
| 9. Work and tasks | Job, shift, instructions, help | Jobs, tools, sequence words, present tense, imperatives | Follow simple instructions and ask a colleague for help |
| 10. Leisure and plans | Hobbies, weather, invitations | Preferences, simple weather expressions, `kunnen/willen`, time/place | Arrange an activity, accept or decline an invitation |

This table is a development plan. It does not claim that every listed language point or independent task is already implemented. Health examples teach language, not diagnosis or medication use.

## Coverage at this release

- 23 lessons, 125 reusable phrases and 72 lesson questions; eight separate readings with 24 comprehension questions.
- Every lesson and reading is mapped. Units with resources display **partial coverage**; the leisure unit has no linked resources yet and displays **planned**. No unit displays complete or a mastery percentage.
- New foundation lessons: `spelling-your-name`, `contact-details`, `asking-for-clarification`. Each has eight phrases, a contextual dialogue, a grammar note, four questions, six vocabulary/form notes and two self-review production tasks.
- `src/data/lesson-extensions.json` holds the 18 vocabulary notes and six production tasks. Nouns include an article and plural; verbs include selected present-tense forms; examples reference phrases from the same lesson. This is the first set of lexical notes, not a complete searchable dictionary.
- The 24 new phrase IDs automatically join listening, model-recall writing, review eligibility and the audio generation plan. The original 101 IDs and spoken texts are preserved by a fixture test. Display lesson numbers change; completion remains keyed by slug. Historical completion now uses a denominator of 23 lessons.
- The two production tasks per new lesson offer a temporary text area, hidden model answer, Arabic meaning and review questions. Learners reuse structures with fictional details or combine known expressions. Multiple answers may be valid; there is no automatic judgment, score, mastery claim or completion write. Reload or route navigation resets answers. These tasks are separate from exact lesson-wording recall at `/writing` and do not record speech.
- Listening still uses device TTS when MP3s are absent; connected listening passages, spoken interaction and assessed pronunciation remain missing. Spelling text does not constitute an alphabet pronunciation course. Have an editor listen especially to spelled letters, numbers and postcodes before publishing audio.

## Definition of readiness for each unit

1. A qualified Dutch/Arabic educator reviews the outcomes, language, translations, examples, distractors and ordering. Replace vague goals with tasks that can be observed in use.
2. Reading: include a new short text with explicit and simple inferred meaning questions; the learner should not need to recall a memorized answer.
3. Listening: include a reviewed recording with new details, a transcript for later feedback, and questions answered before revealing text. Hearing phrase translations alone does not satisfy this gate.
4. Production: include a short original written task and an oral role-play with observable criteria, multiple valid examples and meaningful feedback. Self-review models are preparation for this gate.
5. Vocabulary and grammar: recycle target forms across several contexts and later units; record gaps in the map. Add scheduled review separately rather than equating lesson completion with retention.
6. Assessment: an unseen cumulative task combines earlier goals. Pilot it with learners and review ambiguity and difficulty before making any proficiency or paid-exam claim.

The course-level A1 release requires an educator-reviewed coverage matrix across reading, listening, written production, spoken production and interaction, plus representative assessment evidence. This document is the initial map, not that completed verification.

## Authoring and technical contract

Keep one primary thematic assignment for each lesson and at least one assignment for every reading. Planned units use empty resource arrays, never links to nonexistent pages. Keep nonempty `remaining` entries while coverage is partial. Update the map whenever a resource is added.

Vocabulary `kind` is `noun`, `verb` or `expression`. `forms` contains the plural or selected useful forms, not an automatically generated conjugation table. `phraseId` must belong to the linked lesson; an editor must check that it illustrates the word. Production models fit the 500-character input limit and include Arabic translation plus at least two self-review questions. Do not collect real personal data in sample tasks.

The map and vocabulary render on the server. Only the current lesson's production tasks enter `ProductionPractice`; answers use component state only. No new dependencies, storage keys, account fields, payments or migrations are introduced. All regular content remains free.

`content:check` validates IDs, goal text, coverage, resource links, vocabulary forms, same-lesson examples and production fields. Mutation tests verify rejection; browser tests cover discovery, planned-unit navigation, model reveal, input limits, resets, original progress, new phrase review and mobile overflow. These tests establish structural and behavioral integrity, not language accuracy.

## Next delivery

Review the foundation content and validate recorded alphabet/phrase audio. Then expand numbers/time and family vocabulary with connected listening and additional written tasks. Use the readiness gates above to deepen each unit before adding A2 labels or opening paid examinations.
