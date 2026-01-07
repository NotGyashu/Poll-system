import { useState, useEffect, useCallback } from 'react';
import { stateApi } from '../services';
import type { StudentState, TeacherState } from '../types';

interface UseStateRecoveryOptions {
  role: 'teacher' | 'student';
  studentId?: string;
  sessionId?: string;
  onStateRecovered?: (state: StudentState | TeacherState) => void;
}

export const useStateRecovery = ({
  role,
  studentId,
  sessionId,
  onStateRecovered,
}: UseStateRecoveryOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StudentState | TeacherState | null>(null);

  const recoverState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let recoveredState: StudentState | TeacherState;

      if (role === 'teacher') {
        recoveredState = await stateApi.getTeacherState();
      } else {
        recoveredState = await stateApi.getStudentState(studentId, sessionId);
      }

      setState(recoveredState);
      onStateRecovered?.(recoveredState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recover state');
    } finally {
      setIsLoading(false);
    }
  }, [role, studentId, sessionId, onStateRecovered]);

  useEffect(() => {
    recoverState();
  }, []);

  return {
    state,
    isLoading,
    error,
    refetch: recoverState,
  };
};
