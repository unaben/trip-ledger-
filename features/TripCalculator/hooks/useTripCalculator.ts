import { useCallback, useEffect, useState } from 'react'
import { useTripForm } from './useTripForm';

const useTripCalculator = () => {

    const { tripData, setTripData, status, submitTrip } = useTripForm();
      const [submitError, setSubmitError] = useState(false);
      const [submitSuccess, setSubmitSuccess] = useState(false);

      useEffect(() => {
        if (!submitSuccess) return;
        const timeout = setTimeout(() => setSubmitSuccess(false), 5000);
        return () => clearTimeout(timeout);
      }, [submitSuccess]);

      const handleSubmit = useCallback(async () => {
        setSubmitError(false);
        setSubmitSuccess(false);
        const saved = await submitTrip();
        if (saved) {
          setSubmitSuccess(true);
        } else {
          setSubmitError(true);
        }
      }, [submitTrip]);

      const handleFieldChange = useCallback((updater: Parameters<typeof setTripData>[0]) => {
        setSubmitSuccess(false);
        setTripData(updater);
      }, [setTripData]);

  return {
    tripData,
    status,
    submitError,
    submitSuccess,
    handleSubmit,
    handleFieldChange,
  }
}

export default useTripCalculator