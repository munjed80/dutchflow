import a2Data from "@/data/a2-scenarios.json";
import data from "@/data/scenarios.json";
import type { Scenario } from "./scenario-session";

export const scenarios: Scenario[] = [...data, ...a2Data];
export function getScenario(slug: string) { return scenarios.find((scenario) => scenario.slug === slug); }
