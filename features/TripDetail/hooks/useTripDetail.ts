"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  SavedTrip,
  TripData,
} from "@/features/TripCalculator/TripCalculator.types";

type Status = "loading" | "idle" | "not-found" | "error";
type SaveStatus = "idle" | "saving" | "error";

export function useTripDetail(tripId: string) {
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");
    (async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}`);
        if (response.status === 404) {
          if (!cancelled) setStatus("not-found");
          return;
        }
        if (!response.ok) throw new Error("Failed to load trip");
        const data = (await response.json()) as SavedTrip;
        if (!cancelled) {
          setTrip(data);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const saveTrip = useCallback(
    async (data: TripData): Promise<boolean> => {
      setSaveStatus("saving");
      try {
        const response = await fetch(`/api/trips/${tripId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to save trip");
        const updated = (await response.json()) as SavedTrip;
        setTrip(updated);
        setSaveStatus("idle");
        return true;
      } catch {
        setSaveStatus("error");
        return false;
      }
    },
    [tripId]
  );

  return { trip, status, saveTrip, saveStatus };
}
