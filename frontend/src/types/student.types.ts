export interface Student {
  id: string;
  name: string;
  session_id: string;
  socket_id?: string | null;
  is_online?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OnlineParticipant {
  id: string;
  name: string;
  joinedAt?: string;
}

export interface RegisterStudentDTO {
  name: string;
  session_id: string;
}
