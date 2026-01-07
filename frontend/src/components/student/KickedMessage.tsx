import { Button } from '../shared';

interface KickedMessageProps {
  onRejoin: () => void;
}

export const KickedMessage = ({ onRejoin }: KickedMessageProps) => {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-4xl mb-4">😔</div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          You've been removed
        </h1>
        
        <p className="text-gray-600 mb-6">
          The teacher has removed you from the session.
        </p>
        
        <Button onClick={onRejoin} className="w-full" size="lg">
          Try to Rejoin
        </Button>
      </div>
    </div>
  );
};
