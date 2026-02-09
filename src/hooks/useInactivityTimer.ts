import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function useInactivityTimer(onTimeout: () => void, isActive: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, INACTIVITY_TIMEOUT);
  }, [onTimeout]);

  useEffect(() => {
    if (!isActive) return;

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

    const handleActivity = () => resetTimer();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start countdown when tab is hidden
        resetTimer();
      } else {
        // Reset when tab becomes visible again
        resetTimer();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start the initial timer
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive, resetTimer]);
}
