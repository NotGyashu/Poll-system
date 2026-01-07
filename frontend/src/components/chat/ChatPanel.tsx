import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatPanelProps {
  messages: ChatMessageType[];
  currentUserId?: string;
  onSendMessage: (content: string) => void;
  isConnected?: boolean;
}

export const ChatPanel = ({
  messages,
  currentUserId,
  onSendMessage,
  isConnected = true,
}: ChatPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const unreadCount = messages.length;

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all z-40 flex items-center justify-center"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-timer-red text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-2xl shadow-xl z-40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-medium">Chat</h3>
            <span className={`text-xs ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No messages yet</p>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_id === currentUserId}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <ChatInput onSendMessage={onSendMessage} disabled={!isConnected} />
          </div>
        </div>
      )}
    </>
  );
};
