/**
 * Tests para useFormSubmission hook.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormSubmission } from '@/hooks/use-form-submission';

describe('useFormSubmission', () => {
  it('should start with default state', () => {
    const submitFn = vi.fn();
    const { result } = renderHook(() => useFormSubmission(submitFn));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.submit).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should handle successful submission', async () => {
    const submitFn = vi.fn().mockResolvedValue({ id: 1 });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useFormSubmission(submitFn, { onSuccess })
    );

    let submitResult: unknown;
    await act(async () => {
      submitResult = await result.current.submit({ name: 'test' });
    });

    expect(submitResult).toEqual({ id: 1 });
    expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle submission error', async () => {
    const submitFn = vi.fn().mockRejectedValue(new Error('Test error'));
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useFormSubmission(submitFn, { onError })
    );

    await act(async () => {
      await result.current.submit({ name: 'test' });
    });

    expect(onError).toHaveBeenCalledWith('Test error');
    expect(result.current.error).toBe('Test error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set isLoading during submission', async () => {
    let resolveSubmit: (value: unknown) => void;
    const submitFn = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    );

    const { result } = renderHook(() => useFormSubmission(submitFn));

    // Start submission
    act(() => {
      result.current.submit({ name: 'test' });
    });

    // Should be loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve the submission
    await act(async () => {
      resolveSubmit({ id: 1 });
    });

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
  });

  it('should reset error', async () => {
    const submitFn = vi.fn().mockRejectedValue(new Error('Test error'));
    const { result } = renderHook(() => useFormSubmission(submitFn));

    await act(async () => {
      await result.current.submit({ name: 'test' });
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle non-Error objects', async () => {
    const submitFn = vi.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useFormSubmission(submitFn));

    await act(async () => {
      await result.current.submit({ name: 'test' });
    });

    expect(result.current.error).toBe('Error desconocido');
  });
});
