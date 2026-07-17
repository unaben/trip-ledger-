"use client";

import cn from "classnames";
import type { Scenario } from "../../TripCalculator.types";
import { formatGbp } from "../../TripCalculator.utils";
import type { ScenarioBoardProps } from "./ScenarioBoard.types";
import styles from './ScenarioBoard.module.css'

export function ScenarioBoard({
  scenarios,
  results,
  packageSalePriceGbp,
  onScenariosChange,
  onPackageSalePriceChange,
}: ScenarioBoardProps) {
  function updateScenario(id: string, patch: Partial<Scenario>) {
    onScenariosChange(
      scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  return (
    <section className={styles.scenarioBoard} aria-label="Scenario comparison">
      <div className={styles.scenarioBoardHeader}>
        <h2>Scenario comparison</h2>
        <div className={styles.scenarioBoardSalePrice}>
          <label htmlFor="salePrice">Package sale price (per payer)</label>
          <div className={styles.scenarioBoardSalePriceInput}>
            <span>&pound;</span>
            <input
              id="salePrice"
              type="number"
              min="0"
              step="1"
              className="tabular-num"
              value={packageSalePriceGbp}
              onChange={(e) => onPackageSalePriceChange(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className={styles.scenarioBoardGrid}>
        {scenarios.map((scenario) => {
          const result = results.find((r) => r.scenarioId === scenario.id);
          const isProfit = (result?.profitGbp ?? 0) >= 0;

          return (
            <article className={styles.receipt} key={scenario.id}>
              <div className={styles.receiptNotch} aria-hidden="true" />

              <header className={styles.receiptHeader}>
                <input
                  className={styles.receiptLabel}
                  type="text"
                  value={scenario.label}
                  onChange={(e) =>
                    updateScenario(scenario.id, { label: e.target.value })
                  }
                  aria-label="Scenario name"
                />
              </header>

              <div className={styles.receiptHeadcounts}>
                <label>
                  Payers
                  <input
                    type="number"
                    min="0"
                    className="tabular-num"
                    value={scenario.numPayers}
                    onChange={(e) =>
                      updateScenario(scenario.id, {
                        numPayers: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Total travelers
                  <input
                    type="number"
                    min="0"
                    className="tabular-num"
                    value={scenario.totalTravelers}
                    onChange={(e) =>
                      updateScenario(scenario.id, {
                        totalTravelers: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <div className={styles.receiptDivider} aria-hidden="true" />

              <dl className={styles.receiptLines}>
                {result?.lineItems.map((line) => (
                  <div className={styles.receiptLine} key={line.id}>
                    <dt>{line.name}</dt>
                    <dd className="tabular-num">{formatGbp(line.costGbp)}</dd>
                  </div>
                ))}
              </dl>

              <div className={styles.receiptDivider} aria-hidden="true" />

              <div className={styles.receiptTotals}>
                <div className={styles.receiptTotalLine}>
                  <span>Total expense</span>
                  <span className="tabular-num">
                    {formatGbp(result?.totalExpenseGbp ?? 0)}
                  </span>
                </div>
                <div className={styles.receiptTotalLine}>
                  <span>Expense per person</span>
                  <span className="tabular-num">
                    {formatGbp(result?.expensePerPersonGbp ?? 0)}
                  </span>
                </div>
                <div className={styles.receiptTotalLine}>
                  <span>Revenue ({scenario.numPayers} payers)</span>
                  <span className="tabular-num">
                    {formatGbp(result?.revenueGbp ?? 0)}
                  </span>
                </div>
              </div>

              <div
                className={cn(styles.receiptProfit, {
                  [styles.receiptProfitGain]: isProfit,
                  [styles.receiptProfitLoss]: !isProfit,
                })}
              >
                <span className={styles.receiptProfitLabel}>
                  {isProfit ? "Profit" : "Loss"}
                </span>
                <span className={cn(styles.receiptProfitValue, "tabular-num")}>
                  {formatGbp(result?.profitGbp ?? 0)}
                </span>
              </div>

              <div className={styles.receiptNotch} aria-hidden="true" />
            </article>
          );
        })}
      </div>
    </section>
  );
}