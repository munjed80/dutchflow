# Free starting-point check

## Product scope

`/placement` helps a learner choose where to begin or what to review in the existing introductory A1 path. It is free for guests and account holders. Entry links are on the homepage, lesson catalogue, and exams page. Full practice exams remain a separate future offer at €4.95 per attempt; checkout is still disabled.

There are 16 questions: six vocabulary/expressions, five sentence-structure questions, and five short-reading questions. A learner can choose an option or explicitly choose “I don't know” (represented as `null`). All questions require one of those responses before grading. The learner can navigate back, review, and edit answers. There is no countdown.

The result contains correct/total counts, a breakdown by skill, explanatory feedback, and up to three related lessons. Each missed question increments the count for its linked lesson; recommendations sort by most missed questions, with original question order as the stable tie-breaker. Perfect scores produce no invented weak areas. These are routing suggestions, not psychometric or CEFR level estimates:

| Correct answers | Guidance |
| --- | --- |
| 0–7 | Start with the foundations |
| 8–12 | Review material that needs reinforcement |
| 13–16 | Broaden practice through everyday situations |

The thresholds are product heuristics and have not been calibrated. The check does not assess listening, speaking, or writing, mark lessons completed, issue a certificate, or grant exam entitlements. Repeated attempts can benefit from memorizing answers. A qualified Dutch/Arabic language review is still required.

## Content and server boundary

- `src/data/placement.json`: revision, skill labels, prompts, optional Dutch passages, answer options/languages, correct indexes, Arabic explanations, and related lesson slugs.
- `src/lib/server/placement.ts`: server-only answer-bank import. Do not import the JSON directly from a client component.
- `src/lib/placement-scoring.ts`: pure public projection, response validation, scoring, and recommendation logic; tested natively with Node.js 24 type stripping.
- `src/lib/placement-types.ts`: public and internal contracts.
- `src/app/api/placement/route.ts`: stateless POST grading. No account or database is needed. It accepts only `{ revision, answers }`, enforces an 8 KiB streamed body limit and JSON content type, requires every known question exactly once, and validates option indexes. `null` earns no credit. A mismatched revision returns 409; malformed submissions return 400/415/413. Results use `Cache-Control: no-store`.

The page explicitly projects public fields before handing them to the client. Correct indexes, explanations, lesson mappings, and future internal fields are excluded. The server returns correct answers and explanations after grading. This is an open-source free practice tool: it does not prevent answer memorization, source inspection, or repeated grading requests. Paid exams need a separate authenticated attempt/entitlement lifecycle and secure server grading; this route cannot authorize them.

## Drafts, retries, and privacy

The client stores only the content revision, selected answers, current question index, and review state in `sessionStorage` under `dutchflow-placement-draft-v1`. No name, email, user ID, or cloud result is stored. The draft is separate from `dutchflow-progress-v1` and never participates in guest-progress import.

Refreshing offers to resume or discard the draft. Resuming a completed draft opens answer review and requires server grading again. Restart replaces the draft with empty answers. Invalid or outdated drafts are rejected. Storage errors leave the check usable in memory with a notice. A failed or timed-out submission preserves the on-page answers and offers retry; a server revision mismatch asks the learner to reload the current question bank. Results are not saved to account history.

## Authoring and validation

Bump `revision` whenever prompts, options, answer keys, explanations, skills, or lesson mappings change. Keep question IDs stable only when their meaning is unchanged. Dutch passages/options must have their explicit language and LTR presentation; Arabic text stays RTL. Update the 16-question UI copy and validator together if the intended length changes.

`npm run content:check` validates the bank, unique IDs/options, answer indexes, skill references, languages, and existing lesson links. `npm test` also checks public/private separation, incomplete/tampered submissions, unknown answers, score boundaries, and lesson recommendations. `npm run test:e2e` checks the real UI/API, tab reload/resume, changes before grading, failure/retry, mobile results, and absence of explanations from initial HTML/client scripts. The existing account and lesson tests continue to run.

No database migration, authentication configuration, audio API, or payment configuration is required for this feature.
