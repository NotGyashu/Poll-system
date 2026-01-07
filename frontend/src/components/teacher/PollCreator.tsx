import { useState } from 'react';
import { Button, Input } from '../shared';
import { TIMER_OPTIONS } from '../../utils/constants';

interface PollOption {
  text: string;
  isCorrect: boolean;
}

interface PollCreatorProps {
  onCreatePoll: (question: string, options: PollOption[], duration: number) => void;
  isLoading?: boolean;
}

export const PollCreator = ({ onCreatePoll, isLoading = false }: PollCreatorProps) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [duration, setDuration] = useState(TIMER_OPTIONS[1].value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const setCorrectOption = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    const filledOptions = options.filter((opt) => opt.text.trim());
    if (filledOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    const hasCorrect = options.some((opt) => opt.isCorrect);
    if (!hasCorrect) {
      newErrors.correct = 'Please select the correct answer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const filledOptions = options.filter((opt) => opt.text.trim());
    onCreatePoll(question.trim(), filledOptions, duration);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Poll</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <Input
          label="Question"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          error={errors.question}
        />

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorrectOption(index)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    option.isCorrect
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {option.isCorrect && '✓'}
                </button>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-gray-400 hover:text-timer-red transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="mt-1 text-sm text-timer-red">{errors.options}</p>
          )}
          {errors.correct && (
            <p className="mt-1 text-sm text-timer-red">{errors.correct}</p>
          )}
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 text-primary hover:text-primary/80 text-sm font-medium"
            >
              + Add Option
            </button>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit
          </label>
          <div className="flex gap-2 flex-wrap">
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  duration === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Start Poll
        </Button>
      </form>
    </div>
  );
};
