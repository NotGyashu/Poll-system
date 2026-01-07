import api from './api';
import type { Poll, PollWithOptions, PollResults, CreatePollDTO } from '../types';

export const pollApi = {
  getAll: async (): Promise<Poll[]> => {
    const { data } = await api.get('/polls');
    return data.data;
  },

  getById: async (id: string): Promise<PollWithOptions> => {
    const { data } = await api.get(`/polls/${id}`);
    return data.data;
  },

  getActive: async (): Promise<PollWithOptions | null> => {
    const { data } = await api.get('/polls/active');
    return data.data;
  },

  create: async (pollData: CreatePollDTO): Promise<PollWithOptions> => {
    const { data } = await api.post('/polls', pollData);
    return data.data;
  },

  start: async (id: string): Promise<PollWithOptions> => {
    const { data } = await api.patch(`/polls/${id}/start`);
    return data.data;
  },

  end: async (id: string): Promise<Poll> => {
    const { data } = await api.patch(`/polls/${id}/end`);
    return data.data;
  },

  getResults: async (id: string): Promise<PollResults> => {
    const { data } = await api.get(`/polls/${id}/results`);
    return data.data;
  },

  getHistory: async (): Promise<Poll[]> => {
    const { data } = await api.get('/polls/history');
    return data.data;
  },
};
