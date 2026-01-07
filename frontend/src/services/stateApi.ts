import api from './api';
import type { StudentState, TeacherState } from '../types';

export const stateApi = {
  getStudentState: async (studentId?: string, sessionId?: string): Promise<StudentState> => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (sessionId) params.append('sessionId', sessionId);
    
    const { data } = await api.get(`/state/student?${params.toString()}`);
    return data.data;
  },

  getTeacherState: async (): Promise<TeacherState> => {
    const { data } = await api.get('/state/teacher');
    return data.data;
  },
};
