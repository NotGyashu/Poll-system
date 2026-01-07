export type PollStatus = 'pending' | 'active' | 'completed';

export interface Poll {
  id: string;
  question: string;
  duration: number;
  status: PollStatus;
  started_at: Date | null;
  ended_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOptionDTO {
  text: string;
  is_correct?: boolean;
}

export interface CreatePollDTO {
  question: string;
  options: CreateOptionDTO[] | string[];
  duration?: number;
}

export interface PollWithOptions extends Poll {
  options: Option[];
}

export interface Option {
  id: string;
  poll_id: string;
  text: string;
  display_order: number;
  is_correct: boolean;
  created_at: Date;
}

export interface PollResult {
  poll_id: string;
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

export interface PollWithResults extends Poll {
  options: OptionWithVotes[];
  total_votes: number;
}

export interface OptionWithVotes extends Option {
  vote_count: number;
  percentage: number;
}
