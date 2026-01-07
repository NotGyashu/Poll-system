import { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service';

export const chatHandler = (io: Server, socket: Socket) => {
  socket.on('chat:send', async (data, callback) => {
    try {
      const message = await chatService.sendMessage({
        sender_id: data.senderId,
        sender_name: data.senderName,
        sender_type: data.senderType,
        content: data.content,
      });

      io.emit('chat:message', message);
      callback?.({ success: true, data: message });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('chat:history', async (data, callback) => {
    try {
      const limit = data?.limit || 50;
      const offset = data?.offset || 0;
      const messages = await chatService.getMessages(limit, offset);
      callback?.({ success: true, data: messages });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('chat:delete', async (data, callback) => {
    try {
      await chatService.deleteMessage(data.messageId);
      io.emit('chat:deleted', { messageId: data.messageId });
      callback?.({ success: true });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });
};
