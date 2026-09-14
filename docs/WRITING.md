# Guided sentence writing

Every lesson links to `/learn/[slug]/writing`. The exercise reuses the 101 existing Dutch phrases and Arabic meanings across 20 introductory lessons. It asks the learner to recall the **lesson wording**, not translate freely. No new linguistic content, audio assets, AI service, dependency, API, or database migration is introduced.

## Comparison contract

`src/lib/writing.ts` compares one learner answer with the authored phrase:

- Normalize Unicode to NFC, lowercase, standardize curly apostrophes, trim and collapse whitespace, and ignore trailing `.`, `!`, `?`, and `…`.
- Preserve accents, numbers, apostrophes, hyphens, internal punctuation, spelling, and word order. It does not use edit-distance acceptance or silently strip meaningful characters.
- Align whitespace-separated words using a longest common subsequence. Highlight unmatched words in both the answer and the model. Repeated words and omitted words do not shift every later word into an error.
- Render the normalized word comparison plus the original model sentence and its existing lesson tip. Learner input is rendered as React text, never HTML.
- Bound both texts to 500 UTF-16 code units; the UI has the same `maxLength`. Empty or punctuation-only answers cannot submit. Native tests verify that every authored phrase fits the bound.

This is a deterministic comparison, **not a grammar checker, free-translation evaluator, or validated writing assessment**. A different answer may be valid Dutch; the UI says it differs from the lesson wording, and explicitly acknowledges alternative formulations. Highlights show differences from this model, not a linguistic diagnosis. Qualified review of the underlying curriculum remains pending.

## Learning state

The learner sees the Arabic meaning and an LTR Dutch textarea. The model is hidden until explicit help or the first comparison. Revealing it before the first submission marks that phrase assisted. Comparison freezes the input and shows feedback; a differing answer can be rewritten with a cleared input and hidden model.

The first submitted result and whether it used help are immutable for that phrase. Retrying and correcting cannot inflate the first-attempt score. The summary reports independent first-attempt matches, assisted phrases separately, and an expandable review list of first-attempt differences or assisted phrases. An entirely assisted round explicitly has no independent result. Replaying starts a new round.

Answers and summaries live in component state only. Reload, navigation away, or replay reset the session. This practice never changes guest/account lesson completion and never saves learner answers. It remains usable without accounts, audio, storage access, or external services. Client data contains the model answers because this free exercise is not an exam security boundary.

## Verification

Native tests cover all 101 phrases, normalization boundaries, omitted/extra/repeated/reordered words, maximum length, and assisted scoring. Browser tests cover the lesson link, hidden model, disabled blank submission, normalization, feedback, retry focus and immutable first result, assisted summaries, review lists, unchanged guest progress, reload/navigation reset, every route, 404, input limits, and mobile overflow with a long unbroken answer. The full existing suite remains a required gate.
