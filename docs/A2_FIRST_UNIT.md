# First A2 unit: recent activities and routines

This document records the first-unit snapshot. For current totals and unit 2, see `A2_WORK_COORDINATION.md`.

## Delivered scope (2026-10-03)

This is the first authored A2 unit, openly labelled an early course slice. It is available for practice, not an assertion that A2 is complete, independently reviewed or certified. Recorded audio and educator/learner validation remain outstanding. Paid exams remain deferred.

| Resource | A2 additions |
| --- | ---: |
| Lessons / phrases / lesson questions | 4 / 32 / 16 |
| Lexical/form notes / lesson writing tasks | 24 / 8 |
| Library readings / notes / questions | 1 / 6 / 4 |
| Guided scenarios / turns / transfer tasks | 1 / 4 / 1 |
| Integrated packs / reading questions / listening questions | 1 / 3 / 3 |
| Integrated writing / partner tasks | 1 / 1 |
| New audio sources / four-variant jobs | 33 / 132 |

The 33 audio sources are 32 lesson phrases plus one connected passage. Library readings, writing models and text scenarios are not audio sources. The combined inventory is 400 sources / 1,600 variants, with the original A1 requests unchanged and ordered first. No real MP3s were generated or approved in this work.

## Sequence and editorial intent

| Lesson slug | Communicative task | New support |
| --- | --- | --- |
| `a2-yesterday-and-today` | Contrast completed activities with today's routine | `heb gewerkt`, `ben gegaan`, `heb gekookt`, present/past contrast |
| `a2-a-day-at-work` | Report finished and unfinished tasks; ask a colleague | `geteld`, `gecontroleerd`, `opgeruimd`, `nog niet`, `heeft` |
| `a2-a-weekend-visit` | Describe a visit and answer who/where/how/when | `geweest`, `gedronken`, `gewandeld`, `thuisgekomen`; plural auxiliaries |
| `a2-telling-a-short-story` | Sequence a short account and correct a misunderstood time | `eerst`, `daarna`, `ten slotte`, auxiliary inversion, `gekomen`, `gestuurd` |

The sequence teaches a small set of useful forms with their auxiliary rather than presenting a complete past-tense grammar. It explicitly avoids “all movement verbs use zijn” and “every story uses only perfect tense.” The reading recycles a visit with different people/place/time; the scenario gives a role card and expects a correction; the integrated listening updates a written task list, distinguishing completed work from a new request.

Internal editorial checks cover all 32 Dutch/Arabic phrase pairs, role assignments, 16 lesson questions, 24 notes/eight models, both new reading sources, the connected listening source, all ten evidence-backed comprehension questions, four scenario turns/12 choices/transfer, and integrated writing/partner examples. This is an implementation editorial pass, not external educator sign-off. Models demonstrate requested details and remain optional; no original response receives an exact-match linguistic grade.

Language references checked during authoring:

- [Taaladvies: formation with hebben / zijn](https://taaladvies.net/vorming-van-voltooide-tijden-met-hebben-of-zijn-algemeen/): auxiliary choice depends on use and meaning; movement alone is not a sufficient rule.
- [Taaladvies: completed versus ongoing past forms](https://taaladvies.net/werkwoordstijden-die-iets-over-het-verleden-zeggen-voltooide-versus-onvoltooide-tijden-algemeen/): perfect forms combine an auxiliary and participle; narratives can mix tenses.
- [Onze Taal: past participle](https://onzetaal.nl/taalloket/voltooid-deelwoord): form terminology and common patterns.

Examples and learning tasks are authored here, not copied from these sources. CEFR references and the future sequence remain in `A2_CURRICULUM.md`.

## Routes and level boundaries

`/learn`, `/progress`, `/reading`, `/scenarios`, `/grammar` and `/vocabulary` retain A1 as the default. `?level=A2` selects A2; invalid or repeated level values safely fall back to A1. Level navigation uses URL links, so refresh/back navigation preserves the selection. Filter state resets when the level changes. Only the selected catalogue/module/vocabulary projections go to their client components.

`/a2` exposes the unit map and all related resources. `/a2-practice/a2-recent-activities` uses the same server `IntegratedPractice` renderer as the preserved `/a1-practice/[slug]` routes. Existing listening assistance, restart, feedback and temporary production state remain unchanged. A2 links resolve to its own map/reference pages; no final A2 cumulative exam is invented for one unit.

Lesson URLs still use `/learn/[slug]`; A2 slugs carry an `a2-` namespace. Previous/next lessons and related reading/scenario navigation stop at their level boundary. Completing every available A1 lesson offers A1 review, never automatic A2 promotion. A1 progress remains out of 53, A2 out of four. The UI states that completion does not prove proficiency.

## Data, validation and accounts

All authored A1 banks are byte-for-byte unchanged. A2 has separate `src/data/a2-*.json` banks. `content.ts` aggregates published lessons and modules; `getLevelLessons`, `getLevelModules`, `getLessonSummaries` and shared level helpers control projections/navigation. Supporting content determines its level from validated same-level lesson references.

`readCourse` loads each level's bank for tooling. `validateCourse` applies the existing curriculum, map, reading, scenario, practice and remediation contracts within that level. The curriculum validator bounds supported levels and restarts display numbers per level. Global checks reject duplicate lesson/phrase/question/reading/scenario identities; every new question has an A2 lesson remediation target. A1 still requires its cumulative review; the one-unit A2 slice does not pretend to be cumulative.

Account APIs and explicit guest import use the combined published-slug catalogue. They preserve the existing storage key, schema, session authorization and union-only behavior; no migration or automatic import occurs. The 16-question A1 placement bank and its recommendations remain A1-specific. The explicit phrase review list may include either level because users choose those phrases themselves.

## Verification and follow-up

Validation: 60 native tests and all 128 unique Chromium end-to-end tests passed (run in three batches; the four A2 cases also repeated in the final batch). Content/audio checks, TypeScript and production build passed. Mobile (390px) catalogue and desktop map were inspected; no horizontal overflow. Local account coverage used disposable PGlite/SMTP; GitHub CI uses PostgreSQL.

Native tests cover level/reference/numbering failures, all new phrase listening/recall contracts, and equality of all 1,468 legacy audio jobs before the new 132 jobs. Browser coverage exercises level switching, all-A1-complete boundaries, guest/account totals, explicit mixed-level import, new resources, remediation, assisted listening, partner models, scenario progression, memory-only resets and mobile layout. Existing A1 suites remain required when changing the shared renderer or catalogue.

Next work: obtain feedback on this slice, generate/review its actual recordings, and then add unit 2 on work coordination with recycled perfect forms and new task-detail exchanges. Do not treat this delivery as completion of all A2 or of A1's independent release gates.
