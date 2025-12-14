/**
 * Hook for standardized form submission handling.
 * Manages loading state, errors, and callbacks.
 */

import { useState, useCallback } from 'react';

export interface UseFormSubmissionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
}

export interface UseFormSubmissionResult<TInput, TOutput> {
  submit: (data: TInput) => Promise<TOutput | undefined>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for handling form submissions with loading and error states.
 *
 * @param submitFn - Async function that performs the submission
 * @param options - Optional callbacks for success and error
 * @returns Object with submit function, loading state, error, and reset function
 *
 * @example
 * ```tsx
 * const { submit, isLoading, error } = useFormSubmission(
 *   async (data: FormData) => {
 *     const response = await fetch('/api/submit', {
 *       method: 'POST',
 *       body: JSON.stringify(data),
 *     });
 *     if (!response.ok) throw new Error('Failed to submit');
 *     return response.json();
 *   },
 *   {
 *     onSuccess: (result) => console.log('Submitted:', result),
 *     onError: (error) => console.error('Error:', error),
 *   }
 * );
 * ```
 */
export function useFormSubmission<TInput, TOutput = void>(
  submitFn: (data: TInput) => Promise<TOutput>,
  options?: UseFormSubmissionOptions<TOutput>
): UseFormSubmissionResult<TInput, TOutput> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (data: TInput): Promise<TOutput | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await submitFn(data);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        options?.onError?.(message);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [submitFn, options]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { submit, isLoading, error, reset };
}
