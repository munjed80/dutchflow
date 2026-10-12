# A2 study path and completion handoff

## Gap closed

PR #34 was merged on 2026-10-11; its final CI succeeded. Its eight cross-unit reviews were available, but the A2 map still showed mostly lesson lists. Reading, guided interaction and recycling required separate catalogue browsing. Completing all 40 lessons on the progress page offered no explicit final-review handoff.

The `/a2` map now groups five stages for each existing unit: lessons (with their listening/writing routes), linked reading, guided scenario, integrated practice and later cross-unit retrieval. This is a suggested sequence, not a lock or an assessment. Cross-unit review is explicitly recommended after studying its source lessons in the other units.

## Progress behavior

- A small client component receives only unit IDs/titles and lesson slugs/titles. Resource banks and answers stay out of its props. The static resource map remains available before progress loads or when it fails.
- Recommendations use `LearningProvider`, so authenticated users use server progress and guests use the existing browser progress contract. No new storage, account API, completion writes, scores or scheduling.
- The next lesson is the first missing lesson in curriculum order. Unknown/duplicate completion IDs cannot inflate unit completion. A completed unit means its lessons are marked complete, not that reading/speaking/recall have been assessed.
- Loading and error states suppress personalized recommendations. A retry refreshes the shared provider. A stale account snapshot is not treated as guest data.
- After all 40 lessons, `/a2` suggests the integrated final review. `/progress?level=A2` adds a map entry and offers the final review when loaded progress confirms every A2 lesson is complete. A1 behavior is retained.

## Scope and remaining launch gates

No learning content, audio IDs/texts, course totals or paid-exam behavior changes. This closes navigation and end-of-path discovery gaps; it does not complete independent language review, learner observation, owner-managed audio approval, production account provisioning or the documented account/privacy launch work. Paid exams remain deferred.

## Validation

Native tests cover eight complete resource groups, answer-free projections, invalid resource references, out-of-order completion, duplicates, unknown IDs and the final state. Browser tests cover guest progress, account-vs-guest isolation, failure/retry, final-review navigation, all resource groups and mobile overflow. Final full-suite results are recorded in the PR handoff.
