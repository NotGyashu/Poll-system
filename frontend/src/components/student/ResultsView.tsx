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
}: ResultsViewProps) => {
  const totalVotes = results.total_votes;
  
  const getVoteCount = (optionId: string): number => {
    const result = results.options.find((o) => o.option_id === optionId);
    return result?.vote_count || 0;
  };

  const getPercentage = (optionId: string): number => {
    if (totalVotes === 0) return 0;
    return Math.round((getVoteCount(optionId) / totalVotes) * 100);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-800">Question</span>
          </div>
        </div>

        {/* Poll Card with Results */}
        <div className="bg-white rounded-lg border border-primary overflow-hidden mb-6">
          {/* Dark header */}
          <div className="question-gradient px-4 py-3 mb-3">
            <h2 className="text-white text-lg font-medium">{poll.question}</h2>
          </div>
          
          {/* Results Options */}
          <div className="p-4 space-y-3">
            {options.map((option, index) => {
              const percentage = getPercentage(option.id);
              const isSelected = selectedOptionId === option.id;
              
              return (
                <div
                  key={option.id}
                  className={`relative flex items-center bg-gray-100 rounded-xl overflow-visible h-14 `}
                >
                  {/* Progress bar background */}
                  <div 
                    className="absolute inset-0 bg-primary transition-all rounded-xl"
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* Numbered circle */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold z-10 ml-2 ${percentage > 5 ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex items-center w-full pl-4 pr-4 py-3">
                    <span className={`flex-1 font-medium ${percentage > 10 ? 'text-white' : 'text-gray-800'}`}>
                      {option.text}
                    </span>
                    <span className={`font-semibold ${percentage > 90 ? 'text-white' : 'text-gray-700'}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiting Message */}
        <div className="text-center text-gray-800 font-semibold text-lg">
          Wait for the teacher to ask a new question..
        </div>
      </div>
    </div>
  );
};
