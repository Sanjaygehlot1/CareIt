import { useRef, useState, useEffect, useCallback } from "react";
import { AxiosInstance } from "../../axios/axiosInstance";

const MIN_SAVE_SECONDS = 60; 

async function saveFocusSession(durationSeconds: number) {
  if (durationSeconds < MIN_SAVE_SECONDS) return;
  try {
    await AxiosInstance.post('/analytics/focus-session', { durationSeconds });
  } catch {
    
  }
}

export function useTimer() {
  const [totalTime, setTotalTime] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  const totalTimeRef = useRef(0);
  const unsavedTimeRef = useRef(0);

  useEffect(() => {
    totalTimeRef.current = totalTime;
  }, [totalTime]);

  const startTimer = useCallback(() => {
    if (isFocused) return;
    setIsFocused(true);

    intervalRef.current = window.setInterval(() => {
      setTotalTime((prev) => prev + 1);
      unsavedTimeRef.current += 1;
    }, 1000);
  }, [isFocused]);

  const stopTimer = useCallback(() => {
    if (!isFocused) return;
    setIsFocused(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const unsaved = unsavedTimeRef.current;
    if (unsaved >= MIN_SAVE_SECONDS) {
      saveFocusSession(unsaved);
      unsavedTimeRef.current = 0;
    }
  }, [isFocused]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsFocused(false);
    
    setTotalTime(0);
    totalTimeRef.current = 0;

    const unsaved = unsavedTimeRef.current;
    if (unsaved >= MIN_SAVE_SECONDS) {
      saveFocusSession(unsaved);
    }
    unsavedTimeRef.current = 0;
  }, []);

 
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFocused) {
        stopTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFocused, stopTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        const unsaved = unsavedTimeRef.current;
        if (unsaved >= MIN_SAVE_SECONDS) {
            saveFocusSession(unsaved);
        }
      }
    };
  }, []);

  return { isFocused, totalTime, startTimer, stopTimer, resetTimer };
}
