import type { ReactNode } from 'react';
import { SocketProvider } from './SocketContext';
import { StudentProvider } from './StudentContext';
import { PollProvider } from './PollContext';
import { ChatProvider } from './ChatContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <SocketProvider>
      <StudentProvider>
        <PollProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </PollProvider>
      </StudentProvider>
    </SocketProvider>
  );
};
