import api from './api';
import type { Message, SendMessageDTO } from '../types';

export const chatApi = {
  getMessages: async (limit: number = 50, offset: number = 0): Promise<Message[]> => {
    const { data } = await api.get(`/chat?limit=${limit}&offset=${offset}`);
    return data.data;
  },

  sendMessage: async (messageData: SendMessageDTO): Promise<Message> => {
    const { data } = await api.post('/chat', {
      sender_id: messageData.senderId,
      sender_name: messageData.senderName,
      sender_type: messageData.senderType,
      content: messageData.content,
    });
    return data.data;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/chat/${id}`);
  },
};
