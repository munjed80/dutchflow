import data from "@/data/scenarios.json";
import type { Scenario } from "./scenario-session";

export const scenarios: Scenario[] = data;
export function getScenario(slug: string) { return scenarios.find((scenario) => scenario.slug === slug); }
