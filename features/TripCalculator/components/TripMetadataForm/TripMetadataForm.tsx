"use client";

import cn from "classnames";
import type { TripMetadataFormProps } from "./TripMetadataForm.types";
import styles from "./TripMetadataForm.module.css";

export function TripMetadataForm({
  metadata,
  onChange,
}: TripMetadataFormProps) {
  return (
    <section className={styles.metadataForm} aria-label="Trip details">
      <div className={cn(styles.metadataFormField, styles.metadataFormFieldWide)}>
        <label htmlFor="tripName">Trip name</label>
        <input
          id="tripName"
          type="text"
          value={metadata.tripName}
          onChange={(e) => onChange({ ...metadata, tripName: e.target.value })}
        />
      </div>

      <div className={styles.metadataFormField}>
        <label htmlFor="tripDateFrom">Trip dates</label>
        <div className={styles.metadataFormDateRange}>
          <input
            id="tripDateFrom"
            type="date"
            aria-label="From"
            value={metadata.tripDateFrom}
            onChange={(e) =>
              onChange({ ...metadata, tripDateFrom: e.target.value })
            }
          />
          <span className={styles.metadataFormDateSep}>&rarr;</span>
          <input
            id="tripDateTo"
            type="date"
            aria-label="To"
            value={metadata.tripDateTo}
            onChange={(e) =>
              onChange({ ...metadata, tripDateTo: e.target.value })
            }
          />
        </div>
      </div>

      <div className={styles.metadataFormRates}>
        <div className={styles.metadataFormField}>
          <label htmlFor="hufToGbp">HUF &rarr; GBP rate</label>
          <input
            id="hufToGbp"
            type="number"
            step="0.0001"
            min="0"
            value={metadata.exchangeRates.hufToGbp}
            onChange={(e) =>
              onChange({
                ...metadata,
                exchangeRates: {
                  ...metadata.exchangeRates,
                  hufToGbp: Number(e.target.value),
                },
              })
            }
          />
        </div>

        <div className={styles.metadataFormField}>
          <label htmlFor="eurToGbp">EUR &rarr; GBP rate</label>
          <input
            id="eurToGbp"
            type="number"
            step="0.0001"
            min="0"
            value={metadata.exchangeRates.eurToGbp}
            onChange={(e) =>
              onChange({
                ...metadata,
                exchangeRates: {
                  ...metadata.exchangeRates,
                  eurToGbp: Number(e.target.value),
                },
              })
            }
          />
        </div>
      </div>
    </section>
  );
}