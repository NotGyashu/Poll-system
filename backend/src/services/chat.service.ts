import { MessageModel } from '../models/message.model';
import { Message, CreateMessageDTO } from '../types/chat.types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ChatService {
  async sendMessage(data: CreateMessageDTO): Promise<Message> {
    if (!data.content || data.content.trim().length === 0) {
      throw new BadRequestError('Message content is required');
    }

    if (data.content.length > 500) {
      throw new BadRequestError('Message too long (max 500 characters)');
    }

    if (!data.sender_name || data.sender_name.trim().length === 0) {
      throw new BadRequestError('Sender name is required');
    }

    if (!['teacher', 'student'].includes(data.sender_type)) {
      throw new BadRequestError('Invalid sender type');
    }

    const message = await MessageModel.create({
      ...data,
      content: data.content.trim(),
      sender_name: data.sender_name.trim(),
    });

    return message;
  }

  async getMessages(limit: number = 50, offset: number = 0): Promise<Message[]> {
    return MessageModel.findAll(limit, offset);
  }

  async deleteMessage(id: string): Promise<boolean> {
    const message = await MessageModel.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }
    return MessageModel.delete(id);
  }

  async clearChat(): Promise<void> {
    await MessageModel.clearAll();
  }
}

export const chatService = new ChatService();
