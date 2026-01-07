import { OptionCard, Button } from '../shared';
import type { Poll, Option, PollResults } from '../../types';

interface ResultsViewProps {
  poll: Poll;
  options: Option[];
  results: PollResults;
  selectedOptionId: string | null;
  onNextPoll?: () => void;
}

export const ResultsView = ({
  poll,
  options,
  results,
  selectedOptionId,
  onNextPoll,
}: ResultsViewProps) => {
  const totalVotes = results.total_votes;
  
  const getVoteCount = (optionId: string): number => {
    const result = results.options.find((o) => o.option_id === optionId);
    return result?.vote_count || 0;
  };

  const getIsCorrect = (option: Option): boolean => {
    return option.is_correct === true;
  };

  const selectedOption = options.find((o) => o.id === selectedOptionId);
  const wasCorrect = selectedOption?.is_correct === true;

  return (
    <div className="min-h-screen bg-bg-light p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold text-gray-800">Results</h1>
            {selectedOptionId && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                wasCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {wasCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </span>
            )}
          </div>
          
          <h2 className="text-lg text-gray-700">{poll.question}</h2>
        </div>

        {/* Results */}
        <div className="space-y-3 mb-6">
          {options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              showResults={true}
              voteCount={getVoteCount(option.id)}
              totalVotes={totalVotes}
              isCorrect={getIsCorrect(option)}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{totalVotes}</div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
          </div>
        </div>

        {onNextPoll && (
          <Button onClick={onNextPoll} className="w-full" size="lg">
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};
