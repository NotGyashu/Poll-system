import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ChatMessage } from '../types';

interface ChatContextValue {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessagesState] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessagesState((prev) => [...prev, message]);
  }, []);

  const setMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessagesState(newMessages);
  }, []);

  const clearMessages = useCallback(() => {
    setMessagesState([]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, setMessages, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
