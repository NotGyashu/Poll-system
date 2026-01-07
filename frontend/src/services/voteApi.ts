import api from './api';
import type { Vote, PollResults } from '../types';

export const voteApi = {
  submit: async (pollId: string, optionId: string, studentId: string): Promise<Vote> => {
    const { data } = await api.post('/votes', {
      poll_id: pollId,
      option_id: optionId,
      student_id: studentId,
    });
    return data.data;
  },

  hasVoted: async (pollId: string, studentId: string): Promise<boolean> => {
    const { data } = await api.get(`/votes/check/${pollId}/${studentId}`);
    return data.data.hasVoted;
  },

  getResults: async (pollId: string): Promise<PollResults> => {
    const { data } = await api.get(`/polls/${pollId}/results`);
    return data.data;
  },
};
