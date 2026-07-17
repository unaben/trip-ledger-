import { useMemo } from 'react';
import cn from 'classnames'
import { AccommodationSection } from '@/features/TripCalculator/components/AccommodationSection/AccommodationSection';
import { ProgramList } from '@/features/TripCalculator/components/ProgramList/ProgramList';
import { ScenarioBoard } from '@/features/TripCalculator/components/ScenarioBoard/ScenarioBoard';
import { TransportationSection } from '@/features/TripCalculator/components/TransportationSection/TransportationSection';
import { TripMetadataForm } from '@/features/TripCalculator/components/TripMetadataForm/TripMetadataForm';
import { calculateAllScenarios } from '@/features/TripCalculator/TripCalculator.logic';
import { TripData } from '@/features/TripCalculator/TripCalculator.types';
import styles from '../TripDetail.module.css'

function TripDetailEdit({
    draft,
    setDraft,
    saveStatus,
    onSave,
    onCancel,
  }: {
    draft: TripData;
    setDraft: (updater: (current: TripData) => TripData) => void;
    saveStatus: "idle" | "saving" | "error";
    onSave: () => void;
    onCancel: () => void;
  }) {
    const results = useMemo(() => calculateAllScenarios(draft), [draft]);
  
    return (
      <main className={styles.tripDetail}>
        <div className={styles.tripDetailTopbar}>
          <h1>Editing: {draft.metadata.tripName}</h1>
          <div className={styles.tripDetailEditActions}>
            {saveStatus === "error" && (
              <span className={styles.tripDetailSaveError}>
                Couldn&apos;t save - try again.
              </span>
            )}
            <button
              type="button"
              className={styles.tripDetailCancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.tripDetailSaveButton}
              onClick={onSave}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving" ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
  
        <TripMetadataForm
          metadata={draft.metadata}
          onChange={(metadata) => setDraft((d) => ({ ...d, metadata }))}
        />
        <AccommodationSection
          stays={draft.accommodation}
          onChange={(accommodation) => setDraft((d) => ({ ...d, accommodation }))}
        />
        <TransportationSection
          items={draft.transportation}
          onChange={(transportation) =>
            setDraft((d) => ({ ...d, transportation }))
          }
        />
        <ProgramList
          programs={draft.programs}
          onChange={(programs) => setDraft((d) => ({ ...d, programs }))}
        />
        <ScenarioBoard
          scenarios={draft.scenarios}
          results={results}
          packageSalePriceGbp={draft.packageSalePriceGbp}
          onScenariosChange={(scenarios) =>
            setDraft((d) => ({ ...d, scenarios }))
          }
          onPackageSalePriceChange={(packageSalePriceGbp) =>
            setDraft((d) => ({ ...d, packageSalePriceGbp }))
          }
        />
  
        <div
          className={cn(
            styles.tripDetailEditActions,
            styles.tripDetailEditActionsBottom
          )}
        >
          {saveStatus === "error" && (
            <span className={styles.tripDetailSaveError}>
              Couldn&apos;t save - try again.
            </span>
          )}
          <button
            type="button"
            className={styles.tripDetailCancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.tripDetailSaveButton}
            onClick={onSave}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </main>
    );
  }

  export default TripDetailEdit