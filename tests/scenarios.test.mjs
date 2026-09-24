import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateScenarios } from "../scripts/lib/validate-scenarios.mjs";
import { newScenarioSession, reduceScenario } from "../src/lib/scenario-session.ts";

const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const [scenarios, lessons, units] = await Promise.all([read("scenarios"), read("lessons"), read("a1-roadmap")]);

test("eight scenarios connect 32 guided turns and eight transfer tasks to real learning goals", () => {
  assert.deepEqual(validateScenarios(scenarios, lessons, units), []);
  assert.equal(scenarios.length, 8);
  assert.equal(scenarios.flatMap((scenario) => scenario.turns).length, 32);
  assert.equal(new Set(scenarios.map((scenario) => scenario.unitId)).size, 8);
  for (const scenario of scenarios) assert.ok(scenario.transfer.model.length <= 500);
});

test("scenario validation rejects broken links, incomplete feedback and ambiguous choice contracts", () => {
  const copy = structuredClone(scenarios);
  copy[0].sourceLessons = ["unknown"];
  copy[1].unitId = "missing";
  copy[1].slug = copy[0].slug;
  copy[0].turns[1].id = copy[0].turns[0].id;
  copy[0].turns[0].choices[1].text = `  ${copy[0].turns[0].choices[0].text.toUpperCase()} `;
  copy[0].turns[1].choices[0].feedback = "";
  copy[0].turns[2].correctIndex = 3;
  copy[0].turns[3].responseTranslation = "";
  copy[0].transfer.model = "x".repeat(501);
  const errors = validateScenarios(copy, lessons, units).join("\n");
  for (const message of ["lesson links", "duplicate slug", "duplicate turn ID", "duplicate choices", "choices or feedback", "answer key", "turn text or translation", "transfer task"]) assert.ok(errors.includes(message), message);
  for (const bad of [null, [], [null], [{}], [{ ...scenarios[0], turns: [null, {}, []] }]]) assert.ok(validateScenarios(bad, lessons, units).length);
});

test("unanswered or unsuitable responses cannot advance and retries retain the first choice", () => {
  const scenario = scenarios[0], turn = scenario.turns[0];
  let state = newScenarioSession();
  for (const action of [{ type: "next" }, { type: "check" }, { type: "select", choice: -1 }, { type: "select", choice: 3 }, { type: "select", choice: NaN }]) assert.equal(reduceScenario(scenario, state, action), state);
  const wrong = (turn.correctIndex + 1) % 3;
  state = reduceScenario(scenario, state, { type: "select", choice: wrong });
  state = reduceScenario(scenario, state, { type: "check" });
  assert.equal(state.firstChoice, wrong);
  assert.equal(state.history.length, 0);
  assert.equal(reduceScenario(scenario, state, { type: "next" }), state);
  state = reduceScenario(scenario, state, { type: "select", choice: turn.correctIndex });
  assert.equal(state.feedback, null);
  state = reduceScenario(scenario, state, { type: "check" });
  assert.deepEqual(state.history, [{ firstChoice: wrong, usedModel: false }]);
  for (const action of [{ type: "check" }, { type: "model" }, { type: "select", choice: wrong }]) assert.equal(reduceScenario(scenario, state, action), state);
  state = reduceScenario(scenario, state, { type: "next" });
  assert.equal(state.index, 1);
  assert.equal(state.selected, null);
  assert.equal(state.firstChoice, null);
});

test("model help records assistance both before an answer and after an unsuitable answer", () => {
  const scenario = scenarios[0];
  const before = reduceScenario(scenario, newScenarioSession(), { type: "model" });
  assert.deepEqual(before.history, [{ firstChoice: null, usedModel: true }]);
  let state = reduceScenario(scenario, newScenarioSession(), { type: "select", choice: 0 });
  state = reduceScenario(scenario, state, { type: "check" });
  state = reduceScenario(scenario, state, { type: "model" });
  assert.deepEqual(state.history, [{ firstChoice: 0, usedModel: true }]);
  // An unsubmitted selection is not a first attempt.
  state = reduceScenario(scenario, newScenarioSession(), { type: "select", choice: scenario.turns[0].correctIndex });
  assert.equal(reduceScenario(scenario, state, { type: "model" }).history[0].firstChoice, null);
});

test("all scenarios finish with bounded immutable history and restart clears the entire attempt", () => {
  for (const scenario of scenarios) {
    let state = newScenarioSession();
    for (const turn of scenario.turns) {
      state = reduceScenario(scenario, state, { type: "select", choice: turn.correctIndex });
      state = reduceScenario(scenario, state, { type: "check" });
      state = reduceScenario(scenario, state, { type: "next" });
    }
    assert.equal(state.index, scenario.turns.length);
    assert.deepEqual(state.history, scenario.turns.map((turn) => ({ firstChoice: turn.correctIndex, usedModel: false })));
    assert.equal(reduceScenario(scenario, state, { type: "next" }), state);
    assert.deepEqual(reduceScenario(scenario, state, { type: "restart" }), newScenarioSession());
  }
});
