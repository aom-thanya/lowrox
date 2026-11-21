import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVisiblePolling } from '../src/hooks/useVisiblePolling';

let visibility: DocumentVisibilityState = 'visible';
const setVisibility = (value: DocumentVisibilityState) => {
  visibility = value;
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('useVisiblePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    visibility = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
  });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('polls on the interval only while the tab is visible', async () => {
    const poll = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useVisiblePolling(poll, 90_000));
    expect(poll).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(90_000);
    expect(poll).toHaveBeenCalledTimes(1);

    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(5 * 90_000);
    expect(poll).toHaveBeenCalledTimes(1);

    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(0);
    expect(poll).toHaveBeenCalledTimes(2);
  });

  it('skips a tick while the previous poll is still running', async () => {
    let finish!: () => void;
    const poll = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    renderHook(() => useVisiblePolling(poll, 1_000));
    await vi.advanceTimersByTimeAsync(3_000);
    expect(poll).toHaveBeenCalledTimes(1);
    finish();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(poll).toHaveBeenCalledTimes(2);
  });

  it('does nothing when disabled or unmounted', async () => {
    const poll = vi.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() => useVisiblePolling(poll, 1_000, false));
    await vi.advanceTimersByTimeAsync(5_000);
    unmount();
    expect(poll).not.toHaveBeenCalled();
  });
});
