# A2 cross-unit retrieval and recycling

## Review of merged PRs #31–33

Baseline: main `3e2a053` after [PR #31](https://github.com/munjed80/dutchflow/pull/31), [PR #32](https://github.com/munjed80/dutchflow/pull/32) and [PR #33](https://github.com/munjed80/dutchflow/pull/33) were merged. Reviewed final heads: `a2301bc`, `467ab0f`, `9ce6f8f`.

- #31 completed the internal Dutch/Arabic consistency pass: registration deadline clarity, natural laptop request, school location, greeting and repair-target wording.
- #32 expanded the existing eight units from 32 to 40 lessons and introduced structured depth in the eight new lessons.
- #33 completed depth across all 40 lessons: 160 examples, 120 collocation entries, 80 alternatives and 80 mistake contrasts. Its handoff prioritizes recycling over another blanket enrichment layer.

All three final-head CI runs succeeded at review time. This is structural/editorial evidence, not independent language certification.

## Audit scope and decision

The inventory below covers all 120 authored collocation entries (118 distinct exact labels) in all 40 lessons. Exact duplicate labels: `een alternatief voorstellen` (2); `een wijziging doorgeven` (2).

This is a literal inventory of collocation labels, not a lemmatized search of all course text. Inflected forms, semantic equivalents, grammar patterns and occurrences in readings/dialogues are not counted. A single occurrence here does not prove absence elsewhere. Existing production is mostly situated within lessons; these additions make cross-unit retrieval explicit and accessible.

The eight selected bridges below cover every unit. Selection emphasizes communicative transfer (time, cause, address, certainty, obligation and choice), not an unsupported frequency or mastery ranking. They are a first targeted set, not exhaustive practice for all 120 entries.

## Selected bridges

| Set | Source chunks / lessons | New demand |
| --- | --- | --- |
| `past-and-present` | `Nederlands oefenen` — `a2-yesterday-and-today`; `goed thuiskomen` — `a2-following-up-after-a-social-event` | Past activity + arrival question; transform past to routine. |
| `delay-and-reason` | `vertraging oplopen` — `a2-explaining-a-delay`; `vertraging hebben` — `a2-reporting-a-travel-delay` | Travel delay recall; convert independent clauses to omdat word order. |
| `clarify-before-confirming` | `om verduidelijking vragen` — `a2-clarifying-instructions`; `een afspraak bevestigen` — `a2-confirming-a-replacement-appointment` | Clarify unknown time; relay formal confirmation informally. |
| `propose-an-alternative` | `een alternatief voorstellen` — `a2-explaining-an-appointment-conflict`; `een alternatief voorstellen` — `a2-responding-to-an-invitation` | Propose without assuming acceptance; turn command into polite request. |
| `updates-and-certainty` | `een wijziging doorgeven` — `a2-relaying-a-schedule-change`; `naar verwachting aankomen` — `a2-reporting-a-travel-delay` | Replace obsolete time; preserve uncertainty and change person in relay. |
| `choice-and-comparison` | `een keuze maken` — `a2-comparing-products`; `moeten overstappen` — `a2-comparing-travel-routes` | Justify route choice; compare prices and use a reason clause. |
| `request-and-follow-up` | `contact opnemen` — `a2-following-up-on-a-repair`; `een product terugbrengen` — `a2-asking-about-a-return` | Ask about a return; follow up without inventing a reply. |
| `instructions-and-deadlines` | `prioriteit hebben` — `a2-setting-work-priorities`; `voor een datum reageren` — `a2-finding-a-reply-deadline` | Order tasks with a deadline; preserve obligation versus permission. |

## Complete collocation inventory

| Unit / lesson | Authored collocation labels |
| --- | --- |
| `a2-recent-activities` / `a2-yesterday-and-today` | `boodschappen doen`; `thuis werken`; `Nederlands oefenen` |
| `a2-recent-activities` / `a2-a-day-at-work` | `de voorraad tellen`; `een lijst controleren`; `iemand om hulp vragen` |
| `a2-recent-activities` / `a2-a-weekend-visit` | `bij iemand op bezoek gaan`; `samen iets drinken`; `weer thuiskomen` |
| `a2-recent-activities` / `a2-telling-a-short-story` | `op de bus wachten`; `een bericht sturen`; `te laat aankomen` |
| `a2-recent-activities` / `a2-describing-a-changing-routine` | `een routine veranderen`; `elke dag / drie keer per week`; `vaker / minder vaak` |
| `a2-work-coordination` / `a2-reporting-task-progress` | `bijna klaar zijn met`; `een taak afronden`; `op de lijst staan` |
| `a2-work-coordination` / `a2-explaining-a-delay` | `vertraging oplopen`; `een tijd niet redden`; `iets alvast doorsturen` |
| `a2-work-coordination` / `a2-clarifying-instructions` | `instructies uitleggen`; `iets goed begrijpen`; `om verduidelijking vragen` |
| `a2-work-coordination` / `a2-confirming-a-handover` | `een taak op zich nemen`; `een overdracht bevestigen`; `klaarstaan voor vervoer` |
| `a2-work-coordination` / `a2-setting-work-priorities` | `prioriteit hebben`; `een taak afmaken`; `een controle doen` |
| `a2-housing-services` / `a2-reporting-a-recurring-problem` | `een probleem melden`; `een lekkage hebben`; `een probleem komt terug` |
| `a2-housing-services` / `a2-comparing-conditions-at-home` | `tocht voelen`; `goed sluiten`; `een verschil merken` |
| `a2-housing-services` / `a2-arranging-a-repair-visit` | `een afspraak inplannen`; `een tijdvak afspreken`; `thuis beschikbaar zijn` |
| `a2-housing-services` / `a2-following-up-on-a-repair` | `een probleem oplossen`; `contact opnemen`; `een terugkoppeling krijgen` |
| `a2-housing-services` / `a2-preparing-for-a-repair-visit` | `thuis zijn`; `aan de deur aanbellen`; `een afspraak noteren` |
| `a2-appointments-followup` / `a2-explaining-an-appointment-conflict` | `een afspraak verzetten`; `een afspraak komt niet uit`; `een alternatief voorstellen` |
| `a2-appointments-followup` / `a2-comparing-appointment-options` | `makkelijk bereikbaar zijn`; `een voorkeur hebben voor`; `een optie vergelijken` |
| `a2-appointments-followup` / `a2-confirming-a-replacement-appointment` | `een afspraak bevestigen`; `een afspraak vervalt`; `zich bij de receptie melden` |
| `a2-appointments-followup` / `a2-asking-for-an-appointment-update` | `een verzoek verwerken`; `een bevestiging ontvangen`; `een definitief antwoord krijgen` |
| `a2-appointments-followup` / `a2-finding-an-earlier-appointment` | `een plek vrijkomen`; `een afspraak verplaatsen`; `een bevestiging krijgen` |
| `a2-shopping-choices` / `a2-explaining-a-purchase-problem` | `een maat groter / kleiner`; `goed zitten`; `iets passen` |
| `a2-shopping-choices` / `a2-comparing-products` | `binnen het budget blijven`; `een keuze maken`; `praktisch voor dagelijks gebruik` |
| `a2-shopping-choices` / `a2-checking-quantities-and-prices` | `per stuk betalen`; `een set van twee`; `in totaal uitkomen op` |
| `a2-shopping-choices` / `a2-confirming-a-shop-alternative` | `op voorraad zijn`; `een bestelling aanpassen`; `iets klaarleggen` |
| `a2-shopping-choices` / `a2-asking-about-a-return` | `een product terugbrengen`; `iets voor een andere maat ruilen`; `geld terugkrijgen` |
| `a2-school-local-messages` / `a2-understanding-school-instructions` | `zich aanmelden voor`; `deelname is vrijwillig`; `iets mee moeten nemen` |
| `a2-school-local-messages` / `a2-finding-a-reply-deadline` | `een deadline halen`; `voor een datum reageren`; `een antwoord is binnen` |
| `a2-school-local-messages` / `a2-clarifying-a-local-form` | `een veld invullen`; `een veld leeg laten`; `iemand meetellen` |
| `a2-school-local-messages` / `a2-writing-a-relevant-reply` | `op een bericht reageren`; `een wijziging doorgeven`; `gebruikmaken van` |
| `a2-school-local-messages` / `a2-relaying-a-schedule-change` | `een wijziging doorgeven`; `hetzelfde blijven`; `een aanmelding blijft geldig` |
| `a2-travel-plans` / `a2-planning-a-day-trip` | `een dagje uit`; `ergens afspreken`; `genoeg tijd hebben om` |
| `a2-travel-plans` / `a2-comparing-travel-routes` | `rechtstreeks reizen`; `moeten overstappen`; `reistijd besparen` |
| `a2-travel-plans` / `a2-reporting-a-travel-delay` | `vertraging hebben`; `naar verwachting aankomen`; `iemand op de hoogte houden` |
| `a2-travel-plans` / `a2-agreeing-on-another-route` | `een route aanpassen`; `een alternatief nemen`; `een ontmoetingsplek afspreken` |
| `a2-travel-plans` / `a2-handling-a-missed-connection` | `een aansluiting missen`; `op de volgende trein wachten`; `rond zes uur aankomen` |
| `a2-social-experiences` / `a2-sharing-a-social-experience` | `mensen leren kennen`; `een gezellige sfeer`; `het naar je zin hebben` |
| `a2-social-experiences` / `a2-asking-follow-up-questions` | `een vervolgvraag stellen`; `ergens geweest zijn`; `ergens lang blijven` |
| `a2-social-experiences` / `a2-responding-to-an-invitation` | `zin hebben in`; `een uitnodiging aannemen`; `een alternatief voorstellen` |
| `a2-social-experiences` / `a2-confirming-a-social-plan` | `een afspraak staat vast`; `iets meenemen`; `een plan bevestigen` |
| `a2-social-experiences` / `a2-following-up-after-a-social-event` | `goed thuiskomen`; `een gezellige avond`; `iemand uitnodigen` |

## Learner and authoring contract

- `/a2-recycling` offers eight sets, each with one Arabic-only retrieval prompt and one Dutch-cued transformation (16 tasks total). Linked from `/a2` and the relevant source lessons; last set links to the integrated final review.
- Models and source-chunk help start collapsed. A learner may reveal them at any time. This is ungraded self-review, not enforced independent assessment.
- Reuses `ProductionPractice`: 500-character inputs, no persistence, no completion write, multiple valid answers allowed. Keyed by set slug to reset answers when navigating. No automatic scheduling or mastery tracking.
- Every anchor must name an existing A2 collocation and lesson, and every pair must span units. `content:check` validates these relationships and task structure; native mutation tests cover broken anchors and cue contracts.
- Dutch model and Arabic instructions were checked together for time, address, negation, information status and checklist alignment. All institutions, products and situations are fictional; return permission is asked, never asserted as policy.
- A1 and all core audio texts/IDs remain unchanged. A2 stays 40 lessons, 320 core phrases, 80 lesson production tasks and nine integrated packs. The 16 new tasks are a separate review bank; audio remains 696 sources / 2,784 variants, zero approved recordings.

## Remaining work

Use independent educator review and learner observation to identify which transfers actually fail before adding further sets. A semantic/lemmatized whole-course recycling audit and spaced scheduling are not implemented. Owner-managed MP3 generation, audio approval and the existing launch gates remain pending. Paid exams remain deferred.

## Validation

Local validation passed: `content:check`, `audio:check`, all 68 native tests, TypeScript, production build and all 159 Chromium end-to-end tests. After the final spacing/help-panel adjustment, the production build and both recycling browser tests passed again. Mobile (390px) and desktop (1280px) screens were visually inspected; no horizontal overflow. GitHub CI runs separately on the PR.
