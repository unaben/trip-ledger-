import type { TransportationItem } from "../../TripCalculator.types";

export interface TransportationSectionProps {
  items: TransportationItem[];
  onChange: (next: TransportationItem[]) => void;
}
