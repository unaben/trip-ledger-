import type { ProgramLineItem } from "../../TripCalculator.types";

export interface ProgramListProps {
  programs: ProgramLineItem[];
  onChange: (next: ProgramLineItem[]) => void;
}
