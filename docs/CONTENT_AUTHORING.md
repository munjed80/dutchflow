# Authoring the A1 learning path

Read `docs/A1_CURRICULUM.md` for thematic goals, readiness gates, vocabulary forms and self-review production tasks. Add every new lesson/reading to `src/data/a1-roadmap.json`; planned content must not have broken links.

For the separate original reading texts, contextual vocabulary, grammar examples, and evidenced questions, read `docs/READING.md`. Reading slugs and question IDs are separate from lesson/audio phrase IDs. Do not add reading texts to the audio manifest implicitly.

`src/data/modules.json` defines the ordered modules. `src/data/lessons.json` is the ordered lesson source for rendering, quizzes, and generated phrase audio. The current release contains 25 introductory lessons across four modules; this is not a complete CEFR A1 syllabus or an official exam preparation guarantee.

## Add or edit a lesson

1. Choose an existing `moduleId` and place the lesson with that module's other lessons. Update sequential display `number` values after reordering.
2. Keep existing `slug` values and phrase `id` values stable. Slugs are used in URLs and saved completion. Phrase IDs identify generated audio. Never reuse an ID for unrelated content.
3. Include a practical `goal`, the situation in `context`, and natural Dutch phrases with Arabic meanings and short explanations. Add a `grammar` title, explanation, Dutch example, and Arabic translation.
4. Dialogue turns reference phrase IDs from the same lesson. Ensure the exchange makes sense when read aloud; validation checks the references, not linguistic coherence.
5. Give every quiz question distinct choices, one unambiguous `correctIndex` (zero-based), and an explanation. Questions should test what the lesson teaches. Avoid ambiguous distractors or invented Dutch presented as learning material.
6. Run `npm run content:check`, `npm test`, `npm run typecheck`, and `npm run build` before opening a PR. Review the Arabic and Dutch with a qualified language editor before describing the curriculum as professionally reviewed.

## Audio and progress compatibility

- The original routes `introductions`, `doctor-appointment`, and `at-the-shop` remain valid. Their lesson numbers may change; progress follows their slugs.
- New lesson phrases are included automatically by `npm run audio:generate -- --dry-run`. The generator validates the entire curriculum even when using `--limit`.
- Voice generation requires credentials and has not been run for this catalogue. The current 165 phrases correspond to 660 files with two voices and two speeds.
- The generator currently reuses files by ID, voice, and speed. If the spoken Dutch text changes, remove all cached variants for that phrase and regenerate them; changing only the Arabic explanation does not require regeneration. Content-hash invalidation is a future improvement.
- After generation, listen to the files before publishing the MP3s and manifest together. At larger scale, publish audio to object storage instead of keeping thousands of binaries in Git.
