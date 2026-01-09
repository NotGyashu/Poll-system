import { useState } from 'react';
import type { ReactNode } from 'react';

interface FloatingChatButtonProps {
  children: ReactNode;
}

export const FloatingChatButton = ({ children }: FloatingChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {children}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center z-50"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
};
