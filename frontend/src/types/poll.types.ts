export type PollStatus = 'pending' | 'active' | 'completed';

export interface Option {
  id: string;
  poll_id: string;
  text: string;
  display_order: number;
  is_correct: boolean;
  created_at: string;
}

export interface Poll {
  id: string;
  question: string;
  duration: number;
  status: PollStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PollWithOptions extends Poll {
  options: Option[];
}

export interface OptionResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
  is_correct: boolean;
}

export interface PollResults {
  poll_id: string;
  question: string;
  total_votes: number;
  options: OptionResult[];
}

export interface CreateOptionDTO {
  text: string;
  is_correct?: boolean;
}

export interface CreatePollDTO {
  question: string;
  options: CreateOptionDTO[];
  duration: number;
}
