import { Server } from 'socket.io';
import { Student } from '../types/student.types';

// Presence events
export const PRESENCE_EVENTS = {
  PARTICIPANTS_UPDATE: 'presence:participants-update',
  USER_ONLINE: 'presence:user-online',
  USER_OFFLINE: 'presence:user-offline',
} as const;

interface OnlineUser {
  id: string;
  name: string;
  socketIds: Set<string>;
  joinedAt: Date;
}

/**
 * PresenceManager - Socket-based presence tracking
 * 
 * This is the single source of truth for online users.
 * The database is NOT used for real-time presence.
 * 
 * Features:
 * - Multi-tab support (multiple sockets per user)
 * - Real-time participant count updates
 * - Clean disconnect handling
 */
export class PresenceManager {
  // userId -> OnlineUser (with multiple socketIds)
  private onlineUsers: Map<string, OnlineUser> = new Map();
  
  // socketId -> userId (reverse lookup for disconnect)
  private socketToUser: Map<string, string> = new Map();
  
  private io: Server | null = null;

  /**
   * Initialize with Socket.IO server instance
   */
  initialize(io: Server): void {
    this.io = io;
    // Clear any stale presence data on server start
    this.onlineUsers.clear();
    this.socketToUser.clear();
    console.log('[Presence] Manager initialized');
  }

  /**
   * Add a user to presence tracking
   * Supports multiple sockets per user (multi-tab)
   */
  addUser(student: Student, socketId: string): void {
    const existingUser = this.onlineUsers.get(student.id);

    if (existingUser) {
      // User already online, add new socket (multi-tab)
      existingUser.socketIds.add(socketId);
      console.log(`[Presence] User ${student.name} added socket (tabs: ${existingUser.socketIds.size})`);
    } else {
      // New user coming online
      this.onlineUsers.set(student.id, {
        id: student.id,
        name: student.name,
        socketIds: new Set([socketId]),
        joinedAt: new Date(),
      });
      console.log(`[Presence] User ${student.name} is now online`);
      this.emitUserOnline(student);
    }

    this.socketToUser.set(socketId, student.id);
    this.broadcastParticipantsUpdate();
  }

  /**
   * Remove a socket from presence tracking
   * Only marks user offline when ALL sockets are disconnected
   */
  async removeSocket(socketId: string): Promise<void> {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return;

    const user = this.onlineUsers.get(userId);
    if (!user) {
      this.socketToUser.delete(socketId);
      return;
    }

    // Remove this specific socket
    user.socketIds.delete(socketId);
    this.socketToUser.delete(socketId);

    if (user.socketIds.size === 0) {
      // All tabs closed - user is truly offline
      this.onlineUsers.delete(userId);
      console.log(`[Presence] User ${user.name} is now offline`);
      
      this.emitUserOffline(userId, user.name);
    } else {
      console.log(`[Presence] User ${user.name} closed a tab (remaining: ${user.socketIds.size})`);
    }

    this.broadcastParticipantsUpdate();
  }

  /**
   * Remove a user entirely (e.g., kicked by teacher)
   */
  removeUser(userId: string): void {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    // Clean up all sockets for this user
    for (const socketId of user.socketIds) {
      this.socketToUser.delete(socketId);
    }
    
    this.onlineUsers.delete(userId);
    console.log(`[Presence] User ${user.name} was removed`);
    
    this.emitUserOffline(userId, user.name);
    this.broadcastParticipantsUpdate();
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): Array<{ id: string; name: string; joinedAt: Date }> {
    return Array.from(this.onlineUsers.values()).map(user => ({
      id: user.id,
      name: user.name,
      joinedAt: user.joinedAt,
    }));
  }

  /**
   * Get online user count
   */
  getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Get all socket IDs for a user (for targeted messaging)
   */
  getUserSockets(userId: string): string[] {
    const user = this.onlineUsers.get(userId);
    return user ? Array.from(user.socketIds) : [];
  }

  /**
   * Broadcast participants update to all clients
   */
  private broadcastParticipantsUpdate(): void {
    if (!this.io) return;

    const participants = this.getOnlineUsers();
    this.io.emit(PRESENCE_EVENTS.PARTICIPANTS_UPDATE, {
      count: participants.length,
      participants,
    });
  }

  /**
   * Emit user online event
   */
  private emitUserOnline(student: Student): void {
    if (!this.io) return;
    this.io.emit(PRESENCE_EVENTS.USER_ONLINE, {
      id: student.id,
      name: student.name,
    });
  }

  /**
   * Emit user offline event
   */
  private emitUserOffline(userId: string, name: string): void {
    if (!this.io) return;
    this.io.emit(PRESENCE_EVENTS.USER_OFFLINE, {
      id: userId,
      name,
    });
  }

  /**
   * Get debug info
   */
  getDebugInfo(): object {
    return {
      onlineUsersCount: this.onlineUsers.size,
      totalSockets: this.socketToUser.size,
      users: Array.from(this.onlineUsers.values()).map(u => ({
        id: u.id,
        name: u.name,
        sockets: u.socketIds.size,
      })),
    };
  }
}

// Singleton instance
export const presenceManager = new PresenceManager();
