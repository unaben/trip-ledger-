import type { Scenario } from "../../TripCalculator.types";
export function updateScenario(
  id: string,
  patch: Partial<Scenario>,
  scenarios: Scenario[]
) {
  return scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s));
}
