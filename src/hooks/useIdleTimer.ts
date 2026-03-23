import { useState, useEffect, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeout: number; // milliseconds
  warningTimeout?: number; // milliseconds before timeout to show warning
  onIdle: () => void;
  onWarning?: () => void;
  enabled?: boolean;
}

/**
 * Hook to track user idle time and trigger callbacks
 * Used for HIPAA-compliant session timeout
 */
export function useIdleTimer({
  timeout,
  warningTimeout,
  onIdle,
  onWarning,
  enabled = true
}: UseIdleTimerOptions) {
  const [isIdle, setIsIdle] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeout);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    setIsWarning(false);
    setRemainingTime(timeout);
  }, [timeout]);

  useEffect(() => {
    if (!enabled) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    let warningTimer: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    const startTimers = () => {
      // Clear existing timers
      if (idleTimer) clearTimeout(idleTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);

      // Start countdown
      const startTime = Date.now();
      countdownInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = timeout - elapsed;
        setRemainingTime(Math.max(0, remaining));
      }, 1000);

      // Set warning timer
      if (warningTimeout && onWarning) {
        warningTimer = setTimeout(() => {
          setIsWarning(true);
          onWarning();
        }, timeout - warningTimeout);
      }

      // Set idle timer
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        onIdle();
      }, timeout);
    };

    // Events that reset the timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      if (!isIdle) {
        startTimers();
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start initial timers
    startTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (idleTimer) clearTimeout(idleTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [enabled, timeout, warningTimeout, onIdle, onWarning, isIdle]);

  return {
    isIdle,
    isWarning,
    remainingTime,
    resetTimer
  };
}
