import { createId } from "../../TripCalculator.utils";
import type { TransportationSectionProps } from "./TransportationSection.types";

type TransportItem = TransportationSectionProps["items"][number];

export function addItem(items: TransportItem[]): TransportItem[] {
  return [
    ...items,
    {
      id: createId("trans"),
      name: "New transport",
      price: 0,
      currency: "GBP",
      pricingType: "group",
      units: 1,
    },
  ];
}

export function removeItem(items: TransportItem[], id: string): TransportItem[] {
  return items.filter((item) => item.id !== id);
}

export function updateItem(
  items: TransportItem[],
  id: string,
  patch: Partial<TransportItem>
): TransportItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}