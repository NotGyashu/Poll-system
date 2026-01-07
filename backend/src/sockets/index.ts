import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { pollHandler } from './poll.handler';
import { voteHandler } from './vote.handler';
import { studentHandler } from './student.handler';

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    pollHandler(io, socket);
    voteHandler(io, socket);
    studentHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
