# DutchFlow — project continuity

Read this file and `README.md` before changing the project. Update this file after each meaningful PR so another coding assistant can continue from the actual repository state. Verify claims against code before marking a feature complete.

## Product and owner decisions

- Owner: Munjed Alsaied (`munjed80`). GitHub repository: `munjed80/dutchflow`.
- Goal: teach practical Netherlands Dutch to Arabic-speaking learners through everyday situations, not dry lists of grammar rules. Audience includes people living or working in the Netherlands.
- Main UI is Arabic RTL; Dutch phrases must use `lang="nl"` and LTR direction. Source code, identifiers, comments, and developer documentation are in English.
- **All learning lessons stay free.** Full independent practice exams should cost **€4.95 per attempt**, with no recurring subscription required. Do not put a paywall in regular lessons.
- The platform is not affiliated with DUO, Inburgering, or Staatsexamen NT2. Never describe a practice result as an official certificate.
- Audio strategy: generate Dutch phrase audio once, store and reuse the files. Aim for male/female voices and normal/slow speed. Do not generate TTS anew on each learner request.
- The visual direction is clean and mature, avoiding a childish game aesthetic.

## Current implementation

- Next.js App Router, React, TypeScript, and plain CSS. `src/app` holds routes; `src/components` holds interactive UI; `src/data/lessons.json` holds authored lessons and `src/data/modules.json` defines their module order.
- Pages: `/`, `/learn`, `/learn/[slug]`, `/exams`, and `/progress`.
- The introductory A1 path has 20 lessons in four modules: first steps, around town, daily life, and appointments. It contains 101 phrases, 60 questions, goals, contextual dialogues, and grammar notes. **This is not a complete A1 course, and independent linguistic review is still pending.**
- The catalogue supports Arabic/Dutch search, module filters, completion badges, and a suggested next unfinished lesson. Progress is grouped by module, and previous/next navigation is available without locking free lessons. Only three featured lessons appear on the homepage.
- Original lesson slugs and audio IDs remain stable, so old bookmarks, audio mappings, and saved completion survive the revised order. Display lesson numbers are not persistent identifiers. Read `docs/CONTENT_AUTHORING.md` before editing the curriculum.
- Catalogue and progress pages pass lesson summaries from the server; they do not send all lesson phrases and questions to their client components. The shared `useLearningProgress` hook updates local completion views.
- Lessons and free sample exam questions work. Lesson completion is stored in browser localStorage via `src/lib/progress.ts`. There is **no account system** or server-side sync.
- Quiz feedback reflects the current attempt, independently of past lesson completion. An incorrect retry keeps earlier completion credit but displays the current score and corrections. The lesson player is keyed by lesson slug so a different lesson starts with fresh quiz state.
- `AudioButton` currently falls back to browser speech synthesis in `nl-NL`. Device availability varies. `scripts/generate-audio.mjs` can generate reusable Azure Speech MP3s and populate `src/lib/audio-manifest.json`, but the repository contains no MP3 files until a key is supplied and the script is run. Keep credentials server-side/offline.
- `/exams` describes the €4.95 offer and lets users try three free questions. **No checkout, paid exam, payment webhook, scoring backend, or certificate exists yet.** The paid button is intentionally disabled.

## Next priorities

1. Review the 20 Dutch/Arabic lessons with a qualified language editor and add deeper A1 practice, especially listening comprehension and writing.
2. Generate, listen to, and validate real Dutch audio with provided Azure Speech credentials. Keep small assets with the repository initially; use object storage before the catalogue grows large.
3. Add accounts and database-backed progress. Preserve an import path for users with existing local progress.
4. Implement paid exam inventory and secure €4.95 per-attempt checkout with a chosen provider (Mollie or Stripe), server-side webhook verification, attempt entitlements, and server-side result computation. Never make the payment confirmation screen alone grant an attempt.
5. Add accessibility and mobile device checks for lessons, audio, quizzes, and checkout before public launch.

## Working rules

- Create a dedicated branch and open a pull request targeting `main` for future changes. The initial foundation was committed directly to `main`; the owner requested the pull-request workflow afterwards. Leave merging to the owner unless explicitly authorized.
- Make small focused changes. Run `npm run content:check`, `npm test`, `npm run typecheck`, and `npm run build` before submitting a PR. Run `npm run test:e2e` for lesson, navigation, catalogue, or progress changes; install Chromium with `npx playwright install chromium` first. CI runs all of these checks.
- Native content tests protect schema integrity, answer keys, dialogue references, and original IDs. Playwright covers search, module filters, retained progress, retries, navigation, lesson routes, and mobile overflow. Audio generation validates the full curriculum before processing even a limited batch.
- Keep `README.md` and this file aligned with actual features. Never silently treat planned features as shipped.
- Do not commit API keys, `.env` files, personal learner information, or bulk audio without reviewing storage costs and repository size.
- Avoid unrelated migrations, hosting changes, or architecture rewrites. Ask the owner only for genuinely necessary choices or secrets; progress on independent work first.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
