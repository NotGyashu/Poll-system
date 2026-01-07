import { useState, useEffect, useCallback, useRef } from 'react';
import { formatTime } from '../utils/formatters';

interface UsePollTimerOptions {
  initialTime: number;
  onTimerEnd?: () => void;
}

export const usePollTimer = ({ initialTime, onTimerEnd }: UsePollTimerOptions) => {
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimerEndRef = useRef(onTimerEnd);

  useEffect(() => {
    onTimerEndRef.current = onTimerEnd;
  }, [onTimerEnd]);

  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimerEndRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingTime]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback((time: number) => {
    setRemainingTime(time);
    setIsRunning(false);
  }, []);

  const syncWithServer = useCallback((serverTime: number) => {
    setRemainingTime(serverTime);
    if (serverTime > 0) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, []);

  const isLowTime = remainingTime <= 10 && remainingTime > 0;

  return {
    remainingTime,
    formattedTime: formatTime(remainingTime),
    isRunning,
    isLowTime,
    start,
    stop,
    reset,
    syncWithServer,
  };
};
