import { LoadingSpinner } from '../shared';

interface WaitingRoomProps {
  studentName: string;
}

export const WaitingRoom = ({ studentName }: WaitingRoomProps) => {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <LoadingSpinner size="lg" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Hi, {studentName}!
        </h1>
        
        <p className="text-gray-600 mb-4">
          Waiting for the teacher to start a poll...
        </p>
        
        <div className="flex items-center justify-center gap-2 text-primary">
          <span className="animate-pulse">●</span>
          <span className="text-sm">Connected to session</span>
        </div>
      </div>
    </div>
  );
};
