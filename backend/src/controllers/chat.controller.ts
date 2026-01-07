import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';

export const getMessages = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  const messages = await chatService.getMessages(limit, offset);
  res.json({ success: true, data: messages });
};

export const sendMessage = async (req: Request, res: Response) => {
  const message = await chatService.sendMessage(req.body);
  res.status(201).json({ success: true, data: message });
};

export const deleteMessage = async (req: Request, res: Response) => {
  await chatService.deleteMessage(req.params.id);
  res.json({ success: true });
};
