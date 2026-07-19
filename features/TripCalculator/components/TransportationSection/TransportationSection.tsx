"use client";

import cn from "classnames";
import type { Currency, PricingType } from "../../TripCalculator.types";
import { CURRENCY_CLASS, PRICING_TYPES } from "./constants";
import { CURRENCIES } from "@/constants";
import { addItem, removeItem, updateItem } from "./TransportationSection.utils";
import type { TransportationSectionProps } from "./TransportationSection.types";
import styles from "./TransportationSection.module.css";

export function TransportationSection(props: TransportationSectionProps) {
  const { items, onChange } = props;

  const handleUpdate = (id: string, patch: Partial<(typeof items)[number]>) =>
    onChange(updateItem(items, id, patch));

  const handleRemove = (id: string) => onChange(removeItem(items, id));

  const handleAdd = () => onChange(addItem(items));

  return (
    <section
      className={styles.transportationSection}
      aria-label="Transportation"
    >
      <div className={styles.transportationSectionHeader}>
        <h2>Transportation</h2>
        <button
          type="button"
          className={styles.transportationSectionAdd}
          onClick={handleAdd}
        >
          + Add transport
        </button>
      </div>

      <div className={styles.transportationSectionTable} role="table">
        <div
          className={cn(
            styles.transportationSectionRow,
            styles.transportationSectionRowHead
          )}
          role="row"
        >
          <span role="columnheader">Item</span>
          <span role="columnheader">Price</span>
          <span role="columnheader">Currency</span>
          <span role="columnheader">Pricing</span>
          <span role="columnheader">Units</span>
          <span role="columnheader" aria-label="Remove" />
        </div>

        {items.map((item) => (
          <div
            className={styles.transportationSectionRow}
            role="row"
            key={item.id}
          >
            <input
              className={styles.transportationSectionName}
              type="text"
              value={item.name}
              onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
              aria-label="Transport name"
            />
            <input
              className={cn(styles.transportationSectionPrice, "tabular-num")}
              type="number"
              min="0"
              step="0.01"
              value={item.price}
              onChange={(e) =>
                handleUpdate(item.id, { price: Number(e.target.value) })
              }
              aria-label="Price"
            />
            <select
              className={cn(
                styles.transportationSectionCurrency,
                styles[CURRENCY_CLASS[item.currency]]
              )}
              value={item.currency}
              onChange={(e) =>
                handleUpdate(item.id, { currency: e.target.value as Currency })
              }
              aria-label="Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className={styles.transportationSectionPricingType}
              value={item.pricingType}
              onChange={(e) =>
                handleUpdate(item.id, {
                  pricingType: e.target.value as PricingType,
                })
              }
              aria-label="Pricing type"
            >
              {PRICING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              className={cn(styles.transportationSectionUnits, "tabular-num")}
              type="number"
              min="0"
              value={item.units}
              onChange={(e) =>
                handleUpdate(item.id, { units: Number(e.target.value) })
              }
              aria-label="Units"
            />
            <button
              type="button"
              className={styles.transportationSectionRemove}
              onClick={() => handleRemove(item.id)}
              aria-label={`Remove ${item.name}`}
              title="Remove transport"
            >
              &times;
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <p className={styles.transportationSectionEmpty}>
            No transportation costs yet. Add one below.
          </p>
        )}
      </div>

      <p className={styles.transportationSectionHint}>
        Every item adds to the total. Cost = price &times; units (&times; total
        travelers if &quot;per person&quot;).
      </p>
    </section>
  );
}
