export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const DURATION_OPTIONS = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '60 seconds' },
  { value: 90, label: '90 seconds' },
  { value: 120, label: '120 seconds' },
];

export const DEFAULT_DURATION = 60;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const MAX_QUESTION_LENGTH = 100;
export const MAX_OPTION_LENGTH = 50;
export const MAX_MESSAGE_LENGTH = 500;

export const SOCKET_EVENTS = {
  // Poll events
  POLL_CREATE: 'poll:create',
  POLL_CREATED: 'poll:created',
  POLL_START: 'poll:start',
  POLL_STARTED: 'poll:started',
  POLL_END: 'poll:end',
  POLL_ENDED: 'poll:ended',
  POLL_GET_ACTIVE: 'poll:get-active',

  // Vote events
  VOTE_SUBMIT: 'vote:submit',
  VOTE_UPDATE: 'vote:update',
  VOTE_CHECK: 'vote:check',
  VOTE_GET_RESULTS: 'vote:get-results',

  // Timer events
  TIMER_TICK: 'timer:tick',

  // Student events
  STUDENT_JOIN: 'student:join',
  STUDENT_JOINED: 'student:joined',
  STUDENT_RECONNECT: 'student:reconnect',
  STUDENT_LEAVE: 'student:leave',
  STUDENT_LEFT: 'student:left',
  STUDENT_KICK: 'student:kick',
  STUDENT_KICKED: 'student:kicked',
  STUDENT_REMOVED: 'student:removed',

  // State events
  STATE_REQUEST: 'state:request',
  TEACHER_STATE: 'teacher:state',

  // Chat events
  CHAT_SEND: 'chat:send',
  CHAT_MESSAGE: 'chat:message',
  CHAT_HISTORY: 'chat:history',
  CHAT_DELETE: 'chat:delete',
  CHAT_DELETED: 'chat:deleted',
} as const;
