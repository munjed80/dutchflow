# Guided text scenarios

The free `/scenarios` library connects existing lessons to eight everyday situations: language-school introductions, a repair visit, clothing sizes, a fictional train journey, school absence, appointment changes, work instructions and weekend plans. Each has four authored turns and a final original-response task. These are guided choices, not free conversation, speech recognition, AI feedback or a CEFR assessment.

## Learning flow

1. Read the Arabic role and fictional mission. The current Dutch partner prompt has an optional Arabic translation.
2. Choose a Dutch response that matches the current communicative goal. The learner's selected response is not evaluated until they press the check button.
3. An unsuitable response receives a specific Arabic explanation and translation. It does not unlock the next turn. A linguistically valid sentence can still be unsuitable for the stated goal; feedback keeps that distinction explicit.
4. Retry or explicitly reveal the suitable response. Once resolved, choices lock and the partner's authored reply appears. The learner advances explicitly; the next heading receives focus.
5. Completed turns can be reread in the previous-dialogue disclosure. The final recap includes every prompt, suitable response and partner reply, with translations, plus the original unsuitable response when applicable. It distinguishes first-try suitability, a corrected retry and explicit model help without producing a proficiency score.
6. A new fictional writing task reuses the situation with changed details. It uses the existing 500-character `ProductionPractice` textarea, optional model and self-review questions. There is no automated writing judgment.

Examples are linear, not branching simulations: the next partner reply is authored for the suitable response. All response options, including alternatives, are authored Dutch. The application does not claim that the stored option is the only valid way to express the goal in free Dutch.

## State and boundaries

`src/lib/scenario-session.ts` contains a pure reducer. The first checked choice is immutable across retries. Revealing a model before any check records assistance with no first answer; merely selecting an unchecked option is not a submission. Model use after an unsuitable answer retains that first answer. A resolved turn ignores further selection/check/model actions, so repeated clicks cannot append duplicate history. Next cannot skip an unresolved turn or pass the end. Restart creates a fresh state.

Attempts and writing remain only in React memory. Reload, restarting or navigation to a different scenario clears them. The player is keyed by scenario slug. The feature writes no localStorage, sessionStorage, cloud completion, review list or payment entitlement. It remains usable without an account and during account lookup failure. Existing shared providers may still perform their normal account lookup.

There is no audio playback or recording in this release. Scenario text has its own IDs and is not added to the existing 231-phrase audio/review bank; the audio generator still plans 924 variants. Optional phrase saving remains available in the source lessons.

## Server and client data

The catalogue, metadata, role/mission and lesson links render on the server. Only the selected scenario enters `ScenarioPractice`; client components do not import the full bank. Answers and models are intentionally available in the current free scenario's client props. This is not a private answer bank and must not be reused for paid-exam scoring.

`/learn` links to the library. Relevant lesson pages link to their scenarios. Curriculum units derive scenario links from `unitId`, separately from lesson/reading links; the map still reports partial coverage. Guided text choices do not satisfy readiness requirements for recorded listening or independent spoken interaction.

## Authoring

Edit `src/data/scenarios.json`. Use a stable slug, a real unit and relevant source lessons (at least one in that unit). Author a clear fictional mission so each turn has one suitable choice for its goal. For every turn include the partner prompt and translation, three distinct choices with translations and specific feedback, an answer index, and the partner's reply with translation. Preserve conversational coherence across turns and check times, names, sizes and instructions manually.

Use fictional locations/schedules for transport, invented learner details and original dialogue. Do not ask learners to provide actual personal data. Avoid turning language examples into medical, legal or operational instructions. The final transfer task should change the details or request a new response, with a model no longer than 500 characters and at least two self-review questions.

`validateScenarios` runs in `content:check` and native tests. It rejects invalid/duplicate slugs and turn IDs, unknown unit/lesson links, missing language/feedback fields, duplicate choices, invalid answer keys and incomplete/oversized transfer models. A scenario may contain 3–8 turns; this release has four each. Structural checks cannot prove naturalness, translation accuracy or that the answer logically follows. Independent Dutch/Arabic review is still pending.

## Verification

Native tests cover content contracts and invalid input, first-answer retention, invalid selections, unanswered/wrong-response gating, assistance before/after a check, repeated actions, complete traversal and restart. Browser tests cover discovery, all eight complete flows on mobile, translation, prior dialogue, disabled controls, focus, suitable responses, partner replies, transfer tasks, retries, assistance, the writing limit, reload/restart/navigation, keyboard selection, account lookup failure, unchanged progress/review storage and 404. The existing full test suite remains required.
