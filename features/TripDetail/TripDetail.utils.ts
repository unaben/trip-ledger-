import type {
  SavedTrip,
  TripData,
} from "@/features/TripCalculator/TripCalculator.types";

export function toDraft(trip: SavedTrip): TripData {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...data
  } = trip;
  return data;
}
