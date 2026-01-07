import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useStudent } from '../hooks';
import type { Student } from '../types';

interface StudentContextValue {
  student: Student | null;
  sessionId: string;
  isRegistered: boolean;
  setStudent: (student: Student) => void;
  clearStudent: () => void;
}

const StudentContext = createContext<StudentContextValue | null>(null);

interface StudentProviderProps {
  children: ReactNode;
}

export const StudentProvider = ({ children }: StudentProviderProps) => {
  const studentValues = useStudent();

  return (
    <StudentContext.Provider value={studentValues}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = (): StudentContextValue => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return context;
};
