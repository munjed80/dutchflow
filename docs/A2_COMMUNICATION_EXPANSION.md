# A2 communication expansion: 48 connected lessons

Updated 15 October 2026, based on merged PR #40 (`760707b`). This expands the existing eight units rather than adding a ninth domain. The earlier course audits remain dated snapshots; this document describes the new inventory and its focused internal review.

## Problem and design

The forty-lesson path already rehearses changing arrangements and confirming details well. More copies of that interaction would add volume without much breadth. The sixth lesson in each unit therefore introduces a distinct communicative demand: background information, specific constructive feedback, local permission/obligation, symptoms and clarification, procedural instructions, course enquiries, announcements and polite disagreement.

Council of Europe [A2 descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors) and the [2020 Companion Volume](https://rm.coe.int/16809ea0d4) inform the focus on familiar exchanges, simple descriptions, asking for clarification, goods/services and practical information. These references do not prescribe this Dutch grammar sequence or validate DutchFlow's level. This is an authored design, not CEFR certification.

## Inventory

| Resource | Before | After |
| --- | ---: | ---: |
| Units | 8 | 8 |
| Lessons | 40 | 48 |
| Core Dutch/Arabic phrases | 320 | 384 |
| Lesson questions | 160 | 192 |
| Lexical/form notes | 240 | 288 |
| Lesson production tasks | 80 | 96 |
| Reading-library texts | 16 | 24 |
| Reading-library questions | 64 | 112 |
| Guided scenarios | 16 | 24 |
| Guided dialogue turns | 72 | 104 |
| Scenario transfer tasks | 16 | 24 |
| Cross-unit retrieval sets / tasks | 8 / 16 | 16 / 32 |
| Integrated packs, including final review | 9 | 9 |

The eight new readings also add eight open relay/application tasks with models and checklists. Every new lesson has four contextual examples, three collocations, two alternative formulations and two common-error contrasts, in addition to six lexical notes and two production tasks. Fifteen minutes is a teaching estimate, not an observed learner duration.

## Capability and linked practice

| Unit | Sixth lesson | New performance demand |
| --- | --- | --- |
| Recent activities | `a2-asking-about-someones-background` | Distinguish previous circumstances from a current state with `sinds`; ask a relevant follow-up |
| Work | `a2-giving-feedback-at-work` | Name a specific problem without generalising; ask for a practical improvement |
| Housing | `a2-explaining-shared-house-rules` | Distinguish `moet`, `mag niet` and `hoeft niet`; ask about local rules |
| Appointments | `a2-describing-symptoms-and-asking-for-help` | Describe a fictional location, onset and effect; request repetition/rephrasing |
| Shopping | `a2-asking-how-a-product-works` | Follow ordered steps and a condition; check understanding before acting |
| School/local messages | `a2-asking-about-a-course` | Ask about content, requirements and materials; separate enquiries from registration |
| Travel | `a2-understanding-travel-announcements` | Link the correct destination to an action; distinguish a changed platform from replacement transport |
| Social experiences | `a2-disagreeing-politely` | State a different preference with a reason, ask about another person's need and reach a conditional agreement |

Each sixth lesson is linked to one new reading with six questions and an original-response task, one four-turn guided scenario with a changed role and transfer task, and cross-unit retrieval anchored to exact collocations. The existing `/a2` study map and lesson resource links expose them automatically. New texts range from 99 to 110 words; difficulty comes from information relations and response demands, not length alone.

## Editorial checks and boundaries

The internal pass checks Dutch/Arabic parity, articles/plurals and verb forms, word order, one defensible answer, relevant alternatives, contiguous evidence containing needed premises, role/partner consistency and requested-detail coverage in models/checklists. Automated structure checks supplement this work; they cannot certify linguistic or pedagogical quality.

- Fictional local room rules and machine instructions are not universal Dutch rules or product manuals.
- Symptom descriptions and role-play calls are language practice. They do not supply diagnosis, treatment or a clinical access protocol.
- Announcement examples do not establish real timetables or universal ticket validity. Unknown information remains a question until an example explicitly answers it.
- An information evening, a trial lesson, an enquiry and confirmed course registration remain distinct.
- `sinds` with a continuing state is contrasted with a previous circumstance; no exhaustive past-tense system is introduced at once.
- Polite disagreement and specific feedback are modelled without presenting one fixed phrasing as the only valid free response.
- Reading and scenario alternatives are labelled as the appropriate response to the fictional role, not a judgement of a learner's character.

The cumulative integrated review remains unchanged and does not separately assess every new capability. The new linked reading, interaction and retrieval tasks provide application evidence for this expansion. Independent Dutch/Arabic educator review and learner observation remain outstanding.

## Mobile example layout

Visual inspection found index-free language-depth examples inheriting the mobile two-column phrase grid. Their single content child occupied its 24px index column, breaking Dutch sentences into letters without creating page overflow. Examples now use a scoped block layout, and their Dutch headings follow the LTR text direction. A browser assertion checks the actual text width relative to its card at 320, 390, 721 and 1280px. A local incremental build retained prerendered HTML pointing at the old CSS chunk, so final verification requires a clean production build.

## Compatibility, audio and progress

The original forty lesson slugs, phrases, keys and explanatory content are retained. Only their displayed sequence numbers change when a sixth lesson is inserted inside each unit. All prior extension objects, sixteen readings, sixteen scenarios, eight retrieval sets, nine integrated packs and 120 remediation mappings remain unchanged. A pinned native snapshot protects this baseline, excluding lesson numbering.

A learner with the previous forty lessons complete keeps all completions at 40/48 and resumes at the first new sixth lesson. New comprehension tasks use the existing review-link mechanism. Guided interaction, reading production and retrieval remain temporary/ungraded and do not award lesson completion. Account schema and guest keys remain unchanged; A1 and KNM data are untouched.

Sixty-four new controlled audio phrases add 256 planned variants. A2 now has 384 phrases plus nine connected passages: 393 sources / 1,572 variants. The combined inventory is 760 sources / 3,040 variants, with every previous request/hash/filename preserved. Language-depth examples, library readings and text scenarios do not silently enter the audio bank. No MP3 synthesis or approval is performed.

## Validation

Content/audio checks, all **83 native tests**, TypeScript and a clean production build passed. The complete **196-case Chromium inventory passed in two isolated shards (121 + 75)** on that clean build. This includes all new reading correction/relay flows, eight guided conversations with wrong-first retries, retained forty-lesson progress and A1/KNM separation. The mobile text-width guard passed at 320/390/721/1280px; the corrected 390px example panel was visually inspected. Earlier runs exposed obsolete catalogue count assumptions and the stale local CSS reference; these were resolved before the final complete run. GitHub CI with PostgreSQL is a separate merge check.
