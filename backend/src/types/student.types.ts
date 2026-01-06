export interface Student {
  id: string;
  name: string;
  session_id: string;
  socket_id: string | null;
  is_online: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStudentDTO {
  name: string;
  session_id: string;
}

export interface UpdateStudentDTO {
  name?: string;
  socket_id?: string | null;
  is_online?: boolean;
}
