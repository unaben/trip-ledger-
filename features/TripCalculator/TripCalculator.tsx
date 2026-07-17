"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTripForm } from "./hooks/useTripForm";
import { calculateAllScenarios } from "./TripCalculator.logic";
import { TripMetadataForm } from "./components/TripMetadataForm/TripMetadataForm";
import { AccommodationSection } from "./components/AccommodationSection/AccommodationSection";
import { TransportationSection } from "./components/TransportationSection/TransportationSection";
import { ProgramList } from "./components/ProgramList/ProgramList";
import { ScenarioBoard } from "./components/ScenarioBoard/ScenarioBoard";
import useTripCalculator from "./hooks/useTripCalculator";
import styles from "./TripCalculator.module.css";


export function TripCalculator() {
  const {
    tripData,
    status,
    submitError,
    submitSuccess,
    handleSubmit,
    handleFieldChange,
  } = useTripCalculator();

  const results = useMemo(() => calculateAllScenarios(tripData), [tripData]);

  return (
    <main className={styles.tripCalculator}>
      <div className={styles.tripCalculatorTopbar}>
        <h1>Trip Pricing &amp; Profit Calculator</h1>
        <Link className={styles.tripCalculatorLink} href="/trips">
          View saved trips &rarr;
        </Link>
      </div>

      {submitSuccess && (
        <p className={styles.tripCalculatorSubmitSuccess}>
          Trip saved. The form has been reset so you can start the next one - or{" "}
          <Link href="/trips">view it in Saved trips</Link>.
        </p>
      )}

      <TripMetadataForm
        metadata={tripData.metadata}
        onChange={(metadata) => handleFieldChange((t) => ({ ...t, metadata }))}
      />

      <AccommodationSection
        stays={tripData.accommodation}
        onChange={(accommodation) =>
          handleFieldChange((t) => ({ ...t, accommodation }))
        }
      />

      <TransportationSection
        items={tripData.transportation}
        onChange={(transportation) =>
          handleFieldChange((t) => ({ ...t, transportation }))
        }
      />

      <ProgramList
        programs={tripData.programs}
        onChange={(programs) => handleFieldChange((t) => ({ ...t, programs }))}
      />

      <ScenarioBoard
        scenarios={tripData.scenarios}
        results={results}
        packageSalePriceGbp={tripData.packageSalePriceGbp}
        onScenariosChange={(scenarios) =>
          handleFieldChange((t) => ({ ...t, scenarios }))
        }
        onPackageSalePriceChange={(packageSalePriceGbp) =>
          handleFieldChange((t) => ({ ...t, packageSalePriceGbp }))
        }
      />

      <div className={styles.tripCalculatorSubmitRow}>
        {submitError && (
          <span className={styles.tripCalculatorSubmitError}>
            Couldn&apos;t save this trip - please try again.
          </span>
        )}
        <button
          type="button"
          className={styles.tripCalculatorSubmitButton}
          onClick={handleSubmit}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Saving…" : "Submit trip"}
        </button>
      </div>
    </main>
  );
}
