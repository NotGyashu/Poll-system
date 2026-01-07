export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  student_id: string;
  created_at: string;
}

export interface SubmitVoteDTO {
  pollId: string;
  optionId: string;
  studentId: string;
}
