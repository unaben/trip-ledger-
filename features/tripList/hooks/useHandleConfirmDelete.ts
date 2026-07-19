import { useState } from "react";
import type { TripListFilter, PendingDelete } from "../TripList.types";
import { useTripList } from "./useTripList";

export const EMPTY_FILTER: TripListFilter = { name: "", dateFrom: "", dateTo: "" };

const useHandleConfirmDelete = () => {
  const [filter, setFilter] = useState<TripListFilter>(EMPTY_FILTER);
  const { trips, status, refetch } = useTripList(filter);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null
  );
  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const { id: tripId } = pendingDelete;

    setPendingDelete(null);
    setDeletingId(tripId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete trip");
      }
      refetch();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete trip"
      );
    } finally {
      setDeletingId(null);
    }
  }
  return {
    handleConfirmDelete,
    filter,
    setFilter,
    status,
    trips,
    deleteError,
    deletingId,
    setDeleteError,
    setDeletingId,
    pendingDelete,
    setPendingDelete,
  };
};
export default useHandleConfirmDelete;
