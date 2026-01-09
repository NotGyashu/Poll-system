import { Button, IntervueBadge } from '../shared';

interface KickedMessageProps {
  onRejoin: () => void;
}

export const KickedMessage = ({ onRejoin }: KickedMessageProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <IntervueBadge />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          You've been Kicked out!
        </h1>
        
        <p className="text-gray-500 mb-8">
        Looks like the teacher had removed you from the poll system .Please Try again sometime.
        </p>
        
       
      </div>
    </div>
  );
};
