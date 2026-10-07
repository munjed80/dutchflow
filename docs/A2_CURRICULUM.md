# A2 preparation and first delivery slice

Updated 2026-10-07. All eight proposed authored units and the level-aware infrastructure are implemented. The whole-sequence audit is recorded in `A2_FULL_COVERAGE_AUDIT.md`. Its decision is **do not add unit 9**. The cumulative A2 final integrated review is now implemented in `A2_FINAL_REVIEW.md`; the next work is targeted relay/listening reinforcement followed by the final editorial pass. No proficiency score or certificate is introduced; paid exams remain deferred.

## Starting point and boundaries

A1 now has 53 lessons, 338 lexical/form notes, 116 lesson writing tasks, 27 library readings, ten scenarios and eleven integrated packs. The focused review of PR #21 is recorded in `A1_ENRICHMENT_REVIEW.md`; `A1_COMPLETION.md` remains the current inventory and release-gate reference. Further A1 work should address observed gaps rather than continually adding near-duplicate questions.

The Council of Europe's [global scale](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale) describes A2 as handling routine exchanges about familiar needs and describing one's immediate circumstances in simple language. The [2020 Companion Volume](https://rm.coe.int/16809ea0d4), particularly information exchange and correspondence, also supports exchanges about past activities and plans. These are reference points for educator review, not a prescribed Dutch grammar list. The sequence and quantities below are DutchFlow design proposals, not CEFR requirements.

## A1 closure versus A2 development

| Work | Current evidence | Next action / owner |
| --- | --- | --- |
| Authored A1 content | Core review plus PR #21 enrichment follow-up complete | Maintain stable IDs; fix learner-reported issues / developer |
| Comprehension and production | Evidence-backed questions and original-response tasks exist | Observe learners on unfamiliar details and adjust scaffolding / educator |
| Real audio | Repository manifest has zero approved variants | Owner generates, listens and approves; `audio:check -- --require-complete --level=A1` must pass for A1 recorded release |
| Independent language review | No external sign-off recorded | Dutch/Arabic educator reviews wording, task load and descriptor mapping |
| A2 preview | Eight units / thirty-two lessons + cumulative final integrated review implemented; whole-sequence audit complete | Targeted relay/listening reinforcement + final editorial pass; educator review and learner observation remain outstanding |
| Public launch | Account infrastructure/privacy readiness separate | Follow `ACCOUNTS.md`; do not equate course counts with launch readiness |

A2 design and an isolated draft can proceed alongside owner-managed recording work. Publishing A2 requires its own reviewed material and playback checks; it must not imply that A1's remaining release gates have passed. The learner's A1 lesson-completion total is self-reported, not a gate, placement result or credential.

## Proposed sequence

| Unit | Observable task | Language introduced and recycled |
| --- | --- | --- |
| 1. Recent activities and routines | Describe yesterday, ask what a partner did, distinguish yesterday from today | Frequent perfect-tense forms with hebben/zijn; gisteren/vandaag; recycle present tense, time and question order |
| 2. Work coordination | Report a completed task or delay and clarify the next step | First/then/because; frequent past forms, polite help requests and task vocabulary |
| 3. Housing and services | Describe a recurring problem and arrange a visit | Time expressions, comparisons and a short reason; recycle locations and availability |
| 4. Appointments and follow-up | Explain a conflict, compare offers, confirm a replacement | Reason clauses with guided word order; recycle dates and first/changed appointments |
| 5. Shopping and choices | Explain a simple purchase problem and request an alternative | Comparatives, demonstratives, quantities and polite requests |
| 6. School and local messages | Identify an action/deadline and send a relevant short reply | Required/optional information, sentence links and question forms |
| 7. Travel and plans | Choose a route, explain a delay and negotiate an alternative | Future plans with gaan; recycle time, movement and reasons |
| 8. Social experiences and invitations | Tell a short experience, ask follow-up questions and agree a plan | Present/past contrast, preferences, reasons and turn-taking |

Introduce grammar through useful exchanges; do not teach the entire past-tense system in one lesson. Recycle each new pattern in at least two later units. Reading length alone is not the difficulty target: vocabulary, discourse, support and response demands matter together.

## First implementation slice: unit 1 (authored)

Four authored lessons (published IDs are now stable):

1. `a2-yesterday-and-today`: contrast a present routine with two completed activities; scaffold `Ik heb gewerkt` and `Ik ben naar huis gegaan`.
2. `a2-a-day-at-work`: state completed tasks in order and ask a colleague a follow-up question.
3. `a2-a-weekend-visit`: describe a visit using a small set of frequent forms; ask where/when/with whom.
4. `a2-telling-a-short-story`: connect a few events and respond when the partner changes a detail or asks for clarification.

Deliver one coherent slice: four linked lessons, one new reading, one distinct connected listening source, one guided scenario, and one integrated review containing original writing and partner interaction. Each lesson needs explicit outcomes, contextual forms, a short dialogue and original-response practice. Exact phrase counts and duration must follow editorial review, not quotas.

Acceptance:

- Each comprehension question tests a distinct useful objective, has one defensible answer and quotes all needed premises. New question IDs and remediation targets are validated.
- Every requested writing detail appears in the model and checklist; multiple correct formulations remain possible.
- Partner cues and model responses agree about roles, names, times and changed details; the example must demonstrate a response, not merely repeat the learner's opening.
- Learners can attempt before revealing models/transcripts. Playback completion and text assistance stay separate. Free retries never produce a proficiency claim.
- Dutch/Arabic review and a small learner pilot inform revisions. Record concrete observations, such as whether the learner communicated when an event happened and answered a follow-up, rather than inventing a pass percentage.
- New audio IDs use an A2 namespace; approved A1 filenames/hashes and pronunciation overrides remain unchanged. Review actual playback before marking the slice ready.

## Level-aware implementation contract

The first slice implements the following boundaries. Preserve them when adding further units; the bullets describe the contract, not unfinished prerequisites:

- `src/lib/content.ts`: carry an explicit level in `LessonSummary` and module summaries; use a bounded level type for published levels. Keep old slugs and completion keys.
- `LessonCatalogue` and `ProgressOverview`: separate level selection, navigation and completion denominators. A1 must remain 53 lessons after adding A2; never relabel a combined total as A1.
- Lesson previous/next and recommendations: define within-level order explicitly. Finishing A1 must not silently start or certify A2.
- Curriculum, readings, scenarios and integrated practice: use per-level source validation and projections, preserving every existing A1 URL. `IntegratedPractice` shares rendering and `PracticePack` shares the schema across the two route prefixes.
- Progress APIs/import: accept published A2 slugs through the existing validated catalogue, preserve old data, and keep completion separate from assessment. Review existing account tests before changing contracts.
- Placement: the existing 16-question starting-point bank does not assess A2. Leave it unchanged until a separate reviewed design exists.
- Audio: extend the shared source inventory once, with unique IDs across levels; generation, review and integrity checks must use the same list.

Regression gate: A1 URLs, storage/import, per-level totals, remediation, audio hashes and existing first-attempt/help behavior must remain valid. Add tests for switching levels, fresh state after navigation and preserving existing progress. Run content/audio checks, native tests, typecheck, production build and the relevant browser flows before opening the A2 PR.
