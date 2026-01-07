export type SenderType = 'teacher' | 'student';

export interface Message {
  id: string;
  sender_id: string | null;
  sender_name: string;
  sender_type: SenderType;
  content: string;
  created_at: string;
}

export interface SendMessageDTO {
  senderId?: string;
  senderName: string;
  senderType: SenderType;
  content: string;
}
