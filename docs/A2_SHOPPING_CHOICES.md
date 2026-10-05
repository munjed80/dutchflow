# A2 unit 5: shopping and choices

Historical unit 5 snapshot, 2026-10-04. This delivery opened PR #25 from merged PR #24. Head `0bb9459` passed full GitHub CI before the owner requested the next unit in the same PR. Current totals are in `A2_SCHOOL_LOCAL_MESSAGES.md`; the unit-specific editorial decisions below remain relevant.

## Inventory

| Resource | Added in unit 5 | Current A2 total |
| --- | ---: | ---: |
| Units / lessons | 1 / 4 | 5 / 20 |
| Phrases / lesson questions | 32 / 16 | 160 / 80 |
| Lexical notes / lesson writing tasks | 24 / 8 | 120 / 40 |
| Readings / lexical notes / questions | 1 / 6 / 4 | 5 / 30 / 20 |
| Scenarios / turns / transfers | 1 / 4 / 1 | 5 / 20 / 5 |
| Integrated packs / comprehension questions | 1 / 6 | 5 / 30 |
| Integrated writing / partner tasks | 1 / 1 | 5 / 5 |
| Spoken sources / four-variant requests | 33 / 132 | 165 / 660 |

A1 remains at 53 lessons and 1,468 audio requests. Combined audio is 532 sources / 2,128 variants. No recording was generated or approved; the owner handles that work. Authored unit counts do not establish proficiency or completion of A2.

## Lesson sequence and internal review

| Lesson | Communicative outcome | Reviewed distinctions |
| --- | --- | --- |
| 17 `a2-explaining-a-purchase-problem` | Describe a purchase problem and request a suitable alternative | Bought yesterday; current shirt M too small; try L. `dit/dat overhemd`, `te klein`, polite permission. A request to exchange does not mean approval; the fictional employee checks the receipt first. |
| 18 `a2-comparing-products` | Compare two products against needs and a budget | Blue bag €28/light; black €35/larger/heavier; budget at most €30. `deze/die tas`, `goedkoper/lichter dan`, and a reason with `omdat ... nodig heb`. |
| 19 `a2-checking-quantities-and-prices` | Distinguish items, sets, unit price and total | Need three cups: one set of two (€8) plus one loose cup (€4.50), total €12.50. All 300ml. `deze bekers`, `per stuk`, `in totaal`, `even groot`. No claim that an additional bag is free. |
| 20 `a2-confirming-a-shop-alternative` | Respond to a stock shortage and confirm fulfilment | Ordered two blue bowls; only one blue remains. White bowls also €6 each; choose one blue/one white, total €12. Confirm ready before pickup today before 18:00 at the service desk. `liever ... dan`, `nog maar`, `op voorraad` versus `klaarliggen`. |

The internal pass covers all 32 Dutch/Arabic phrase pairs, 16 lesson answer keys, 24 lexical/form notes and eight writing models. Models satisfy their requested details, preserve quantity/price distinctions, and stay within the 500-character limit. Original production permits other valid Dutch formulations. Formal customer/staff dialogues consistently use `u`. The examples are fictional and do not prescribe legal return rights or a universal shop policy.

Demonstrative explanations distinguish singular `de`/`het` and plurals, and restrict the near/far contrast to physical pointing rather than claiming that it explains every textual reference. Comparative practice uses standard `dan`; equality uses `even groot`. Primary references consulted: [Taaladvies — dit/dat/deze/die](https://taaladvies.net/dit-of-dat-deze-of-die-algemeen/) and [Taaladvies — groter als/dan](https://taaladvies.net/groter-als-of-dan/). Teaching examples are original. This pass is not independent educator sign-off.

## Supporting resources and answer evidence

- **Library reading `a2-an-offer-for-matching-cups`:** Amir needs four large cups in one colour. Small cups 200ml/€3; large 300ml/€4. Only two large blue cups versus four large green cups, €16 together. Stock is available but nothing reserved; a reservation request must state colour and quantity. Four questions cover capacity/unit price, sufficient matching stock, total, and required reply. Evidence includes all necessary premises, including the requested quantity.
- **Integrated written source:** Lina ordered three red storage boxes at €5 each, but only one red remains. Shop proposes three equally sized blue boxes at €4 each/€12 total. It is an offer awaiting her choice, not a modified or ready order. Questions target the shortage, comparison and pending status.
- **Connected listening `a2-passage-shopping-choices`:** the confirmed choice is one red plus two blue, €5 + €8 = €13 total. Ready at the service desk; collect today, explicitly Friday, before 17:00. The 56-word passage changes the written offer's colours and total. Questions reject carrying over €12 or interpreting €8 as the whole price, and distinguish pickup from delivery.
- **Scenario `a2-choosing-a-shop-replacement`:** Sam's €25 blue shirt M is too small; he can add at most €5. No blue L; green L €28 versus black L €32. Choose green within budget, try it, request exchange, then confirm the employee-approved €3 surcharge. Wrong choices have contextual explanations: unaffordable black, unavailable blue, no-charge assumption, or paying the full replacement price as a surcharge. Transfer uses a too-large €40 black coat and a fitting smaller €43 brown coat, asking rather than assuming approval.
- **Integrated production:** write a new request for four cups with two colours and equal size; ask for unknown total/readiness. Partner practice uses a new €25 budget and two bags (€22 light/€28 heavier), then asks about stock and responds to the partner's confirmation/payment instruction. No price or deadline is invented when the prompt leaves it unknown.

Ten new comprehension IDs have scoped remediation. Price/quantity errors link to lesson 19; stock, selection status and pickup errors to lesson 20; product comparison errors to lesson 18. Source evidence is validated as a literal excerpt and was separately checked for logical sufficiency.

## Compatibility and verification

All authored A1 files and every preceding A2 record are unchanged. Progress denominators remain separate: A1 53, A2 20. Navigation connects lesson 16 to 17 and the fifth reading/scenario/pack, then ends at the new endpoints. Storage, account schema/import and the A1 placement bank are unchanged. A captured fingerprint protects all 528 earlier A2 synthesis requests including their SSML and filenames, alongside the existing A1 and prior-unit checks.

Verified locally: all 64 native tests and all 140 Chromium end-to-end tests passed, plus content/audio integrity checks, A2 audio dry-run planning, TypeScript and production build. Browser coverage includes the new lesson boundary and progress, available-versus-reserved stock, superseded offer colours/prices, contextual remediation, fresh temporary state, surcharge negotiation and mobile layout. The complete suite also covers A1, accounts/import, listening assistance, writing and review. Local account tests use disposable PGlite/SMTP; GitHub CI uses PostgreSQL. Mobile partner practice (390px) and desktop reading were visually inspected without horizontal overflow. `git diff --check` passed.

Full GitHub CI runs separately on the new PR. Real audio quality, independent Dutch/Arabic review and learner observation remain unverified. Paid exams stay deferred. Next planned unit: school and local messages, distinguishing required/optional actions, deadlines and relevant replies.
