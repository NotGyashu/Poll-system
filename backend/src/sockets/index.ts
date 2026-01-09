import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { pollHandler } from './poll.handler';
import { voteHandler } from './vote.handler';
import { studentHandler } from './student.handler';
import { chatHandler } from './chat.handler';
import { isDbConnected } from '../config/database';
import { studentService } from '../services/student.service';
import { presenceManager } from '../services/presence.service';

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

const wrapHandler = (handler: (...args: any[]) => Promise<void>) => {
  return async (...args: any[]) => {
    try {
      await handler(...args);
    } catch (err: any) {
      console.error('Socket handler error:', err.message);
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Something went wrong' });
      }
    }
  };
};

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000',process.env.FRONTEND_URL || ''],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Initialize presence manager with Socket.IO instance
  presenceManager.initialize(io);

  io.use((socket, next) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (!sessionId && socket.handshake.query.role !== 'teacher') {
      console.log('Socket connection without sessionId');
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('error', (err) => {
      console.error(`Socket error for ${socket.id}:`, err.message);
    });

    const originalOn = socket.on.bind(socket);
    socket.on = ((event: string, listener: (...args: any[]) => void) => {
      return originalOn(event, (...args: any[]) => {
        if (event !== 'disconnect' && event !== 'error') {
          if (!checkSocketRateLimit(socket.id)) {
            const callback = args[args.length - 1];
            if (typeof callback === 'function') {
              callback({ success: false, error: 'Rate limit exceeded' });
            }
            return;
          }
          
          if (!isDbConnected()) {
            const callback = args[args.length - 1];
            if (typeof callback === 'function') {
              callback({ success: false, error: 'Service temporarily unavailable' });
            }
            return;
          }
        }
        
        wrapHandler(async () => listener(...args))();
      });
    }) as typeof socket.on;

    pollHandler(io, socket);
    voteHandler(io, socket);
    studentHandler(io, socket);
    chatHandler(io, socket);

    // Teacher kick student
    socket.on('student:kick', async (data, callback) => {
      try {
        // Get all sockets for this user and notify them
        const userSockets = presenceManager.getUserSockets(data.studentId);
        for (const socketId of userSockets) {
          io.to(socketId).emit('student:kicked', {
            studentId: data.studentId,
            reason: data.reason || 'Removed by teacher',
          });
        }

        // Remove from presence manager
        presenceManager.removeUser(data.studentId);
        
        // Remove from database
        await studentService.removeStudent(data.studentId);
        
        io.emit('student:removed', { studentId: data.studentId });
        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      socketRateLimits.delete(socket.id);
    });
  });

  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err.message);
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
