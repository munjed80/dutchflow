import type { ProductionTask } from "./curriculum";

export type ScenarioChoice = { text: string; translation: string; feedback: string };
export type ScenarioTurn = {
  id: string; goal: string; prompt: string; translation: string;
  choices: ScenarioChoice[]; correctIndex: number; response: string; responseTranslation: string;
};
export type Scenario = {
  slug: string; title: string; dutchTitle: string; unitId: string;
  role: string; partner: string; mission: string; sourceLessons: string[];
  turns: ScenarioTurn[]; transfer: ProductionTask;
};
export type ScenarioAttempt = { firstChoice: number | null; usedModel: boolean };
export type ScenarioState = {
  index: number; selected: number | null; feedback: number | null;
  firstChoice: number | null; history: ScenarioAttempt[];
};
export type ScenarioAction =
  | { type: "select"; choice: number }
  | { type: "check" }
  | { type: "model" }
  | { type: "next" }
  | { type: "restart" };

export function newScenarioSession(): ScenarioState {
  return { index: 0, selected: null, feedback: null, firstChoice: null, history: [] };
}

/** In-memory guided practice only; no completion, persistence or proficiency scoring. */
export function reduceScenario(scenario: Scenario, state: ScenarioState, action: ScenarioAction): ScenarioState {
  if (action.type === "restart") return newScenarioSession();
  const turn = scenario.turns[state.index];
  if (!turn) return state;
  const resolved = state.history.length > state.index;
  if (action.type === "next") {
    return resolved ? { ...state, index: state.index + 1, selected: null, feedback: null, firstChoice: null } : state;
  }
  if (resolved) return state;
  if (action.type === "select") {
    if (!Number.isInteger(action.choice) || action.choice < 0 || action.choice >= turn.choices.length) return state;
    return { ...state, selected: action.choice, feedback: null };
  }
  if (action.type === "model") {
    return { ...state, selected: turn.correctIndex, feedback: turn.correctIndex,
      history: [...state.history, { firstChoice: state.firstChoice, usedModel: true }] };
  }
  if (action.type === "check" && state.selected !== null) {
    const firstChoice = state.firstChoice ?? state.selected;
    return { ...state, firstChoice, feedback: state.selected,
      history: state.selected === turn.correctIndex ? [...state.history, { firstChoice, usedModel: false }] : state.history };
  }
  return state;
}
