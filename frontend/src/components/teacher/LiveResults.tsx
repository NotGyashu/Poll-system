import { Button, IntervueBadge } from '../shared';
import type { Poll, Option, PollResults } from '../../types';
import { PollHistory } from './PollHistory';

interface LiveResultsProps {
  poll: Poll;
  options: Option[];
  results: PollResults | null;
  remainingTime: number;
  onEndPoll?: () => void;
  onNewPoll?: () => void;
  polls?: Poll[];
  onViewResults?: (pollId: string) => void;
  showWaitingMessage?: boolean;
}

export const LiveResults = ({
  poll,
  options,
  results,
  remainingTime,
  onEndPoll,
  onNewPoll,
  polls = [],
  onViewResults,
  showWaitingMessage = false,
}: LiveResultsProps) => {
  const totalVotes = results?.total_votes || 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVoteCount = (optionId: string): number => {
    if (!results) return 0;
    const result = results.options.find((o) => o.option_id === optionId);
    return result?.vote_count || 0;
  };

  const getPercentage = (optionId: string): number => {
    if (totalVotes === 0) return 0;
    return Math.round((getVoteCount(optionId) / totalVotes) * 100);
  };

  const isLowTime = remainingTime <= 10 && remainingTime > 0;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-800">Question</span>
          </div>
          <div className="flex items-center gap-4">
            {onViewResults && <PollHistory polls={polls} onViewResults={onViewResults} />}
           <img src="/clock.svg" alt="Clock" width="24" height="24" />
            <div className={`text-xl font-bold text-[#CB1206] ${isLowTime ? 'animate-pulse' : ''}`}>
              {formatTime(remainingTime)}
            </div>
          </div>
        </div>

        {/* Poll Card with Results */}
        <div className="bg-white rounded-lg border border-primary overflow-hidden mb-6">
          {/* Dark header */}
          <div className="question-gradient px-4 py-2 mb-4">
            <h2 className="text-white text-lg font-medium">{poll.question}</h2>
          </div>
          
          {/* Results Options */}
          <div className="p-2 space-y-3">
            {options.map((option, index) => {
              const percentage = getPercentage(option.id);
              
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

        {/* Action Buttons - Only show for teachers */}
        {(onEndPoll || onNewPoll) && (
          <div className="space-y-3">
            {!onNewPoll && onEndPoll && (
              <button
                onClick={onEndPoll}
                className=" p-2 bg-primary text-white rounded-xl font-medium "
              >
                End Poll Early
              </button>
            )}
            
            {onNewPoll && (
              <div className='flex justify-end'>
                <Button onClick={onNewPoll} className="px-3 py-2">
                + Ask a new question
              </Button>
              </div>
            )}
          </div>
        )}

        {/* Waiting message for students when poll ends */}
        {showWaitingMessage && (
          <div className="text-center mt-6">
            <p className="text-gray-700 text-lg font-medium">
              Wait for the teacher to ask a new question..
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
