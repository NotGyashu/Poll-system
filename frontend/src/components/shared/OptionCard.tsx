import type { Option } from '../../types';

interface OptionCardProps {
  option: Option;
  isSelected?: boolean;
  showResults?: boolean;
  voteCount?: number;
  totalVotes?: number;
  isCorrect?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const OptionCard = ({
  option,
  isSelected = false,
  showResults = false,
  voteCount = 0,
  totalVotes = 0,
  isCorrect,
  disabled = false,
  onClick,
}: OptionCardProps) => {
  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  const getBackgroundStyle = () => {
    if (showResults && isCorrect) {
      return 'bg-green-100 border-green-500';
    }
    if (isSelected) {
      return 'bg-primary/10 border-primary';
    }
    return 'bg-white border-gray-200 hover:border-primary/50';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || showResults}
      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${getBackgroundStyle()} ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-800">{option.text}</span>
        {isSelected && !showResults && (
          <span className="text-primary">✓</span>
        )}
      </div>
      
      {showResults && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{voteCount} votes</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isCorrect ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
};
