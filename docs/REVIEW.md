# Browser-local phrase review

`/review` collects explicitly selected phrase IDs from all lessons. It is free and reachable through the main navigation. Learners can add individual phrases from lessons, or add the suggested phrases from a listening/writing summary. Those suggestions include incorrect/nonmatching first answers and text-assisted answers. Nothing is added automatically; original results and lesson completion are unaffected.

## Storage and identity

`ReviewProvider` receives only the known phrase IDs from the server layout. It does not import the full curriculum into the client. `/review` receives a phrase projection with lesson titles/slugs, without quiz questions. The localStorage document at `dutchflow-review-v1` is `{ "version": 1, "phraseIds": [...] }`. No learner answers, scores, account IDs, timestamps, or self-ratings are stored.

The list belongs to the **browser**, not the signed-in account. It is shared by people using that browser and survives sign-out. The interface explicitly says so. No account import, cloud synchronization, cross-device storage, backend writes, or lesson-completion grants exist. Reading practice stays free and usable independently of account availability.

`parseReview` bounds the document, validates its version/schema, removes duplicate IDs, and filters IDs absent from the current curriculum. Add/remove actions retain insertion order and only accept known IDs. Each mutation reads the latest document before applying its changes; `storage` events and window focus refresh other tabs. Sequential cross-tab changes are supported. There is no transactional lock across simultaneous tab writes; last-write-wins remains a limitation of this browser-local implementation.

The provider commits visible changes only after `setItem` succeeds. A quota/permission/read failure shows an error instead of claiming the list was saved. The action can be retried. Malformed/unsupported data is not silently overwritten by an add/remove action; the review page offers an explicit, confirmed clear/reset. A failed clear retains its confirmation and error. Clearing this key never clears guest lesson completion or other browser data.

## Recall sessions

The list can be filtered by source lesson. Starting takes a snapshot of the first ten visible IDs (or fewer), in list order. Each card shows the Arabic meaning, invites recall, then reveals the authored Dutch text, lesson tip, and optional audio. Self-rating buttons appear only after reveal. Audio uses the existing player and stops when its card unmounts.

The summary is explicitly a self-rating, not an objective score or proficiency measure. It can restart only the phrases rated for more practice. Ratings never remove/reorder saved IDs automatically, and no spaced-repetition schedule is claimed. Learners can explicitly remove individual phrases or confirm clearing the entire list from the list view.

Session snapshots and ratings are in memory only; reload/navigation resets them. Changes from another tab refresh the saved list but do not mutate an active session snapshot or re-add removed phrases. The list view reflects the latest saved IDs when the session ends. An invalidated lesson filter falls back to all lessons.

## Validation

Native tests cover schema/version/bounds, unknown IDs, deduplication, add/remove ordering, and ten-card session limits. Browser tests cover explicit additions from lessons and both training summaries, absence of automatic persistence, replay of difficult cards, filtering/removal, clear confirmation, progress isolation, persistence/reload, malformed recovery, quota failure/retry, sequential tab updates, and mobile layout. Existing account, content, placement, listening, and writing tests remain required.

This feature adds no dependency, migration, payment, audio asset, AI service, or new linguistic content. Curriculum language review and generation of real MP3 assets remain separate work.
