import { useState } from 'react';
import { Button, Input } from '../shared';

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
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Welcome to the Poll
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your name to join
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            autoFocus
          />
          
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Join Poll
          </Button>
        </form>
      </div>
    </div>
  );
};
