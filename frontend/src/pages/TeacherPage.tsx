import { useState, useEffect } from 'react';
import { useSocketContext, useChatContext, usePollContext } from '../contexts';
import { PollCreator, LiveResults, StudentList, PollHistory } from '../components/teacher';
import { ChatPanel } from '../components/chat';
import { LoadingSpinner } from '../components/shared';
import { pollApi, stateApi } from '../services';
import { SOCKET_EVENTS } from '../utils/constants';
import toast from 'react-hot-toast';
import type { Poll, Student, PollResults, PollWithOptions, ChatMessage } from '../types';

type TeacherScreen = 'loading' | 'create' | 'live' | 'results';

interface CreatePollOption {
  text: string;
  isCorrect: boolean;
}

export const TeacherPage = () => {
  const { socket, isConnected, emit, on, off } = useSocketContext();
  const { messages, addMessage } = useChatContext();
  const { state: pollState, setPoll, setOptions, setResults, clearPoll } = usePollContext();

  const [screen, setScreen] = useState<TeacherScreen>('loading');
  const [remainingTime, setRemainingTime] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Recover state on mount
  useEffect(() => {
    const recoverState = async () => {
      try {
        const state = await stateApi.getTeacherState();
        
        if (state.activePoll) {
          setPoll(state.activePoll);
          setOptions(state.activePoll.options);
          setRemainingTime(state.remainingTime);
          
          if (state.onlineStudents) {
            setStudents(state.onlineStudents);
          }
          
          if (state.activePoll.status === 'completed' && state.results) {
            setResults(state.results);
            setScreen('results');
          } else {
            setScreen('live');
          }
        } else {
          setScreen('create');
        }

        // Load poll history
        const polls = await pollApi.getAll();
        setPollHistory(polls);
      } catch {
        setScreen('create');
      }
    };

    recoverState();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleStudentJoined = (data: unknown) => {
      const student = data as Student;
      setStudents((prev) => {
        const exists = prev.some((s) => s.id === student.id);
        if (exists) return prev;
        return [...prev, student];
      });
      toast.success(`${student.name} joined`);
    };

    const handleStudentLeft = (data: unknown) => {
      const payload = data as { studentId: string };
      setStudents((prev) => prev.filter((s) => s.id !== payload.studentId));
    };

    const handleTimerTick = (data: unknown) => {
      const payload = data as { remainingTime: number };
      setRemainingTime(payload.remainingTime);
    };

    const handleVoteUpdate = async () => {
      if (pollState.currentPoll) {
        try {
          const results = await pollApi.getResults(pollState.currentPoll.id);
          setResults(results);
        } catch {
          // Ignore errors
        }
      }
    };

    const handlePollEnded = (data: unknown) => {
      const payload = data as { results: PollResults };
      setResults(payload.results);
      setScreen('results');
    };

    const handleNewMessage = (data: unknown) => {
      const message = data as ChatMessage;
      addMessage(message);
    };

    on(SOCKET_EVENTS.STUDENT_JOINED, handleStudentJoined);
    on(SOCKET_EVENTS.STUDENT_LEFT, handleStudentLeft);
    on(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
    on(SOCKET_EVENTS.VOTE_UPDATE, handleVoteUpdate);
    on(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
    on(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);

    return () => {
      off(SOCKET_EVENTS.STUDENT_JOINED, handleStudentJoined);
      off(SOCKET_EVENTS.STUDENT_LEFT, handleStudentLeft);
      off(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
      off(SOCKET_EVENTS.VOTE_UPDATE, handleVoteUpdate);
      off(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
      off(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);
    };
  }, [socket, on, off, pollState.currentPoll]);

  // Join as teacher when connected
  useEffect(() => {
    if (isConnected) {
      emit(SOCKET_EVENTS.STATE_REQUEST, { role: 'teacher' });
    }
  }, [isConnected, emit]);

  const handleCreatePoll = async (question: string, options: CreatePollOption[], duration: number) => {
    try {
      setIsCreating(true);
      
      const pollWithOptions: PollWithOptions = await pollApi.create({
        question,
        duration,
        options: options.map((opt, idx) => ({
          text: opt.text,
          display_order: idx,
          is_correct: opt.isCorrect,
        })),
      });

      setPoll(pollWithOptions);
      setOptions(pollWithOptions.options);
      setRemainingTime(duration);
      
      // Start the poll
      emit(SOCKET_EVENTS.POLL_START, { pollId: pollWithOptions.id });
      
      setScreen('live');
      toast.success('Poll started!');
    } catch {
      toast.error('Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEndPoll = () => {
    if (!pollState.currentPoll) return;
    emit(SOCKET_EVENTS.POLL_END, { pollId: pollState.currentPoll.id });
  };

  const handleKickStudent = (studentId: string) => {
    emit(SOCKET_EVENTS.STUDENT_KICK, { studentId });
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    toast.success('Student removed');
  };

  const handleSendMessage = (content: string) => {
    emit(SOCKET_EVENTS.CHAT_SEND, {
      senderName: 'Teacher',
      senderType: 'teacher',
      content,
    });
  };

  const handleViewResults = async (pollId: string) => {
    try {
      const pollWithOptions = await pollApi.getById(pollId);
      const results = await pollApi.getResults(pollId);
      
      setPoll(pollWithOptions);
      setOptions(pollWithOptions.options);
      setResults(results);
      setScreen('results');
    } catch {
      toast.error('Failed to load poll results');
    }
  };

  const handleNewPoll = () => {
    clearPoll();
    setScreen('create');
  };

  // Render screens
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (screen === 'create') {
    return (
      <div className="min-h-screen bg-bg-light p-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PollCreator onCreatePoll={handleCreatePoll} isLoading={isCreating} />
            </div>
            <div className="space-y-6">
              <StudentList students={students} onKickStudent={handleKickStudent} />
              <PollHistory polls={pollHistory} onViewResults={handleViewResults} />
            </div>
          </div>
        </div>
        <ChatPanel
          messages={messages}
          currentUserId="teacher"
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
        />
      </div>
    );
  }

  if (screen === 'live' && pollState.currentPoll) {
    return (
      <div className="min-h-screen bg-bg-light p-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveResults
                poll={pollState.currentPoll}
                options={pollState.options}
                results={pollState.results}
                remainingTime={remainingTime}
                onEndPoll={handleEndPoll}
              />
            </div>
            <div>
              <StudentList students={students} onKickStudent={handleKickStudent} />
            </div>
          </div>
        </div>
        <ChatPanel
          messages={messages}
          currentUserId="teacher"
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
        />
      </div>
    );
  }

  if (screen === 'results' && pollState.currentPoll && pollState.results) {
    return (
      <div className="min-h-screen bg-bg-light p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Final Results</h1>
            <p className="text-lg text-gray-700 mb-6">{pollState.currentPoll.question}</p>
            
            <div className="space-y-3 mb-6">
              {pollState.options.map((option) => {
                const result = pollState.results?.options.find((o) => o.option_id === option.id);
                const voteCount = result?.vote_count || 0;
                const totalVotes = pollState.results?.total_votes || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                return (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 ${
                      option.is_correct ? 'bg-green-100 border-green-500' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{option.text}</span>
                      {option.is_correct && <span className="text-green-600">✓ Correct</span>}
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{voteCount} votes</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${option.is_correct ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-primary">{pollState.results.total_votes}</span>
              <span className="text-gray-600 ml-2">total votes</span>
            </div>

            <button
              onClick={handleNewPoll}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Create New Poll
            </button>
          </div>
        </div>
        <ChatPanel
          messages={messages}
          currentUserId="teacher"
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
        />
      </div>
    );
  }

  return null;
};
