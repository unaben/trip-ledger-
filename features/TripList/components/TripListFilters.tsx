import { Dispatch, SetStateAction } from "react";
import { EMPTY_FILTER } from "../hooks/useHandleConfirmDelete";
import type { TripListFilter } from "../TripList.types";
import styles from "../TripList.module.css";

type TripListFiltersProps = {
  filter: TripListFilter;
  setFilter: Dispatch<SetStateAction<TripListFilter>>;
};

const TripListFilters = (props: TripListFiltersProps) => {
  const { filter, setFilter } = props;

  return (
    <section className={styles.tripListFilters} aria-label="Search saved trips">
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
          onChange={(e) => setFilter((f) => ({ ...f, dateTo: e.target.value }))}
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
  );
};

export default TripListFilters;
