import api from './api';
import type { Student, RegisterStudentDTO } from '../types';

export const studentApi = {
  register: async (data: RegisterStudentDTO): Promise<Student> => {
    const { data: response } = await api.post('/students/register', data);
    return response.data;
  },

  getAll: async (): Promise<Student[]> => {
    const { data } = await api.get('/students');
    return data.data;
  },

  getById: async (id: string): Promise<Student> => {
    const { data } = await api.get(`/students/${id}`);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  getOnline: async (): Promise<Student[]> => {
    const { data } = await api.get('/students/online');
    return data.data;
  },
};
