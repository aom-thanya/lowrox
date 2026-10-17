import { useCallback, useState } from 'react';

// Shared submit flow for onboarding steps: shows a pending state, simulates the save,
// then advances. Any thrown error is surfaced as `submitError`.
export function useStepSubmit(errorMessage: string, delayMs = 1000) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const submit = useCallback(async (onSuccess?: () => void) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      onSuccess?.();
    } catch {
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [errorMessage, delayMs]);

  return { isSubmitting, submitError, setSubmitError, submit };
}
