"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedTrip, TripListFilter } from "../tripList.types";

type Status = "loading" | "idle" | "error";

export function useTripList(filter: TripListFilter) {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadCount, setReloadCount] = useState(0);

  const refetch = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");
    const params = new URLSearchParams();
    if (filter.name) params.set("name", filter.name);
    if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
    if (filter.dateTo) params.set("dateTo", filter.dateTo);

    const delay = reloadCount > 0 ? 0 : 300;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/trips?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to load trips");
        const data = (await response.json()) as SavedTrip[];
        if (!cancelled) {
          setTrips(data);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [filter.name, filter.dateFrom, filter.dateTo, reloadCount]);

  return { trips, status, refetch };
}
