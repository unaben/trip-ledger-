import type { Scenario, ScenarioResult } from "../../TripCalculator.types";

export interface ScenarioBoardProps {
  scenarios: Scenario[];
  results: ScenarioResult[];
  packageSalePriceGbp: number;
  onScenariosChange: (next: Scenario[]) => void;
  onPackageSalePriceChange: (next: number) => void;
}
