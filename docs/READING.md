# Contextual reading library

The free `/reading` library extends the existing phrase-based lessons with fourteen original short Dutch texts for guided beginner reading. These are authored teaching examples, not copied letters, live service instructions, official exam material, or a complete CEFR syllabus.

## Current content

| Text | Situation | Language focus |
| --- | --- | --- |
| Een nieuwe buurvrouw | A neighbour introduces herself and invites someone for coffee | Possessive `mijn` |
| De ochtend van Samer | School drop-off and a workday routine | Main-clause word order after `daarna`; clock expressions |
| Boodschappen voor de lunch | A shopping trip and café visit | `geen` with an indefinite mass noun |
| Een boodschappenlijstje | Quantities, a unit price and a conditional substitute | `geen` and `hoeven ... te` for something not needed |
| Een andere bushalte | A temporary bus stop and directions | `willen` followed by an infinitive |
| Uw afspraak is verplaatst | An appointment changes day and time | Separable `meenemen` in an instruction |
| Nog een document voor uw afspraak | A missing municipal document and a follow-up message | `om ... te` for the purpose of a new appointment |
| Een bericht van school | A class trip and collection instructions | A reason introduced by `want` |
| Een afwezigheidsbericht | A parent reports illness, requests homework, and offers a callback option | `dus` for a practical consequence |
| Een bericht aan de verhuurder | A repair request and availability | A polite `Kunt u ...?` request |
| Een kamer voor een logé | A guest room, furniture positions and an arrival time | `tussen ... en ...` and spatial reference |
| Een bericht voor de ochtendploeg | A work team's tasks and break | Instructions ordered by `eerst` and `daarna` |
| De lesweek van Nour | Course dates, weekly frequency and activities after class | Word order after a day phrase; clock times and duration |
| Een zaterdag in het park | A weekend invitation, the weather, and a meeting plan | Separable `afspreken` in a time/place plan |

There are 73 contextual vocabulary/expression notes, fourteen grammar notes, and 48 comprehension questions. The original 20 lessons, 101 phrase IDs, audio manifest, saved progress IDs, and review IDs remain unchanged. Reading texts are not automatically included in audio generation or the saved phrase review list.

## Learning flow

The lesson catalogue links to the library, and relevant lesson pages link to associated texts. Each reading has an LTR Dutch passage, a collapsed Arabic translation, vocabulary with noun articles where relevant, a grammar explanation with an exact passage example, and three or four questions. Related lessons and the next reading are linked at the end. Letter paragraphs and salutations retain their authored line breaks in Dutch and Arabic.

This is open-text guided practice: learners may consult the passage, translation, and notes freely. Checking requires all questions to be answered. Feedback explains every answer and quotes the relevant passage evidence. Revising any answer clears the previous result before regrading; restart, reload, or moving to another text resets the attempt. Results are in component state only. They do not save scores, grant completion, change review storage, or measure general proficiency.

The passage, translation, vocabulary, and grammar are rendered on the server. Only the current reading's questions enter `ReadingQuiz`. Answers are intentionally available in its client data because this is free practice, not a secure paid exam. No account, database, payment, AI API, or audio asset is required.

## Authoring and validation

Edit `src/data/readings.json`. Keep slugs and question IDs stable; use unique questions/options and a single unambiguous answer. Specify existing `sourceLessons` based on actual topic relevance. Give each vocabulary note a dictionary form, an exact inflected `excerpt` found in the passage, and an Arabic contextual explanation. Grammar examples and each answer's `evidence` must occur verbatim in the text. The example and evidence are original authored content, not externally sourced quotations.

`npm run content:check` now validates readings alongside the existing curriculum and placement bank. `validateReadings` checks object shape, Arabic text presence, 35–150-word passage lengths, existing lesson links, vocabulary references, grammar examples, unique identifiers/options, answer-key bounds, and passage evidence. Native tests mutate these fields to verify rejection. These checks establish structural consistency, **not linguistic correctness or whether an answer follows logically from its evidence**.

Editorial review during implementation checked narrative consistency, Dutch/Arabic correspondence, the distinction between old and new appointment times, `half negen`/`half tien`, task ordering, relevant lesson links, and contextual vocabulary. **Independent review by a qualified Dutch/Arabic language editor is still pending.** Do not describe the texts as certified A1 material or professionally language-reviewed. Further enrichment should add longer varied passages, broader vocabulary, and original production tasks after reviewing this bank.

Browser tests cover discovery, all fourteen routes and 404, translation reveal, contextual notes, required answers, answer evidence, changed-answer regrading, restart/navigation/reload, mobile layout, and unchanged guest/review storage. The services reading has a dedicated mobile flow covering paragraph formatting, a wrong Friday-deadline answer corrected to **before Friday**, regrading, reload, catalogue return and unchanged completion/review storage. The guest-room mobile flow checks arrival time versus work finish, furniture locations, required answers, evidence and regrading. The shopping-list mobile flow distinguishes the price per kilogram from the requested quantity, corrects a mistaken price with passage evidence, and checks the conditional bread substitute. CI continues to run the full account, lesson, placement, listening, writing, and review suites.
