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

- 32 lessons, 197 reusable phrases and 108 lesson questions; twelve separate readings with 40 comprehension questions.
- Every lesson and reading is mapped. All ten units now display **partial coverage** with explicit remaining work. No unit displays complete or a mastery percentage.
- New foundation lessons: `spelling-your-name`, `contact-details`, `asking-for-clarification`. Each has eight phrases, a contextual dialogue, a grammar note, four questions, six vocabulary/form notes and two self-review production tasks.
- `src/data/lesson-extensions.json` holds 108 vocabulary notes and 36 production tasks across 18 lessons. Nouns include an article and plural; verbs include selected present-tense forms; examples reference phrases from the same lesson. This is a growing lexical support layer, not a complete searchable dictionary.
- The foundation release added 24 phrase IDs; the numbers/time release adds another 16; the leisure/plans release adds another 24; the family/school release adds another 16; the services/messages release adds another 16. New phrase IDs automatically join listening, model-recall writing, review eligibility and the audio generation plan. The original 101 IDs and spoken texts are preserved by a fixture test. Display lesson numbers change; completion remains keyed by slug. Historical completion now uses a denominator of 32 lessons.
- The two production tasks per enriched lesson offer a temporary text area, hidden model answer, Arabic meaning and review questions. Learners reuse structures with fictional details or combine known expressions. Multiple answers may be valid; there is no automatic judgment, score, mastery claim or completion write. Reload or route navigation resets answers. These tasks are separate from exact lesson-wording recall at `/writing` and do not record speech.
- Listening still uses device TTS when MP3s are absent; connected listening passages, spoken interaction and assessed pronunciation remain missing. Spelling text does not constitute an alphabet pronunciation course. Have an editor listen especially to spelled letters, numbers and postcodes before publishing audio.

## Numbers and time expansion

`dates-and-calendar` introduces calendar dates, month names in lowercase, `op` with a particular date and `in` with a month. `weekly-routine` contrasts frequency (`hoe vaak`) with clock time (`hoe laat`), quarter-past/quarter-to expressions and subject/verb order after a time phrase. Each has eight phrases, four questions, six lexical notes and two self-review tasks. The existing numbers/age and time/day lessons each gain six notes and two tasks; their spoken phrases and IDs remain unchanged.

The original reading `a-week-of-language-lessons` requires learners to combine a start date, two weekly class days, morning start/end times and different activities after class. Four questions distinguish a 90-minute lesson from 30 minutes of separate practice. A dedicated browser test exercises the fourth required answer and regrading of the duration answer. This is guided reading, not a listening assessment.

The lexical notes explicitly distinguish singular forms used in quantities (`dertig jaar`, `negen uur`, `twee keer`) from the dictionary plurals. Productive tasks change people, numbers, dates or times instead of treating exact recall as the only valid answer. Number and month coverage remains partial, and no claim of complete unit mastery is made.

## Leisure and plans expansion

`free-time-hobbies` covers everyday hobbies, `graag` with an activity and a simple shared suggestion. `weather-today` adds basic weather descriptions, `het` in weather expressions, and practical responses such as taking a coat or preferring to stay inside. `invitations-and-plans` introduces invitations, acceptance/decline, meeting time and place, and `Zullen we ...?` for a shared plan.

These three lessons add 24 phrases, 12 graded questions, 18 lexical notes and six self-review tasks. The reading `a-saturday-park-plan` ties hobbies, weather and an invitation into one short unseen plan with four evidenced questions and a separable-verb grammar note. The unit is still partial because it lacks reviewed connected listening, a short original writing task with feedback beyond self-review, and an oral role-play on changing plans.

## Family and school expansion

`family-at-home` adds immediate family members, who lives together, and simple questions about children. `message-to-school` adds a short school-absence message, a request to send homework, and a basic follow-up question about returning tomorrow. The existing `school-and-family` lesson now sits within a fuller unit instead of standing alone.

This expansion adds 16 phrases, eight graded questions, 18 lexical notes and six self-review tasks across `school-and-family`, `family-at-home`, and `message-to-school`. The new reading `a-message-about-absence` adds a second family/school text with four evidenced questions and a `dus` grammar note. The unit remains partial because it still needs reviewed listening, shorter original message-writing with feedback beyond self-review, and a direct interaction task with school staff.

## Services and messages expansion

`filling-in-a-form` adds basic form language for personal details, date of birth, signatures and asking for field clarification. `changing-an-appointment` adds rescheduling, availability, confirmation by e-mail or sms, and practical follow-up language. The existing `municipal-appointment`, `phone-calls`, and `letters-and-messages` lessons now also have vocabulary/form notes and self-review tasks.

This expansion adds 16 phrases, eight graded questions, 30 lexical notes and ten self-review tasks across five lessons. The new reading `a-missing-document-message` adds a first services/messages text with four evidenced questions and an `om ... te` grammar note around arranging a new appointment. The unit remains partial because it still needs reviewed voicemail listening, shorter original message-writing with feedback beyond self-review, and a direct role-play for changing an appointment or completing missing documents.

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

`content:check` validates IDs, goal text, coverage, resource links, vocabulary forms, same-lesson examples and production fields. Mutation tests verify rejection; browser tests cover discovery, curriculum navigation, model reveal, input limits, resets, original progress, new phrase review and mobile overflow. These tests establish structural and behavioral integrity, not language accuracy.

## Next delivery

Review the new services/messages content and validate recorded phrase audio for forms, appointment changes and message details. Continue expanding health and work units with the same lesson-reading-enrichment pattern, then add connected listening and oral tasks across the map. Use the readiness gates above to deepen each unit before adding A2 labels or opening paid examinations.
