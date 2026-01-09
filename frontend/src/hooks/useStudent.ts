import { useState, useCallback } from 'react';
import { getSessionId } from '../utils/sessionStorage';
import type { Student } from '../types';

interface UseStudentReturn {
  student: Student | null;
  sessionId: string;
  isRegistered: boolean;
  setStudent: (student: Student) => void;
  clearStudent: () => void;
}

export const useStudent = (): UseStudentReturn => {
  const [sessionId] = useState(() => getSessionId());
  const [student, setStudentState] = useState<Student | null>(null);

  const setStudent = useCallback((newStudent: Student) => {
    setStudentState(newStudent);
  }, []);

  const clearStudent = useCallback(() => {
    setStudentState(null);
  }, []);

  return {
    student,
    sessionId,
    isRegistered: student !== null,
    setStudent,
    clearStudent,
  };
};
