import { OptionCard, Button } from '../shared';
import type { Poll, Option } from '../../types';

interface PollViewProps {
  poll: Poll;
  options: Option[];
  remainingTime: number;
  hasVoted: boolean;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onSubmitVote: () => void;
  isSubmitting?: boolean;
}

export const PollView = ({
  poll,
  options,
  remainingTime,
  hasVoted,
  selectedOptionId,
  onSelectOption,
  onSubmitVote,
  isSubmitting = false,
}: PollViewProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingTime <= 10 && remainingTime > 0;

  return (
    <div className="min-h-screen bg-bg-light p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Active Poll</h1>
            <div className={`text-2xl font-bold ${isLowTime ? 'text-timer-red animate-pulse' : 'text-gray-700'}`}>
              {formatTime(remainingTime)}
            </div>
          </div>
          
          <h2 className="text-lg text-gray-700">{poll.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              disabled={hasVoted}
              onClick={() => onSelectOption(option.id)}
            />
          ))}
        </div>

        {/* Submit Button */}
        {!hasVoted && (
          <Button
            onClick={onSubmitVote}
            disabled={!selectedOptionId}
            isLoading={isSubmitting}
            className="w-full"
            size="lg"
          >
            Submit Answer
          </Button>
        )}

        {hasVoted && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
            <span className="font-medium">✓ Answer submitted!</span>
            <p className="text-sm mt-1">Waiting for results...</p>
          </div>
        )}
      </div>
    </div>
  );
};
