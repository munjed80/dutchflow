# DutchFlow

An Arabic-first Dutch learning website built with Next.js and TypeScript. The long-term model is free lessons and optional full practice-exam attempts at **€4.95 each**. DutchFlow is independent and does not issue official Dutch-language certificates.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Current learning experience

- Arabic RTL landing page and 20 introductory A1 lessons in four ordered modules. The catalogue includes 101 Dutch phrases, Arabic meanings, learning goals, short dialogues, a grammar note per lesson, and 60 graded questions.
- Search lessons in Arabic or Dutch, filter by module, continue with the first unfinished lesson, and browse previous/next lessons freely.
- Device speech synthesis for Dutch listening, with normal and slower playback. Device voice quality and availability vary; this is a temporary fallback until recorded audio is generated.
- Progress stored locally in the current browser, with completion counts for each module. Existing completion for the original three lesson URLs remains valid. There is no account or server-side progress yet.
- Three free example exam questions and a clearly labelled **€4.95** future full-exam offer. Payment and full paid exams are **not enabled**. No money is collected.

The lesson content lives in `src/data/lessons.json`, and ordered modules live in `src/data/modules.json`. Each phrase has a globally unique ID; the audio script and playback manifest use those IDs. This is an introductory learning path, not a complete A1 syllabus. See [content authoring guidance](docs/CONTENT_AUTHORING.md) before adding or reordering lessons.

## Validation

```bash
npm run content:check
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The content checks catch duplicate audio IDs, broken dialogue references, invalid answer keys, and missing goals or grammar before publication. Browser tests cover search/filtering, existing progress, quiz completion and retries, lesson navigation, all 20 lesson routes, and mobile overflow. Playwright starts the production server automatically; build first. GitHub Actions runs these checks on each PR.

## Generate reusable Dutch audio

The generator supports two Netherlands Dutch voices and normal/slow speed. It generates MP3 files once and reuses existing files on reruns. See [Microsoft's Speech REST API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech) and [Dutch voice list](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) for account setup and voice availability.

Create a local `.env` from `.env.example` and supply an Azure Speech resource key and its region. **Never commit `.env` or a key.**

```bash
npm run audio:generate -- --dry-run
node --env-file=.env scripts/generate-audio.mjs --limit=2
node --env-file=.env scripts/generate-audio.mjs
```

The script writes MP3s to `public/audio/` and updates `src/lib/audio-manifest.json`. The app uses these files automatically and falls back to the device voice when a variant is absent. Commit generated MP3 files and the manifest together for a small catalogue. At larger scale, move assets to object storage/CDN and adjust the manifest URLs; avoid growing Git with thousands of binary files.

## Roadmap

1. Review this introductory A1 path with a qualified Dutch speaker; add further A1 practice and structured A2 and B1 content.
2. Generate and review the audio. Add a content authoring workflow and audio quality checks.
3. Add accounts, a database, accessible cross-device progress, and privacy controls.
4. Build secure paid practice exams: authenticated purchases, one €4.95 attempt per payment, server-side scoring, provider webhooks, receipts, and clear retry/refund handling. Do not unlock an exam based on a browser redirect alone.
5. Add result breakdowns and revision recommendations. Keep all standard lessons free.

See `CLAUDE.md` for project continuity and contribution guidance.
