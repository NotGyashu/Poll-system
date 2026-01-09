import type { Option } from '../../types';

interface PollCardProps {
  question: string;
  options: Option[];
  selectedOptionId?: string | null;
  showResults?: boolean;
  results?: { option_id: string; vote_count: number }[];
  totalVotes?: number;
  onSelectOption?: (optionId: string) => void;
  disabled?: boolean;
}

export const PollCard = ({
  question,
  options,
  selectedOptionId,
  showResults = false,
  results = [],
  totalVotes = 0,
  onSelectOption,
  disabled = false,
}: PollCardProps) => {
  const getVoteCount = (optionId: string): number => {
    const result = results.find((r) => r.option_id === optionId);
    return result?.vote_count || 0;
  };

  const getPercentage = (optionId: string): number => {
    if (totalVotes === 0) return 0;
    return Math.round((getVoteCount(optionId) / totalVotes) * 100);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Dark Header */}
      <div className="bg-[#373737] text-white px-5 py-3">
        <p className="font-medium">{question}</p>
      </div>

      {/* Options */}
      <div className="p-4 space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const percentage = getPercentage(option.id);

          return (
            <div key={option.id} className="relative">
              {showResults ? (
                // Results View
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-primary rounded-lg transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{option.text}</span>
                    </div>
                    <span className="font-medium text-gray-700">{percentage}%</span>
                  </div>
                </div>
              ) : (
                // Selection View
                <button
                  type="button"
                  onClick={() => onSelectOption?.(option.id)}
                  disabled={disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isSelected ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{option.text}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
