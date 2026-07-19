import type { Currency } from "../../TripCalculator.types";
import { createId } from "../../TripCalculator.utils";
import type { AccommodationSectionProps } from "./AccommodationSection.types";

type Stay = AccommodationSectionProps["stays"][number];

export function addStay(stays: Stay[]): Stay[] {
  return [
    ...stays,
    {
      id: createId("stay"),
      name: "New hotel",
      pricePerNight: 0,
      currency: "HUF" as Currency,
      nights: 1,
    },
  ];
}

export function removeStay(stays: Stay[], id: string): Stay[] {
  return stays.filter((stay) => stay.id !== id);
}

export function updateStay(
  stays: Stay[],
  id: string,
  patch: Partial<Stay>
): Stay[] {
  return stays.map((stay) => (stay.id === id ? { ...stay, ...patch } : stay));
}