export interface Message {
  id: string;
  sender_id: string | null;
  sender_name: string;
  sender_type: 'teacher' | 'student';
  content: string;
  created_at: Date;
}

export interface CreateMessageDTO {
  sender_id?: string;
  sender_name: string;
  sender_type: 'teacher' | 'student';
  content: string;
}
