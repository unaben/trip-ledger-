"use client";

import { useCallback, useEffect, useState } from "react";
import { createBlankTripData, createDefaultTripData } from "../TripCalculator.defaults";
import type { SavedTrip, TripData } from "../TripCalculator.types";

type SubmitStatus = "idle" | "submitting" | "error";

export function useTripForm() {
  const [tripData, setTripDataState] = useState<TripData>(() => createBlankTripData());
  const [status, setStatus] = useState<SubmitStatus>("idle");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/trips");
        if (!response.ok) return;
        const trips = (await response.json()) as unknown[];
        if (!cancelled && Array.isArray(trips) && trips.length === 0) {
          setTripDataState(createDefaultTripData());
        }
      } catch (err) {
        console.error("useTripForm: failed to check for existing trips:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTripData = useCallback((updater: (current: TripData) => TripData) => {
    setTripDataState((current) => updater(current));
  }, []);

  const resetForm = useCallback(() => {
    setTripDataState(createBlankTripData());
  }, []);

  const submitTrip = useCallback(async (): Promise<SavedTrip | null> => {
    setStatus("submitting");
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });
      if (!response.ok) throw new Error("Failed to submit trip");
      const saved = (await response.json()) as SavedTrip;
      setStatus("idle");
      resetForm();
      return saved;
    } catch (err) {
      console.error("useTripForm: failed to submit trip:", err);
      setStatus("error");
      return null;
    }
  }, [tripData, resetForm]);

  return { tripData, setTripData, status, submitTrip, resetForm };
}