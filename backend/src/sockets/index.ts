import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { pollHandler } from './poll.handler';
import { voteHandler } from './vote.handler';
import { studentHandler } from './student.handler';

let io: Server;

const socketRateLimits = new Map<string, { count: number; resetTime: number }>();

const checkSocketRateLimit = (socketId: string, maxRequests: number = 30): boolean => {
  const now = Date.now();
  const limit = socketRateLimits.get(socketId);

  if (!limit || now > limit.resetTime) {
    socketRateLimits.set(socketId, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
};

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (!sessionId && socket.handshake.query.role !== 'teacher') {
      console.log('Socket connection without sessionId');
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    const originalOn = socket.on.bind(socket);
    socket.on = ((event: string, listener: (...args: any[]) => void) => {
      return originalOn(event, (...args: any[]) => {
        if (event !== 'disconnect' && !checkSocketRateLimit(socket.id)) {
          const callback = args[args.length - 1];
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Rate limit exceeded' });
          }
          return;
        }
        listener(...args);
      });
    }) as typeof socket.on;

    pollHandler(io, socket);
    voteHandler(io, socket);
    studentHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      socketRateLimits.delete(socket.id);
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
