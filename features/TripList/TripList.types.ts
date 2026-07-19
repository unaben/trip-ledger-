import type { SavedTrip } from "@/features/TripCalculator/TripCalculator.types";
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
