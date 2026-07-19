"use client";

import cn from "classnames";
import { addStay, removeStay, updateStay } from "./AccommodationSection.utils";
import type { Currency } from "../../TripCalculator.types";
import type { AccommodationSectionProps } from "./AccommodationSection.types";
import styles from "./AccommodationSection.module.css";
import { CURRENCIES } from "@/constants";



export function AccommodationSection(props: AccommodationSectionProps) {
  const { stays, onChange } = props;

  const handleUpdate = (
    id: string,
    patch: Partial<AccommodationSectionProps["stays"][number]>
  ) => onChange(updateStay(stays, id, patch));

  const handleRemove = (id: string) => onChange(removeStay(stays, id));

  const handleAdd = () => onChange(addStay(stays));

  const totalNights = stays.reduce(
    (sum, stay) => sum + (Number(stay.nights) || 0),
    0
  );

  return (
    <section className={styles.accommodationSection} aria-label="Accommodation">
      <div className={styles.accommodationSectionHeader}>
        <h2>Accommodation</h2>
        <span className={styles.accommodationSectionTotalNights}>
          {totalNights} night{totalNights === 1 ? "" : "s"} total
        </span>
      </div>

      <div className={styles.accommodationSectionTable} role="table">
        <div
          className={cn(
            styles.accommodationSectionRow,
            styles.accommodationSectionRowHead
          )}
          role="row"
        >
          <span role="columnheader">Hotel</span>
          <span role="columnheader">Price / night</span>
          <span role="columnheader">Currency</span>
          <span role="columnheader">Nights</span>
          <span role="columnheader" aria-label="Remove" />
        </div>

        {stays.map((stay) => (
          <div
            className={styles.accommodationSectionRow}
            role="row"
            key={stay.id}
          >
            <input
              className={styles.accommodationSectionName}
              type="text"
              value={stay.name}
              onChange={(e) => handleUpdate(stay.id, { name: e.target.value })}
              aria-label="Hotel name"
            />
            <input
              className={styles.accommodationSectionPrice}
              type="number"
              min="0"
              step="0.01"
              value={stay.pricePerNight}
              onChange={(e) =>
                handleUpdate(stay.id, { pricePerNight: Number(e.target.value) })
              }
              aria-label="Price per night"
            />
            <select
              className={cn(
                styles.accommodationSectionCurrency,
                styles[
                  `accommodationSectionCurrency${stay.currency.charAt(
                    0
                  )}${stay.currency.slice(1).toLowerCase()}`
                ]
              )}
              value={stay.currency}
              onChange={(e) =>
                handleUpdate(stay.id, { currency: e.target.value as Currency })
              }
              aria-label="Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className={styles.accommodationSectionNights}
              type="number"
              min="0"
              value={stay.nights}
              onChange={(e) =>
                handleUpdate(stay.id, { nights: Number(e.target.value) })
              }
              aria-label="Number of nights"
            />
            <button
              type="button"
              className={styles.accommodationSectionRemove}
              onClick={() => handleRemove(stay.id)}
              aria-label={`Remove ${stay.name}`}
              title="Remove stay"
            >
              &times;
            </button>
          </div>
        ))}

        {stays.length === 0 && (
          <p className={styles.accommodationSectionEmpty}>
            No hotel stays yet. Add one below.
          </p>
        )}
      </div>

      <button
        type="button"
        className={styles.accommodationSectionAdd}
        onClick={handleAdd}
      >
        + Add hotel stay
      </button>
      <p className={styles.accommodationSectionHint}>
        Every stay adds to the total. Cost per stay = price per night &times;
        nights &times; total travelers.
      </p>
    </section>
  );
}