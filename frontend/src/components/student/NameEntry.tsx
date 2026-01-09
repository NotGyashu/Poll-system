import { useState } from 'react';
import { Button, IntervueBadge } from '../shared';

interface NameEntryProps {
  onSubmit: (name: string) => void;
  isLoading?: boolean;
}

export const NameEntry = ({ onSubmit, isLoading = false }: NameEntryProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    
    setError('');
    onSubmit(trimmedName);
  };

  return (
    <div className="min-h-screen w-[90vw] md:w-[50vw] bg-white flex items-center justify-center p-4 mx-auto">
      <div className="w-full text-center">
        <div className="mb-6">
          <IntervueBadge />
        </div>
        
        <h1 className="text-3xl font-normal text-gray-800 mb-2">
          Let's <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-500 mb-8 mx-auto">
          If you're a student, you'll be able to <span className="font-medium text-gray-700">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6 w-[70%] mx-auto">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your Name
            </label>
            <input
              type="text"
              placeholder="Rahul Bajaj"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 focus:outline-none bg-[#F2F2F2] ${
                error ? 'border-red-500' : ''
              }`}
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          
          <Button
            type="submit"
            className="px-16 py-3"
            size="md"
            isLoading={isLoading}
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
};
