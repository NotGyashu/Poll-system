import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage as ChatMessageType, Student } from '../../types';

interface ChatPanelProps {
  messages: ChatMessageType[];
  currentUserId?: string;
  onSendMessage: (content: string) => void;
  isConnected?: boolean;
  participants?: Student[];
  onKickStudent?: (studentId: string) => void;
  isTeacher?: boolean;
}

export const ChatPanel = ({
  messages,
  currentUserId,
  onSendMessage,
  isConnected = true,
  participants = [],
  onKickStudent,
  isTeacher = false,
}: ChatPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Track the number of messages that user has already read
  const [lastReadCount, setLastReadCount] = useState(0);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // When chat panel is opened, mark all messages as read
  useEffect(() => {
    if (isOpen) {
      setLastReadCount(messages.length);
    }
  }, [isOpen, messages.length]);

  // Calculate unread count: new messages since last time panel was open
  const unreadCount = messages.length - lastReadCount;

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all z-40 flex items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[420px] bg-white rounded-2xl shadow-xl z-40 flex flex-col overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'participants'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Participants
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">No messages yet</p>
                ) : (
                  messages.map((message) => {
                    // Fix: treat teacher's own messages as 'own' if currentUserId is 'teacher' and sender_type is 'teacher'
                    const isOwn = message.sender_id === currentUserId || (currentUserId === 'teacher' && message.sender_type === 'teacher');
                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwn}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100">
                <ChatInput onSendMessage={onSendMessage} disabled={!isConnected} />
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {participants.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No participants yet</p>
              ) : (
                <div className="flex flex-col">
                  {/* Table Header */}
                  <div className="grid grid-cols-2 px-4 py-3 ">
                    <div className="text-sm font-medium text-gray-600">Name</div>
                    {isTeacher && <div className="text-sm font-medium text-gray-600 text-right">Action</div>}
                  </div>
                  {/* Table Rows */}
                  <div className="divide-y divide-gray-100">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="grid grid-cols-2 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {participant.name}
                        </div>
                        {isTeacher && onKickStudent && (
                          <div className="text-right">
                            <button
                              onClick={() => onKickStudent(participant.id)}
                              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              Kick out
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
