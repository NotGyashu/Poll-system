const SESSION_ID_KEY = 'pollSessionId';
const STUDENT_KEY = 'pollStudent';

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const clearSessionId = (): void => {
  sessionStorage.removeItem(SESSION_ID_KEY);
};

export const saveStudentInfo = (student: { id: string; name: string }): void => {
  sessionStorage.setItem(STUDENT_KEY, JSON.stringify(student));
};

export const getStudentInfo = (): { id: string; name: string } | null => {
  const data = sessionStorage.getItem(STUDENT_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const clearStudentInfo = (): void => {
  sessionStorage.removeItem(STUDENT_KEY);
};
