import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage?: boolean;
}

export const ChatMessage = ({ message, isOwnMessage = false }: ChatMessageProps) => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isTeacher = message.sender_type === 'teacher';

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'bg-primary text-white rounded-br-md'
            : isTeacher
            ? 'bg-accent/10 text-gray-800 rounded-bl-md border border-accent/20'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${isTeacher ? 'text-accent' : 'text-gray-600'}`}>
              {message.sender_name}
              {isTeacher && ' (Teacher)'}
            </span>
          </div>
        )}
        <p className="text-sm break-words">{message.content}</p>
        <span className={`text-xs mt-1 block ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
};
