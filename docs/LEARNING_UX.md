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
