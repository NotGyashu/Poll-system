import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import type { SocketResponse } from '../types';

interface UseSocketOptions {
  sessionId?: string;
  role?: 'teacher' | 'student';
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Don't connect if no role is provided
    if (!options.role) {
      return;
    }

    setIsConnecting(true);
    const socket = io(SOCKET_URL, {
      auth: { sessionId: options.sessionId },
      query: { role: options.role },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnecting(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [options.sessionId, options.role]);

  const emit = useCallback(<T = unknown>(
    event: string,
    data?: unknown
  ): Promise<SocketResponse<T>> => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }
      socketRef.current.emit(event, data, (response: SocketResponse<T>) => {
        resolve(response);
      });
    });
  }, []);

  const on = useCallback((event: string, callback: (data: unknown) => void) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const off = useCallback((event: string, callback?: (data: unknown) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    emit,
    on,
    off,
  };
};
