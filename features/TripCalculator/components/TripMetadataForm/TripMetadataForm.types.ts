import type { TripMetadata } from "../../TripCalculator.types";

export interface TripMetadataFormProps {
  metadata: TripMetadata;
  onChange: (next: TripMetadata) => void;
}
