"use client";

import cn from "classnames";
import type { Currency, PricingType } from "../../TripCalculator.types";
import { createId } from "../../TripCalculator.utils";
import type { TransportationSectionProps } from "./TransportationSection.types";
import styles from './TransportationSection.module.css'

const CURRENCIES: Currency[] = ["GBP", "HUF", "EUR"];
const PRICING_TYPES: { value: PricingType; label: string }[] = [
  { value: "group", label: "Flat / group price" },
  { value: "perPerson", label: "Per person" },
];

const CURRENCY_CLASS: Record<Currency, string> = {
  GBP: "transportationSectionCurrencyGbp",
  HUF: "transportationSectionCurrencyHuf",
  EUR: "transportationSectionCurrencyEur",
};

export function TransportationSection({ items, onChange }: TransportationSectionProps) {
  function updateItem(id: string, patch: Partial<(typeof items)[number]>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([
      ...items,
      { id: createId("trans"), name: "New transport", price: 0, currency: "GBP", pricingType: "group", units: 1 },
    ]);
  }

  return (
    <section className={styles.transportationSection} aria-label="Transportation">
      <div className={styles.transportationSectionHeader}>
        <h2>Transportation</h2>
        <button type="button" className={styles.transportationSectionAdd} onClick={addItem}>
          + Add transport
        </button>
      </div>

      <div className={styles.transportationSectionTable} role="table">
        <div className={cn(styles.transportationSectionRow, styles.transportationSectionRowHead)} role="row">
          <span role="columnheader">Item</span>
          <span role="columnheader">Price</span>
          <span role="columnheader">Currency</span>
          <span role="columnheader">Pricing</span>
          <span role="columnheader">Units</span>
          <span role="columnheader" aria-label="Remove" />
        </div>

        {items.map((item) => (
          <div className={styles.transportationSectionRow} role="row" key={item.id}>
            <input
              className={styles.transportationSectionName}
              type="text"
              value={item.name}
              onChange={(e) => updateItem(item.id, { name: e.target.value })}
              aria-label="Transport name"
            />
            <input
              className={cn(styles.transportationSectionPrice, "tabular-num")}
              type="number"
              min="0"
              step="0.01"
              value={item.price}
              onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
              aria-label="Price"
            />
            <select
              className={cn(styles.transportationSectionCurrency, styles[CURRENCY_CLASS[item.currency]])}
              value={item.currency}
              onChange={(e) => updateItem(item.id, { currency: e.target.value as Currency })}
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
              onChange={(e) => updateItem(item.id, { pricingType: e.target.value as PricingType })}
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
              onChange={(e) => updateItem(item.id, { units: Number(e.target.value) })}
              aria-label="Units"
            />
            <button
              type="button"
              className={styles.transportationSectionRemove}
              onClick={() => removeItem(item.id)}
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
        Every item adds to the total. Cost = price &times; units (&times; total travelers if &quot;per person&quot;).
      </p>
    </section>
  );
}