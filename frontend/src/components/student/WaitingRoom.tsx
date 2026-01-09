import { LoadingSpinner, IntervueBadge } from '../shared';

interface WaitingRoomProps {
  studentName: string;
}

export const WaitingRoom = ({ studentName: _studentName }: WaitingRoomProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <IntervueBadge />
        </div>
        
        <div className="mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Wait for the teacher to ask questions..
        </h1>
      </div>
    </div>
  );
};
