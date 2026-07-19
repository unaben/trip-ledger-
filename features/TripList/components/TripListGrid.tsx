import Link from "next/link";
import type { SavedTrip } from "../TripList.types";
import styles from "../TripList.module.css";

type TripListGridProps = {
  trips: SavedTrip[];
  isAdmin: boolean;
  handleDeleteClick: (
    e: React.MouseEvent,
    tripId: string,
    tripName: string
  ) => void;
  deletingId: string | null;
};

const TripListGrid = (props: TripListGridProps) => {
  const { deletingId, handleDeleteClick, isAdmin, trips } = props;
  return (
    <div className={styles.tripListGrid}>
      {trips.map((trip) => (
        <Link
          className={styles.tripCard}
          href={`/trips/${trip.id}`}
          key={trip.id}
        >
          <div className={styles.tripCardTopline}>
            <h2 className={styles.tripCardName}>{trip.metadata.tripName}</h2>
            {isAdmin && (
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
            )}
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
  );
};

export default TripListGrid;
