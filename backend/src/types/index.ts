export * from './poll.types';
export * from './vote.types';
export * from './student.types';

// api response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
