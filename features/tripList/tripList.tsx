"use client";

import { useCallback } from "react";
import Link from "next/link";
import cn from "classnames";
import useHandleConfirmDelete from "./hooks/useHandleConfirmDelete";
import { ConfirmationModal } from "@/components";
import { useCurrentUser } from "@/context";
import TripListGrid from "./components/TripListGrid";
import TripListFilters from "./components/TripListFilters";
import styles from "./TripList.module.css";

 function TripList() {
  const { isAdmin } = useCurrentUser();
  const {
    handleConfirmDelete,
    filter,
    setFilter,
    status,
    trips,
    deleteError,
    deletingId,
    pendingDelete,
    setPendingDelete,
  } = useHandleConfirmDelete();

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, tripId: string, tripName: string) => {
      e.preventDefault();
      e.stopPropagation();
      setPendingDelete({ id: tripId, name: tripName });
    },
    [setPendingDelete]
  );

  return (
    <main className={styles.tripList}>
      <div className={styles.tripListTopbar}>
        <h1>Saved trips</h1>
        {isAdmin && (
          <Link className={styles.tripListLink} href="/">
            + New trip
          </Link>
        )}
      </div>

      <TripListFilters filter={filter} setFilter={setFilter} />

      {deleteError && (
        <p className={cn(styles.tripListStatus, styles.tripListStatusError)}>
          {deleteError}
        </p>
      )}

      {status === "loading" && (
        <p className={styles.tripListStatus}>Loading trips…</p>
      )}
      {status === "error" && (
        <p className={cn(styles.tripListStatus, styles.tripListStatusError)}>
          Couldn&apos;t load trips.
        </p>
      )}

      {status === "idle" && trips.length === 0 && (
        <p className={styles.tripListStatus}>No trips match your search yet.</p>
      )}

      <TripListGrid
        deletingId={deletingId}
        handleDeleteClick={handleDeleteClick}
        isAdmin={isAdmin}
        trips={trips}
      />

      <ConfirmationModal
        isOpen={pendingDelete !== null}
        title="Delete trip?"
        message={`Are you sure you want to delete "${pendingDelete?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  );
}
export default TripList