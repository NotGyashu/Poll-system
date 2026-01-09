import { Button, IntervueBadge } from '../shared';
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingTime <= 10 && remainingTime > 0;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with Question and Timer */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Question </h1>
          <div className="flex items-center gap-2">
            <img src="/clock.svg" alt="Clock" width="24" height="24" className="text-[#CB1206]" />
            <span className={`text-xl font-bold ${isLowTime ? 'text-[#CB1206] animate-pulse' : 'text-[#CB1206]'}`}>
              {formatTime(remainingTime)}
            </span>
          </div>
        </div>

        {/* Poll Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Dark header */}
          <div className="question-gradient px-6 py-4">
            <h2 className="text-white text-lg font-medium">{poll.question}</h2>
          </div>
          
          {/* Options */}
          <div className="p-4 space-y-3">
            {options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => !hasVoted && onSelectOption(option.id)}
                disabled={hasVoted}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedOptionId === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100 hover:border-gray-200'
                } ${hasVoted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-800 text-left">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        {!hasVoted && (
         <div className='flex justify-end'> <Button
            onClick={onSubmitVote}
            disabled={!selectedOptionId}
            isLoading={isSubmitting}
            className=""
            size="lg"
          >
            Submit
          </Button></div>
        )}

        {hasVoted && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center border border-green-200">
            <span className="font-medium">✓ Answer submitted!</span>
            <p className="text-sm mt-1 text-green-600">Waiting for results...</p>
          </div>
        )}
      </div>
    </div>
  );
};
