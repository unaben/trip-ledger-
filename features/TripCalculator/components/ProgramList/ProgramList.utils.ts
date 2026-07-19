import type { ProgramLineItem } from "../../TripCalculator.types";
import { createId } from "../../TripCalculator.utils";

export function addProgram(programs: ProgramLineItem[]): ProgramLineItem[] {
  return [
    ...programs,
    {
      id: createId("prog"),
      name: "New item",
      price: 0,
      currency: "GBP",
      pricingType: "group",
    },
  ];
}

export function removeProgram(
  programs: ProgramLineItem[],
  id: string
): ProgramLineItem[] {
  return programs.filter((p) => p.id !== id);
}

export function updateProgram(
  programs: ProgramLineItem[],
  id: string,
  patch: Partial<ProgramLineItem>
): ProgramLineItem[] {
  return programs.map((p) => (p.id === id ? { ...p, ...patch } : p));
}
