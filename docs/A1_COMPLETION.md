# A1 authored course scope and release gates

## Owner request and honest status

On 2026-09-28 the owner requested A1 completion within PR #18. This expansion supplies the missing authored learning materials and a free integrated practice layer. It does **not** certify A1 mastery or claim that real audio and independent pedagogical validation are complete.

The [Council of Europe global scale](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale) and [activity descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search) inform the scope: personal information, concrete daily needs, simple questions/instructions and supported interaction. They are framework references, not an endorsement, fixed vocabulary quota or official Dutch syllabus. Coverage below is our authored resource mapping; alignment and difficulty still require an educator review.

## Current inventory

| Resource | Quantity | Where |
| --- | ---: | --- |
| Enriched lessons | 53 | `/learn` |
| Reusable lesson phrases | 343 | Lesson, listening, recall-writing and review flows |
| Lesson questions | 192 | Lesson quizzes |
| Lexical/form notes | 338 | Lessons and `/vocabulary` |
| Lesson production tasks | 116 | Lesson enrichment |
| Reading-library texts/questions | 27 / 90 | `/reading` |
| Guided scenarios/turns/transfer tasks | 10 / 40 / 10 | `/scenarios` |
| Integrated unit packs + final review | 10 + 1 | `/a1-practice` |
| New reading sources / connected listening passages | 11 / 11 | Integrated packs (separate from reading library) |
| Integrated comprehension questions | 68 | Explicit source evidence |
| Additional writing / oral-partner tasks | 11 / 11 | Integrated packs |
| Grammar reference notes / foundation tables | 53 / 4 | `/grammar` |
| Alphabet and sound drills | 13 | `/pronunciation` |
| Planned audio sources / variants | 367 / 1,468 | Generation inventory |
| Approved real MP3s | 0 | Service credentials not configured |

Numbers measure resources, not learning hours, skill percentages or level attainment. The free final review has eight comprehension questions plus writing and speaking, with no combined pass/fail, certificate, stored result or payment.

## Coverage matrix

Each unit now has lessons, a reading-library text, a guided text scenario, a new integrated reading/listening source, a writing transfer and an oral/partner task. Route `/a1-practice/<unit-id>` uses the IDs below; `/a1-practice/final-review` combines new details from several themes.

| Unit ID | Communicative coverage | New language support |
| --- | --- | --- |
| introducing-yourself | Introduce, give fictional details, ask, clarify | Pronouns, regular present forms, zijn/hebben, questions, articles, possession, spelling |
| numbers-and-time | Read dates/times, describe routine, negotiate availability | Numbers, time versus duration, inversion, separable actions, en/maar/want |
| family-and-school | Describe family/person, read school information, report absence | Kinship, appearance, age, adjective/possessive use, singular/plural |
| home-and-neighbourhood | Locate objects, describe rooms, request a repair | er is/zijn, position/action verbs, prepositions, object pronouns, household actions |
| food-and-shopping | Choose food/clothing, quantities, prices, alternatives | Food/drinks/colours, articles/adjectives, count/mass quantities, graag/liever, niet/geen |
| travel-and-directions | Plan a fictional journey, follow a map, ask route | Timetable plus walking duration, accessible route map, directions, imperative, transfers |
| health-and-care | Describe a fictional symptom/onset and ask clarification | Body vocabulary, feeling expressions, plain-language requests; no treatment advice |
| services-and-messages | Read form/voicemail, request and confirm changes | Required versus optional information, personal fields, question and message patterns |
| work-and-tasks | State occupation, follow order, request assistance | Occupations/workplaces, present tense, first/then, demonstrative requests |
| leisure-and-plans | Express preferences, invite, negotiate time/place | Hobbies/weather, ability/permission/obligation/wishes, short proposals and alternatives |

The four grammar foundation tables collect present tense, question words, noun/plural spelling examples, and pronouns/possession. Lesson notes additionally cover modal and separable verbs, main-clause order, negation, adjective inflection, time/place prepositions and basic conjunctions. These beginner patterns deliberately avoid pretending to explain every Dutch exception.

## Practice contract

- Read a new short source before answering; optional Arabic translation is assistance. Questions cite exact Dutch evidence, sometimes requiring time/quantity calculations across sentences.
- Connected listening is distinct from the lesson phrase bank and the pack's reading text. Playback must end before questions unlock; an explicit text-help action also unlocks but marks assistance. Failed, stopped and stale events never count as complete listening.
- Answer checking reveals evidence. Changing answers or retrying after feedback becomes text-assisted; the first check remains the result of that attempt, with no persisted score. Restart clears local session state and does not imply the material is now unseen.
- Writing prompts change details and include models plus concrete self-review criteria. Multiple correct formulations are possible; no arbitrary exact-match correctness is imposed on original writing.
- Speaking instructions support solo rehearsal and human partner role-play, including clarification and changed details. Learners compare whether intended information was understood. No microphone is accessed; no automated speech or pronunciation grade exists.
- All practice is free and memory-only. The bank is public learning material, including answers/models; never reuse it as a secure paid exam bank. Existing lesson completion remains separate and self-reported.

## Compatibility and editorial checks

All pre-expansion lesson slugs, phrase IDs and Dutch texts remain unchanged. Only display numbers change as lessons are inserted into their module groups. Reading/scenario identities and answer keys remain stable; their editorial corrections are recorded in `A1_DETAILED_REVIEW.md`. Placement questions are unchanged. Additional audio IDs are disjoint from lesson/review IDs. Shared source planning ensures approval/generation/integrity checks agree.

The core and detailed editorial passes recorded in `A1_DETAILED_REVIEW.md` remain complete for the pre-2026-09-30 bank snapshot they reviewed. The later all-unit enrichment wave adds new reading texts, extra integrated questions, and additional lesson enrichment that still needs its own focused editorial follow-up. Automated checks establish structure/behavior, not independent linguistic sign-off. Fictional prices, schedules, map and personal data must stay clearly fictional.

## Unfinished release gates — do not relabel as complete

1. **Recorded audio:** configure Azure Speech privately, generate a representative sample, validate Dutch sounds/letters/times, generate the bank, listen and approve. No real MP3s exist yet. The strict release check must pass for all 1,468 variants. Device speech is a fallback, not reviewed recorded audio.
2. **Independent language/pedagogical review:** review the full source banks and descriptor coverage, including Arabic translations, distractors, progression and task difficulty. No qualified external sign-off occurred in this PR.
3. **Learner performance validation:** observe independent writing and spoken interaction with real learners, give feedback and adjust tasks. Self-review criteria and model answers are teaching support, not evidence of successful acquisition.

Course-content breadth has been expanded in this PR; a fully reviewed multimedia A1 release remains blocked by these concrete external steps. Account/hosting/privacy launch readiness is a separate project concern and paid exams remain deferred.

## Practice follow-up polish

All 158 library/integrated comprehension questions now have authored links to relevant A1 lessons. Checked mistakes produce deduplicated suggestions with question numbers; changed answers and resets clear stale advice. Pack navigation continues through the final review. See `A1_TARGETED_REVIEW.md`. This improves the learning loop without adding assessment claims or changing the lesson/audio bank.
