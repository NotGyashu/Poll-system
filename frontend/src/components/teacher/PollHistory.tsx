import type { Poll } from '../../types';
import { StatusBadge } from '../shared';

interface PollHistoryProps {
  polls: Poll[];
  onViewResults: (pollId: string) => void;
}

export const PollHistory = ({ polls, onViewResults }: PollHistoryProps) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Poll History</h2>

      {polls.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No polls yet
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {polls.map((poll) => (
            <li
              key={poll.id}
              className="py-4 cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors"
              onClick={() => onViewResults(poll.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {poll.question}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(poll.created_at)}
                  </p>
                </div>
                <StatusBadge status={poll.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
