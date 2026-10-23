# A2 mobile web and contextual transfer

This iteration starts from merged PR #41 (`5a7de00`). It adds original A2 practice and a mobile web layout, keeping the existing course identities, account/progress contracts and free access. It does not add a native app, installation requirement, offline cache or service worker.

## Authored expansion

| Situation | Language purpose | Distinction practised |
| --- | --- | --- |
| Workplace observation | Describe what you saw, ask for clarification, relay a temporary instruction | Observed location vs unknown cause; task owner vs colleague; elapsed time vs confirmed update |
| Energy note | Read units, compare meter readings and request missing information | Meter reading vs consumption vs monthly euro amount; unknown unit price cannot be inferred |
| Borrowing study materials | Track separate return dates, request permission and respond to a declined extension | A request is not permission; an offered copy does not extend the loan |
| Social misunderstanding | Ask what someone means, correct an assumption, apologise and negotiate a precise time | Assumption vs actual request; availability after a time vs an agreed exact time |

Each situation adds a 103–118-word Dutch reading with Arabic translation, six contextual vocabulary notes, one passage-based grammar note, six evidenced comprehension questions, an original production task, a four-turn guided dialogue and a separate changed-detail transfer task. All sixteen dialogue turns offer three meaningful options and specific feedback. Every new reading question links to relevant A2 lessons. New resources are discovered through the existing study path, source-lesson links and level-filtered libraries.

Current separate reading library: **28 texts / 136 questions / 168 vocabulary notes**. Guided conversation: **28 scenarios / 120 turns / 28 transfer tasks**. Four new reading production tasks and four new scenario transfer tasks add eight original-response opportunities. Core lessons remain **48 / 384 phrases / 192 questions**. Thirteen integrated packs, sixteen cross-unit retrieval sets, audio sources and all preceding content remain unchanged.

All work, energy, lending and social examples are original fiction. The energy example teaches language and arithmetic, not tariff or contract advice; its missing unit price is explicit. The workplace example quotes fictional instructions and supplies no occupational-safety protocol or medical treatment. No real institution's loan rules or learner permissions are asserted. Independent Dutch/Arabic educator review remains pending; these tasks do not certify A2 or establish readiness for Staatsexamen NT2.

## Mobile UX

- `/a2` presents the next-action/status card immediately after a shorter visual heading. Counts reflect published resources, not mastery. Loading/error/retry behavior is unchanged.
- A numbered unit index jumps within the page. Lessons remain visible; goals and supplementary practice use keyboard-operable native disclosures. Reading/dialogue counts inside disclosures are derived from actual resource links, including cross-unit sources.
- A mobile-only bottom navigation preserves A2 between catalogue, map and progress. It has explicit labels, decorative inline SVGs, current-location indicators, large targets, an opaque background and safe-area spacing. A1, KNM and shared account/review routes do not receive this navigation. Desktop keeps the existing header.
- Body/scroll spacing reserves room for the fixed navigation. The A2 lesson contents become a two-column grid of touch targets, and lesson-to-lesson links stack vertically on small screens. No answer is cleared by in-page fragment navigation.
- Dutch text retains `lang="nl"` and LTR; Arabic is RTL. No new fonts, bitmap downloads, dependencies or full answer banks enter the header client component.

## Compatibility and verification

Pinned snapshots preserve the preceding 24 reading and 24 scenario objects plus unit identities/prior reading order. Historical forty-/forty-eight-lesson snapshots still apply; append-only additions are projected out of those snapshots rather than regenerating hashes. Old lesson slugs, numbers, phrase/audio IDs, saved completions, A1 and KNM banks remain unchanged. New answers are temporary and ungraded production never changes progress.

Audio planning stays **764 sources / 3,056 variants** (A1 1,468; A2 1,588); no MP3 generation or approval occurs in this change. Listening remains dependent on existing approved files/device voices.

Native tests validate the new links, source evidence, known-vs-missing information, final loan condition and immutable previous resources. Browser tests cover touch navigation, the next action fitting above the bottom bar at 390×844, keyboard disclosures, widths 320/390/430/721/1280, unclipped question controls, A1/KNM navigation isolation, all four readings through error/correction/remediation, all four dialogues through retry/transfer/reset and unchanged storage. Content/audio checks, 88 native tests, TypeScript and production build passed. The full 207 browser cases passed in two isolated shards (132 + 75). After an editorial clarification making Friday book possession conditional on permission, native tests were repeated and a fresh build plus all 24 focused A2 browser cases passed. The full suite was not repeated after that text-only clarification. Mobile map, quiz and expanded-unit screenshots were visually inspected; GitHub CI remains separate.

Screenshots can establish layout quality in Chromium; they do not establish WCAG conformance or real iOS/Android compatibility. Physical-device Safari/Chrome observation and accessibility evaluation remain release work, along with independent language review and existing public-launch gates.
