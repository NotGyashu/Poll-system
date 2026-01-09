import { useState } from 'react';
import type { Poll, PollResults } from '../../types';
import { pollApi } from '../../services';

interface PollHistoryProps {
  polls: Poll[];
  onViewResults?: (pollId: string) => void;
}

interface PollWithResults {
  poll: Poll;
  results: PollResults | null;
}

export const PollHistory = ({ polls }: PollHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pollsWithResults, setPollsWithResults] = useState<PollWithResults[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenHistory = async () => {
    setIsOpen(true);
    setIsLoading(true);
    
    try {
      const results = await Promise.all(
        polls.map(async (poll) => {
          try {
            const result = await pollApi.getResults(poll.id);
            return { poll, results: result };
          } catch {
            return { poll, results: null };
          }
        })
      );
      setPollsWithResults(results);
    } catch {
      setPollsWithResults(polls.map(poll => ({ poll, results: null })));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* View Poll History Button */}
      <button
        onClick={handleOpenHistory}
        className=" fixed top-6 right-6 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
        View Poll history
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                View <span className="font-normal">Poll History</span>
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : polls.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No polls yet</p>
              ) : (
                <div className="space-y-6">
                  {pollsWithResults.map((item, index) => (
                    <div key={item.poll.id}>
                      <h3 className="font-bold text-gray-800 mb-3">Question {index + 1}</h3>
                      <div className="bg-white border rounded-lg overflow-hidden">
                        {/* Question Header */}
                        <div className="bg-primary text-white px-4 py-3">
                          <p className="font-medium">{item.poll.question}</p>
                        </div>
                        
                        {/* Options with results */}
                        <div className="p-2 space-y-2">
                          {item.results?.options.map((option, optIndex) => (
                            <div
                              key={option.option_id}
                              className="relative bg-gray-100 rounded overflow-hidden"
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-primary/80"
                                style={{ width: `${option.percentage}%` }}
                              />
                              <div className="relative flex items-center justify-between px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-primary text-white text-xs flex items-center justify-center rounded">
                                    {optIndex + 1}
                                  </span>
                                  <span className={option.percentage > 50 ? 'text-white' : 'text-gray-800'}>
                                    {option.option_text}
                                  </span>
                                </div>
                                <span className="text-gray-700 font-medium">{option.percentage}%</span>
                              </div>
                            </div>
                          )) || (
                            <p className="text-gray-500 text-center py-4">No results available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
