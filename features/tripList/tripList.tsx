"use client";

import Link from "next/link";
import cn from "classnames";
import useHandleConfirmDelete, {
  EMPTY_FILTER,
} from "./hooks/useHandleConfirmDelete";
import { ConfirmationModal } from "@/commons/components";
import styles from "./tripList.module.css";

export function TripList() {
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

  function handleDeleteClick(
    e: React.MouseEvent,
    tripId: string,
    tripName: string
  ) {
    e.preventDefault(); 
    e.stopPropagation();
    setPendingDelete({ id: tripId, name: tripName });
  }

  return (
    <main className={styles.tripList}>
      <div className={styles.tripListTopbar}>
        <h1>Saved trips</h1>
        <Link className={styles.tripListLink} href="/">
          + New trip
        </Link>
      </div>

      <section
        className={styles.tripListFilters}
        aria-label="Search saved trips"
      >
        <div className={styles.tripListField}>
          <label htmlFor="filterName">Trip name</label>
          <input
            id="filterName"
            type="text"
            placeholder="Search by name…"
            value={filter.name}
            onChange={(e) => setFilter((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className={styles.tripListField}>
          <label htmlFor="filterFrom">From date</label>
          <input
            id="filterFrom"
            type="date"
            value={filter.dateFrom}
            onChange={(e) =>
              setFilter((f) => ({ ...f, dateFrom: e.target.value }))
            }
          />
        </div>
        <div className={styles.tripListField}>
          <label htmlFor="filterTo">To date</label>
          <input
            id="filterTo"
            type="date"
            value={filter.dateTo}
            onChange={(e) =>
              setFilter((f) => ({ ...f, dateTo: e.target.value }))
            }
          />
        </div>
        {(filter.name || filter.dateFrom || filter.dateTo) && (
          <button
            type="button"
            className={styles.tripListClear}
            onClick={() => setFilter(EMPTY_FILTER)}
          >
            Clear filters
          </button>
        )}
      </section>

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

      <div className={styles.tripListGrid}>
        {trips.map((trip) => (
          <Link
            className={styles.tripCard}
            href={`/trips/${trip.id}`}
            key={trip.id}
          >
            <div className={styles.tripCardTopline}>
              <h2 className={styles.tripCardName}>{trip.metadata.tripName}</h2>
              <button
                type="button"
                className={styles.tripCardDelete}
                onClick={(e) =>
                  handleDeleteClick(e, trip.id, trip.metadata.tripName)
                }
                disabled={deletingId === trip.id}
                aria-label={`Delete ${trip.metadata.tripName}`}
              >
                {deletingId === trip.id ? "Deleting…" : "Delete"}
              </button>
            </div>
            <p className={styles.tripCardDates}>
              {trip.metadata.tripDateFrom} &rarr; {trip.metadata.tripDateTo}
            </p>
            <div className={styles.tripCardMeta}>
              <span>{trip.scenarios.length} scenarios</span>
              <span>Sale price £{trip.packageSalePriceGbp}</span>
            </div>
          </Link>
        ))}
      </div>

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
