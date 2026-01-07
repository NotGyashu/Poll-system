import type { PollWithOptions, PollResults } from './poll.types';
import type { Student } from './student.types';
import type { Message } from './chat.types';

export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Poll events
export interface PollStartedPayload {
  poll: PollWithOptions;
  remainingTime: number;
}

export interface PollEndedPayload {
  pollId: string;
  results: PollResults;
}

export interface VoteUpdatePayload {
  pollId: string;
  results: PollResults;
}

export interface TimerTickPayload {
  pollId: string;
  remainingTime: number;
}

// Student events
export interface StudentJoinedPayload {
  student: Student;
}

export interface StudentKickedPayload {
  studentId: string;
  reason?: string;
}

export interface StudentRemovedPayload {
  studentId: string;
}

// Chat events
export interface ChatMessagePayload {
  message: Message;
}

// State recovery
export interface StudentState {
  activePoll: PollWithOptions | null;
  results: PollResults | null;
  remainingTime: number;
  hasVoted: boolean;
  student: Student | null;
}

export interface TeacherState {
  activePoll: PollWithOptions | null;
  results: PollResults | null;
  remainingTime: number;
  onlineStudents: Student[];
  pollHistory: PollWithOptions[];
}
