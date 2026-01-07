import { OptionCard } from '../shared';
import type { Poll, Option, PollResults } from '../../types';

interface LiveResultsProps {
  poll: Poll;
  options: Option[];
  results: PollResults | null;
  remainingTime: number;
  onEndPoll: () => void;
}

export const LiveResults = ({
  poll,
  options,
  results,
  remainingTime,
  onEndPoll,
}: LiveResultsProps) => {
  const totalVotes = results?.total_votes || 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVoteCount = (optionId: string): number => {
    if (!results) return 0;
    const result = results.options.find((o) => o.option_id === optionId);
    return result?.vote_count || 0;
  };

  const isLowTime = remainingTime <= 10 && remainingTime > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Live Results</h2>
        <div className={`text-2xl font-bold ${isLowTime ? 'text-timer-red animate-pulse' : 'text-gray-700'}`}>
          {formatTime(remainingTime)}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6 p-4 bg-bg-light rounded-lg">
        <p className="text-lg font-medium text-gray-800">{poll.question}</p>
      </div>

      {/* Stats */}
      <div className="flex justify-center mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{totalVotes}</div>
          <div className="text-sm text-gray-600">Total Votes</div>
        </div>
      </div>

      {/* Options with Results */}
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            showResults={true}
            voteCount={getVoteCount(option.id)}
            totalVotes={totalVotes}
            isCorrect={option.is_correct}
          />
        ))}
      </div>

      {/* End Poll Button */}
      <button
        onClick={onEndPoll}
        className="w-full py-3 bg-timer-red text-white rounded-lg font-medium hover:bg-timer-red/90 transition-colors"
      >
        End Poll Early
      </button>
    </div>
  );
};
