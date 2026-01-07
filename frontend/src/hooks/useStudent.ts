import { useState, useCallback } from 'react';
import { getSessionId, saveStudentInfo, getStudentInfo, clearStudentInfo } from '../utils/sessionStorage';
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
  const [student, setStudentState] = useState<Student | null>(() => {
    const saved = getStudentInfo();
    return saved ? { ...saved } as Student : null;
  });

  const setStudent = useCallback((newStudent: Student) => {
    setStudentState(newStudent);
    saveStudentInfo({ id: newStudent.id, name: newStudent.name });
  }, []);

  const clearStudent = useCallback(() => {
    setStudentState(null);
    clearStudentInfo();
  }, []);

  return {
    student,
    sessionId,
    isRegistered: student !== null,
    setStudent,
    clearStudent,
  };
};
