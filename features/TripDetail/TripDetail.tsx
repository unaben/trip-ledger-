"use client";

import cn from "classnames";
import { useState } from "react";
import Link from "next/link";
import { useTripDetail } from "./hooks/useTripDetail";
import TripDetailEdit from "./components/TripDetailEdit";
import TripDetailView from "./components/TripDetailView";
import type { TripData } from "@/features/TripCalculator/TripCalculator.types";
import type { TripDetailProps } from "./TripDetail.types";
import styles from "./TripDetail.module.css";

export function TripDetail({ tripId }: TripDetailProps) {
  const { trip, status, saveTrip, saveStatus } = useTripDetail(tripId);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draft, setDraft] = useState<TripData | null>(null);

  function startEditing() {
    if (!trip) return;
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...data
    } = trip;
    setDraft(data);
    setMode("edit");
  }

  function cancelEditing() {
    setDraft(null);
    setMode("view");
  }

  async function saveEditing() {
    if (!draft) return;
    const ok = await saveTrip(draft);
    if (ok) {
      setDraft(null);
      setMode("view");
    }
  }

  if (status === "loading") {
    return (
      <main className={cn(styles.tripDetail, styles.tripDetailMessage)}>
        <p>Loading trip…</p>
      </main>
    );
  }

  if (status === "not-found") {
    return (
      <main className={cn(styles.tripDetail, styles.tripDetailMessage)}>
        <p>This trip couldn&apos;t be found.</p>
        <Link className={styles.tripDetailLink} href="/trips">
          &larr; Back to saved trips
        </Link>
      </main>
    );
  }

  if (status === "error" || !trip) {
    return (
      <main className={cn(styles.tripDetail, styles.tripDetailMessage)}>
        <p>Something went wrong loading this trip.</p>
      </main>
    );
  }

  if (mode === "edit" && draft) {
    return (
      <TripDetailEdit
        draft={draft}
        setDraft={(updater) =>
          setDraft((current) => (current ? updater(current) : current))
        }
        saveStatus={saveStatus}
        onSave={saveEditing}
        onCancel={cancelEditing}
      />
    );
  }

  return <TripDetailView trip={trip} onEdit={startEditing} />;
}
