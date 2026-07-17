import type { AccommodationStay } from "../../TripCalculator.types";

export interface AccommodationSectionProps {
  stays: AccommodationStay[];
  onChange: (next: AccommodationStay[]) => void;
}
