export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  student_id: string;
  created_at: Date;
}

export interface CreateVoteDTO {
  poll_id: string;
  option_id: string;
  student_id: string;
}

export interface VoteCount {
  option_id: string;
  option_text: string;
  count: number;
  percentage: number;
}

export interface PollResults {
  poll_id: string;
  question: string;
  total_votes: number;
  votes: VoteCount[];
}
