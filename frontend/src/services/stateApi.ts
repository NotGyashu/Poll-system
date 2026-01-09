import api from './api';
import type { StudentState, TeacherState } from '../types';

export const stateApi = {
  getStudentState: async (studentId?: string, sessionId?: string): Promise<StudentState> => {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (sessionId) params.append('session_id', sessionId);
    
    const { data } = await api.get(`/state/current?${params.toString()}`);
    return data.data;
  },

  getTeacherState: async (): Promise<TeacherState> => {
    const { data } = await api.get('/state/teacher');
    return data.data;
  },
};
