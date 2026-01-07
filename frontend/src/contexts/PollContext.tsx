import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Poll, Option, PollResults } from '../types';

interface PollState {
  currentPoll: Poll | null;
  options: Option[];
  results: PollResults | null;
  selectedOptionId: string | null;
  hasVoted: boolean;
  isLoading: boolean;
}

type PollAction =
  | { type: 'SET_POLL'; payload: Poll }
  | { type: 'SET_OPTIONS'; payload: Option[] }
  | { type: 'SET_RESULTS'; payload: PollResults }
  | { type: 'SELECT_OPTION'; payload: string }
  | { type: 'MARK_VOTED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_POLL' }
  | { type: 'RESTORE_STATE'; payload: Partial<PollState> };

const initialState: PollState = {
  currentPoll: null,
  options: [],
  results: null,
  selectedOptionId: null,
  hasVoted: false,
  isLoading: false,
};

const pollReducer = (state: PollState, action: PollAction): PollState => {
  switch (action.type) {
    case 'SET_POLL':
      return { ...state, currentPoll: action.payload };
    case 'SET_OPTIONS':
      return { ...state, options: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'SELECT_OPTION':
      return { ...state, selectedOptionId: action.payload };
    case 'MARK_VOTED':
      return { ...state, hasVoted: true };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_POLL':
      return { ...initialState };
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface PollContextValue {
  state: PollState;
  setPoll: (poll: Poll) => void;
  setOptions: (options: Option[]) => void;
  setResults: (results: PollResults) => void;
  selectOption: (optionId: string) => void;
  markVoted: () => void;
  setLoading: (loading: boolean) => void;
  clearPoll: () => void;
  restoreState: (state: Partial<PollState>) => void;
}

const PollContext = createContext<PollContextValue | null>(null);

interface PollProviderProps {
  children: ReactNode;
}

export const PollProvider = ({ children }: PollProviderProps) => {
  const [state, dispatch] = useReducer(pollReducer, initialState);

  const setPoll = useCallback((poll: Poll) => {
    dispatch({ type: 'SET_POLL', payload: poll });
  }, []);

  const setOptions = useCallback((options: Option[]) => {
    dispatch({ type: 'SET_OPTIONS', payload: options });
  }, []);

  const setResults = useCallback((results: PollResults) => {
    dispatch({ type: 'SET_RESULTS', payload: results });
  }, []);

  const selectOption = useCallback((optionId: string) => {
    dispatch({ type: 'SELECT_OPTION', payload: optionId });
  }, []);

  const markVoted = useCallback(() => {
    dispatch({ type: 'MARK_VOTED' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const clearPoll = useCallback(() => {
    dispatch({ type: 'CLEAR_POLL' });
  }, []);

  const restoreState = useCallback((restoredState: Partial<PollState>) => {
    dispatch({ type: 'RESTORE_STATE', payload: restoredState });
  }, []);

  const value: PollContextValue = {
    state,
    setPoll,
    setOptions,
    setResults,
    selectOption,
    markVoted,
    setLoading,
    clearPoll,
    restoreState,
  };

  return (
    <PollContext.Provider value={value}>
      {children}
    </PollContext.Provider>
  );
};

export const usePollContext = (): PollContextValue => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePollContext must be used within a PollProvider');
  }
  return context;
};
