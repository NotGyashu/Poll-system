import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage?: boolean;
}

export const ChatMessage = ({ message, isOwnMessage = false }: ChatMessageProps) => {
  const isTeacher = message.sender_type === 'teacher';

  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      {/* Sender Name */}
      <span className={`text-sm font-medium mb-1 ${isTeacher ? 'text-primary' : 'text-primary'}`}>
        {message.sender_name}
        {isTeacher && ' (Teacher)'}
      </span>
      
      {/* Message Bubble */}
      <div
        className={`max-w-[75%] text-base px-3 py-2 ${
          isOwnMessage
            ? 'bg-primary text-white rounded-xl rounded-tr-none'
            : 'bg-[#3A3A3B] text-white rounded-xl rounded-tl-none'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
      </div>
    </div>
  );
};
