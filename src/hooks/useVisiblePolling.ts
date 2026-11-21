import { useEffect, useRef } from 'react';

// Calls `poll` every `intervalMs` while the tab is visible. Hidden tabs make no
// requests; when the tab comes back after a full interval, it polls right away.
// A poll never starts while the previous one is still running.
export function useVisiblePolling(poll: () => Promise<unknown>, intervalMs: number, enabled = true) {
  const pollRef = useRef(poll);
  pollRef.current = poll;

  useEffect(() => {
    if (!enabled) return;
    let lastRun = Date.now();
    let running = false;

    const run = async () => {
      if (running || document.visibilityState !== 'visible') return;
      running = true;
      lastRun = Date.now();
      try { await pollRef.current(); } catch { /* try again next tick */ } finally { running = false; }
    };

    const timer = window.setInterval(run, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRun >= intervalMs) run();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs, enabled]);
}
