# DutchFlow language-rich learning strategy

Updated 2026-10-09.

DutchFlow should grow as a **language-rich learning environment**, not as a lesson counter. More lessons are useful only when they increase usable language, retrieval, transfer and natural expression.

## Core lesson standard

A strong lesson should expose the learner to several layers around one communicative goal:

1. **Core phrases** — short, high-frequency sentences that can be heard, read and reviewed.
2. **Contextual dialogue** — the same language used between real roles.
3. **Grammar in use** — one focused form explained through the lesson, not a full grammar dump.
4. **Vocabulary/form notes** — article/plural, verb forms and meaning tied to an actual phrase.
5. **Extra contextual examples** — nearby situations that expand the pattern beyond one memorised sentence.
6. **Collocations** — words learners should acquire together, not as isolated dictionary entries.
7. **Natural alternatives** — another normal way a Dutch speaker may express the same intention.
8. **Common mistakes** — contrast an attractive learner error with a defensible correction and short reason.
9. **Comprehension** — distinct questions that test meaning, time, role, obligation, change or inference.
10. **Production** — open writing/speaking where several valid formulations are possible.
11. **Recycling** — important language must reappear later in a different context.

Completion of a lesson is not evidence of CEFR proficiency. The purpose of these layers is depth and transfer.

## Language Depth data contract

The optional `languageDepth` block on a lesson extension contains:

- 4+ additional Dutch/Arabic examples with an Arabic usage note;
- 3+ collocations;
- 2+ natural alternatives with a usage distinction;
- 2+ common mistakes with corrected Dutch and an Arabic explanation.

These items are **not** added to the audio inventory automatically. Core spoken phrases remain the controlled recording bank. Language-depth examples can later receive selective audio if listening evidence shows value.

## Editorial principles

Prefer:

- high-frequency Netherlands Dutch;
- short real-world sentences before abstract explanation;
- specific distinctions such as deadline vs start time, option vs confirmation, permission vs obligation;
- formulaic chunks that learners can reuse immediately;
- contrasts between two natural forms only when the difference is meaningful;
- common learner errors that are plausible, not invented caricatures;
- Arabic explanations that clarify use rather than translate word-for-word.

Avoid:

- synonym lists without context;
- rare vocabulary added only to inflate counts;
- full paradigm dumps inside practical lessons;
- marking one valid formulation as the only acceptable Dutch;
- legal/medical/institutional claims presented as universal facts when the example is fictional;
- increasing lesson count without increasing communicative capability.

## Rollout

### Phase 1 — benchmark
The eight fifth A2 lessons introduced in PR #32 establish the Language Depth benchmark.

### Phase 2 — full A2 depth
Roll the same structure through the preceding 32 A2 lessons in unit-sized batches. Each batch should be editorially reviewed and pass CI before moving on.

### Phase 3 — cross-unit recycling
Build a recycling matrix of:
- high-value verbs;
- connectors;
- time expressions;
- service/work/school/travel chunks;
- reason, comparison, clarification and confirmation patterns.

Important items should recur in later units with a new purpose rather than identical repetition.

### Phase 4 — richer practice
Add controlled transformation and retrieval activities where they add a new cognitive demand, for example:
- old information → current information;
- formal → informal;
- statement → polite question;
- one-person message → relay to a third person;
- present routine → past experience;
- proposal → accepted final arrangement.

These activities should remain practice unless they have a validated scoring model.

## Success criteria

DutchFlow is becoming linguistically rich when a learner can encounter the same useful language in several forms and contexts and then produce it independently.

Raw counts remain useful inventory metrics, but quality decisions should be based on:
- breadth of communicative functions;
- lexical recycling;
- naturalness;
- ambiguity rate;
- learner error patterns;
- educator review;
- observed learner transfer.
