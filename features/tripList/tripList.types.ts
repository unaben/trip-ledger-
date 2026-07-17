import type { SavedTrip } from "@/features/TripCalculator/TripCalculator.types";

/** What the person has typed into the search/filter fields. */
export interface TripListFilter {
  name: string;
  dateFrom: string;
  dateTo: string;
}

export interface PendingDelete {
  id: string;
  name: string;
}

export type { SavedTrip };
