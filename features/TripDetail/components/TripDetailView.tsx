import Link from 'next/link';
import cn from 'classnames'
import { useMemo } from 'react';
import { calculateAllScenarios } from '@/features/TripCalculator/TripCalculator.logic';
import { formatGbp } from '@/features/TripCalculator/TripCalculator.utils';
import { useTripDetail } from '../hooks/useTripDetail';
import styles from '../TripDetail.module.css'

function TripDetailView({
    trip,
    onEdit,
  }: {
    trip: NonNullable<ReturnType<typeof useTripDetail>["trip"]>;
    onEdit: () => void;
  }) {
    const results = useMemo(() => calculateAllScenarios(trip), [trip]);
  
    return (
      <main className={styles.tripDetail}>
        <div className={styles.tripDetailTopbar}>
          <div>
            <h1>{trip.metadata.tripName}</h1>
            <p className={styles.tripDetailDates}>
              {trip.metadata.tripDateFrom} &rarr; {trip.metadata.tripDateTo}
            </p>
          </div>
          <div className={styles.tripDetailTopbarActions}>
            <button
              type="button"
              className={styles.tripDetailEditButton}
              onClick={onEdit}
            >
              Edit
            </button>
            <Link className={styles.tripDetailLink} href="/trips">
              &larr; Back to saved trips
            </Link>
          </div>
        </div>
  
        <section className={styles.tripDetailCard}>
          <h2>Exchange rates</h2>
          <div className={styles.tripDetailRates}>
            <span>
              HUF &rarr; GBP:{" "}
              <strong>{trip.metadata.exchangeRates.hufToGbp}</strong>
            </span>
            <span>
              EUR &rarr; GBP:{" "}
              <strong>{trip.metadata.exchangeRates.eurToGbp}</strong>
            </span>
          </div>
        </section>
  
        <section className={styles.tripDetailCard}>
          <h2>Accommodation</h2>
          <table className={styles.tripDetailTable}>
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Price / night</th>
                <th>Currency</th>
                <th>Nights</th>
              </tr>
            </thead>
            <tbody>
              {trip.accommodation.map((stay) => (
                <tr key={stay.id}>
                  <td>{stay.name}</td>
                  <td className="tabular-num">{stay.pricePerNight}</td>
                  <td>{stay.currency}</td>
                  <td className="tabular-num">{stay.nights}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
  
        <section className={styles.tripDetailCard}>
          <h2>Transportation</h2>
          <table className={styles.tripDetailTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Currency</th>
                <th>Pricing</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {trip.transportation.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="tabular-num">{item.price}</td>
                  <td>{item.currency}</td>
                  <td>
                    {item.pricingType === "perPerson"
                      ? "Per person"
                      : "Flat / group"}
                  </td>
                  <td className="tabular-num">{item.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
  
        <section className={styles.tripDetailCard}>
          <h2>Programs &amp; activities</h2>
          <table className={styles.tripDetailTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Currency</th>
                <th>Pricing</th>
              </tr>
            </thead>
            <tbody>
              {trip.programs.map((program) => (
                <tr key={program.id}>
                  <td>{program.name}</td>
                  <td className="tabular-num">{program.price}</td>
                  <td>{program.currency}</td>
                  <td>
                    {program.pricingType === "perPerson"
                      ? "Per person"
                      : "Flat / group"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
  
        <section className={styles.tripDetailCard}>
          <div className={styles.tripDetailScenarioHeader}>
            <h2>Scenario comparison</h2>
            <span>
              Package sale price (per payer):{" "}
              <strong>{formatGbp(trip.packageSalePriceGbp)}</strong>
            </span>
          </div>
  
          <div className={styles.tripDetailScenarioGrid}>
            {results.map((result) => {
              const isProfit = result.profitGbp >= 0;
              return (
                <div
                  className={styles.tripDetailScenario}
                  key={result.scenarioId}
                >
                  <h3>{result.label}</h3>
                  <p className={styles.tripDetailScenarioHeadcount}>
                    {result.numPayers} payers &middot; {result.totalTravelers}{" "}
                    total travelers
                  </p>
  
                  <div className={styles.tripDetailScenarioLines}>
                    {result.lineItems.map((line) => (
                      <div
                        className={styles.tripDetailScenarioLine}
                        key={line.id}
                      >
                        <span>{line.name}</span>
                        <span className="tabular-num">
                          {formatGbp(line.costGbp)}
                        </span>
                      </div>
                    ))}
                  </div>
  
                  <div className={styles.tripDetailScenarioTotals}>
                    <div
                      className={cn(
                        styles.tripDetailScenarioTotalLine,
                        styles.tripDetailScenarioTotalLineStrong
                      )}
                    >
                      <span>Total expense</span>
                      <span className="tabular-num">
                        {formatGbp(result.totalExpenseGbp)}
                      </span>
                    </div>
                    <div className={styles.tripDetailScenarioTotalLine}>
                      <span>Expense per person (per payer)</span>
                      <span className="tabular-num">
                        {formatGbp(result.expensePerPersonGbp)}
                      </span>
                    </div>
                    <div className={styles.tripDetailScenarioTotalLine}>
                      <span>Revenue</span>
                      <span className="tabular-num">
                        {formatGbp(result.revenueGbp)}
                      </span>
                    </div>
                  </div>
  
                  <div
                    className={cn(styles.tripDetailProfit, {
                      [styles.tripDetailProfitGain]: isProfit,
                      [styles.tripDetailProfitLoss]: !isProfit,
                    })}
                  >
                    <span>{isProfit ? "Profit" : "Loss"}</span>
                    <span className="tabular-num">
                      {formatGbp(result.profitGbp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    );
  }
  export default TripDetailView