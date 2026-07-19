"use client";

import cn from "classnames";
import { CURRENCY_CLASS, PRICING_TYPES } from "./constants";
import { addProgram, removeProgram, updateProgram } from "./ProgramList.utils";
import { CURRENCIES } from "@/constants";
import type { Currency, PricingType } from "../../TripCalculator.types";
import type { ProgramListProps } from "./ProgramList.types";
import styles from "./ProgramList.module.css";

export function ProgramList({ programs, onChange }: ProgramListProps) {
  const handleUpdate = (
    id: string,
    patch: Partial<(typeof programs)[number]>
  ) => onChange(updateProgram(programs, id, patch));

  const handleRemove = (id: string) => onChange(removeProgram(programs, id));

  const handleAdd = () => onChange(addProgram(programs));

  return (
    <section
      className={styles.programList}
      aria-label="Program and activity costs"
    >
      <div className={styles.programListHeader}>
        <h2>Programs &amp; activities</h2>
        <button
          type="button"
          className={styles.programListAdd}
          onClick={handleAdd}
        >
          + Add item
        </button>
      </div>

      <div className={styles.programListTable} role="table">
        <div
          className={cn(styles.programListRow, styles.programListRowHead)}
          role="row"
        >
          <span role="columnheader">Item</span>
          <span role="columnheader">Price</span>
          <span role="columnheader">Currency</span>
          <span role="columnheader">Pricing</span>
          <span role="columnheader" aria-label="Remove" />
        </div>

        {programs.map((program) => (
          <div className={styles.programListRow} role="row" key={program.id}>
            <input
              className={styles.programListName}
              type="text"
              value={program.name}
              onChange={(e) =>
                handleUpdate(program.id, { name: e.target.value })
              }
              aria-label="Item name"
            />
            <input
              className={cn(styles.programListPrice, "tabular-num")}
              type="number"
              min="0"
              step="0.01"
              value={program.price}
              onChange={(e) =>
                handleUpdate(program.id, { price: Number(e.target.value) })
              }
              aria-label="Price"
            />
            <select
              className={cn(
                styles.programListCurrency,
                styles[CURRENCY_CLASS[program.currency]]
              )}
              value={program.currency}
              onChange={(e) =>
                handleUpdate(program.id, {
                  currency: e.target.value as Currency,
                })
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
              className={styles.programListPricingType}
              value={program.pricingType}
              onChange={(e) =>
                handleUpdate(program.id, {
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
            <button
              type="button"
              className={styles.programListRemove}
              onClick={() => handleRemove(program.id)}
              aria-label={`Remove ${program.name}`}
              title="Remove item"
            >
              &times;
            </button>
          </div>
        ))}

        {programs.length === 0 && (
          <p className={styles.programListEmpty}>
            No items yet. Add your first program or activity above.
          </p>
        )}
      </div>
    </section>
  );
}
