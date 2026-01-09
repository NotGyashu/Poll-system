import { useState, useRef, useEffect } from 'react';
import { Button, IntervueBadge } from '../shared';
import { TIMER_OPTIONS } from '../../utils/constants';

interface PollOption {
  text: string;
  isCorrect: boolean;
}

interface PollCreatorProps {
  onCreatePoll: (question: string, options: PollOption[], duration: number) => void;
  isLoading?: boolean;
}

const DRAFT_KEY = 'pollDraft';

interface PollDraft {
  question: string;
  options: PollOption[];
  duration: number;
}

export const PollCreator = ({ onCreatePoll, isLoading = false }: PollCreatorProps) => {
  // Load draft from sessionStorage on mount
  const loadDraft = (): PollDraft | null => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const draft = loadDraft();
  const [question, setQuestion] = useState(draft?.question || '');
  const [options, setOptions] = useState<PollOption[]>(draft?.options || [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [duration, setDuration] = useState(draft?.duration || TIMER_OPTIONS[1].value);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save draft to sessionStorage whenever form changes
  useEffect(() => {
    const draft: PollDraft = { question, options, duration };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [question, options, duration]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = TIMER_OPTIONS.find(opt => opt.value === duration)?.label || '';

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const setCorrectOption = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];
    newOptions[index].isCorrect = isCorrect;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
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

    const hasCorrect = options.some((opt) => opt.isCorrect && opt.text.trim());
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
    
    // Clear draft after successful submission
    sessionStorage.removeItem(DRAFT_KEY);
  };

  const maxChars = 100;
  const charCount = question.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-4">
          <IntervueBadge />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Let's Get Started
        </h1>
        <p className="text-gray-500 mb-4">
          you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time to answer
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Question */}
          <div className=''>
            <div className='flex justify-between mb-8 '>
              <label className="block text-gray-700 font-medium mb-2">
                Enter Your Question
              </label>
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="appearance-none px-4 py-1.5 pr-10 rounded-sm focus:outline-none bg-[#F1F1F1] cursor-pointer flex items-center font-semibold"
              >
                {selectedLabel}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L0 0H12L6 8Z" fill="#7765DA"/>
                  </svg>
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-[#F1F1F1] rounded-sm shadow-lg z-10 min-w-full">
                  {TIMER_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setDuration(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors ${
                        duration === option.value ? 'bg-primary text-white' : ''
                      }`}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
            <div className="relative">
              <textarea
                placeholder="Type your question here"
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, maxChars))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 bg-[#F2F2F2] rounded-sm focus:outline-none resize-none"
              />
              <span className="absolute right-3 bottom-3 text-sm text-gray-400">
                {charCount}/{maxChars}
              </span>
            </div>
            {errors.question && (
              <p className="mt-1 text-sm text-red-500">{errors.question}</p>
            )}
          </div>

          

          {/* Options */}
          <div className='mb-4'>
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-700 font-medium">
                Edit Options
              </label>
              <span className="text-gray-500 text-sm">Is it Correct?</span>
            </div>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-8 h-8  bg-primary text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 py-2  px-3 focus:outline-none bg-[#F2F2F2]"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={option.isCorrect}
                        onChange={() => setCorrectOption(index, true)}
                        className="w-4 h-4 accent-[#8F64E1]"
                      />
                      <span className="text-sm text-gray-600">Yes</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={!option.isCorrect}
                        onChange={() => setCorrectOption(index, false)}
                        className="w-4 h-4 accent-[#8F64E1]"
                      />
                      <span className="text-sm text-gray-600">No</span>
                    </label>
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 5L5 15M5 5L15 15" stroke="#8F64E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
              >
                + Add More option
              </button>
            )}
            {errors.options && (
              <p className="mt-2 text-sm text-red-500">{errors.options}</p>
            )}
            {errors.correct && (
              <p className="mt-2 text-sm text-red-500">{errors.correct}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="px-1 py-1.5"
              size="md"
              isLoading={isLoading}
            >
              Ask Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
