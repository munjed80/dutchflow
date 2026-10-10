# A2 expansion to 40 lessons

Updated 2026-10-09. This expansion increases authored A2 depth **inside the existing eight units**. It does not add a ninth topical unit and does not change the eight unit practice packs or cumulative final review.

## Inventory after expansion

- 8 units
- 40 lessons
- 320 lesson phrases
- 160 lesson questions
- 240 lexical/form notes
- 80 lesson production tasks
- 8 reading-library texts
- 8 guided scenarios
- 9 integrated practice packs (8 unit packs + cumulative final review)

Audio planning becomes:

- A2 lesson phrases: 320
- A2 connected practice passages: 9
- A2 spoken sources: 329
- A2 variants: 1,316
- combined A1+A2 sources: 696
- combined variants: 2,784

No approved MP3s are added by this change.

## Fifth lesson added to each unit

| Unit | New lesson | Added capability |
| --- | --- | --- |
| Recent activities | `a2-describing-a-changing-routine` | compare earlier/current routines, frequency and reason |
| Work coordination | `a2-setting-work-priorities` | set priority, parallel work and completion update |
| Housing/services | `a2-preparing-for-a-repair-visit` | availability, access instructions and conditional contact |
| Appointments | `a2-finding-an-earlier-appointment` | ask for an earlier slot and distinguish option from confirmation |
| Shopping | `a2-asking-about-a-return` | receipt, return/exchange/refund language in a fictional shop policy |
| School/local messages | `a2-relaying-a-schedule-change` | relay a changed time while preserving unchanged details |
| Travel | `a2-handling-a-missed-connection` | missed connection, next option, platform and expected arrival |
| Social experiences | `a2-following-up-after-a-social-event` | thank, check safe return and keep a future plan open |

Each new lesson adds:

- 8 Dutch/Arabic phrases with teaching tips;
- 4 distinct answer-keyed questions;
- at least 6 lexical/form notes;
- 2 open production tasks with model, translation and self-review checklist.

## Language-rich benchmark

The eight new lessons also establish the first `languageDepth` benchmark defined in `LANGUAGE_RICHNESS_STRATEGY.md`.

Each new lesson additionally contains:

- 4 contextual example sentences (32 across the eight lessons);
- 3 collocations (24);
- 2 natural alternative phrasings (16 pairs);
- 2 common learner mistakes with corrected forms (16 contrasts).

These are rendered as a separate depth section and are not silently added to the controlled audio bank.

## Ordering and compatibility

The fifth lesson is inserted at the end of its own unit, so A2 lesson numbering is now 01–40 in pedagogical order. Existing lesson and phrase IDs remain unchanged.

Legacy audio regression tests are changed to select the first four lessons of each historical unit by **lesson identity**, not by array slice position. This keeps all previously authored synthesis requests byte-identical even though new lessons are inserted between units.

## Pedagogical boundary

The expansion adds repetition and transfer, not a claim of greater CEFR validity. Lesson count is not a proficiency percentage.

Real audio generation/listening approval, independent educator review and learner observation remain separate release gates.
