import { useRef, useState, useEffect } from "react";

export function useTimer() {
  const [totalTime, setTotalTime] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startTimer = () => {
    if (isFocused) return;
    setIsFocused(true);

    intervalRef.current = window.setInterval(() => {
      setTotalTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (!isFocused) return;
    setIsFocused(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsFocused(false);
    setTotalTime(0);
  };

  // Auto stop if tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFocused) {
        stopTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFocused]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
  }, []);

  return { isFocused, totalTime, startTimer, stopTimer, resetTimer };
}
