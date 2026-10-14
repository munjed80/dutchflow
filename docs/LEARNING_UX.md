# Learning navigation and catalogue UX

## Scope

This pass improves discovery and navigation for the existing A1/A2 learning experience. It does not change course content, completion criteria, audio, identity, storage or payments.

- The catalogue shows level selection and the next lesson before supporting resources. `LearningResources` groups the course map, reading, vocabulary, scenarios, integrated practice, grammar and pronunciation in a native `details` disclosure. A2 also includes cross-unit retrieval. Each resource preserves the selected level where supported; pronunciation remains shared.
- Resource links are rendered on the server and passed as a React node into `LessonCatalogue`; no extra content bank is shipped to its client bundle. The disclosure works with keyboard and without JavaScript.
- The catalogue waits for ready, non-loading, error-free progress before suggesting a next lesson or showing completion counts/badges. A delayed request shows a loading message. Failure offers an explicit retry while search, module filters and lesson links stay usable. Account progress remains separate from guest storage.
- Lessons have an in-page contents list for phrases, dialogue, grammar and quiz, plus vocabulary, language depth and free production when present. Plain fragment links and focusable targets preserve the current quiz/production state and work without routing away. A return link leads back to the contents.
- The quiz shows answered/total counts. Submitting an incomplete attempt moves focus to the first unanswered question, announces an error and describes incomplete question groups. It does not select an answer or change completion state.
- A global skip link targets the main content. Mobile primary-navigation links and lesson-contents links have at least 44px height. Existing reduced-motion styles apply to fragment navigation.
- Enrichment vocabulary links now preserve A2 instead of returning to the A1 library.

## Validation

`tests/e2e/learning-ux.spec.ts` checks mobile next-action visibility, resource disclosure by keyboard, level-preserving destinations, 320/390/1280px overflow, loading/failure/retry and account isolation, skip-link/fragment focus, first-unanswered focus and answer preservation. Existing resource-discovery tests follow the new disclosure before navigating.

Visual inspection covers the mobile catalogue, expanded resources, lesson contents and quiz, and the desktop catalogue. Automated checks do not replace observed learner usability sessions or assistive-technology testing on real devices.

## Catalogue and global navigation refinement (2026-10-14)

- Mobile module selection uses a labelled native select instead of a long grid of eight unit buttons. Desktop retains the existing unit buttons; both controls share the same state when resizing.
- Search, unit selection and completion status combine. Learners can show all, remaining or completed lessons and reset all filters together. Empty completed/remaining views explain the actual selection and offer a return to all lessons.
- Status filtering and the level-local completion link wait for known progress. Unavailable progress disables status filtering, explains why, and keeps search/module browsing available. The selected status is applied again only after recovery; account errors are not treated as guest progress.
- The next suggested lesson includes its position and estimated duration. Counts refer only to lesson completion, not mastery.
- Global lesson/progress destinations retain A2 on A2 query routes and A2 resource slugs. Learning resources highlight the learning navigation group using `aria-current="location"`; exact pages use `page`. The desktop header action opens the catalogue instead of always restarting the first A1 lesson.
- The search-parameter-aware header has a static navigation fallback so its geometry and basic links remain available before hydration. No new persistent level preference is introduced; shared review/account pages do not infer a level from past visits.

`catalogue-navigation-ux.spec.ts` covers combined filters, reset, empty states, unknown progress, A1/A2 isolation, route context, desktop selection and mobile overflow. Real-device usability and assistive-technology observation remain separate from automated validation.

Local validation for this refinement passed: content/audio integrity checks, 70 native tests, TypeScript, production build and all 168 Chromium E2E tests. Screenshots were inspected at 390px and 1280px; automated overflow checks also cover 320px and 768px. Local browser tests use isolated PGlite; GitHub CI with PostgreSQL is a separate gate after publication.
