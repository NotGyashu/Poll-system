import { useState, useEffect, useRef } from 'react';
import { useSocketContext, useChatContext, usePollContext, SocketProvider } from '../contexts';
import { PollCreator, LiveResults, PollHistory } from '../components/teacher';
import { ChatPanel } from '../components/chat';
import { LoadingSpinner } from '../components/shared';
import { pollApi, stateApi } from '../services';
import { SOCKET_EVENTS } from '../utils/constants';
import toast from 'react-hot-toast';
import type { Poll, Student, PollResults, PollWithOptions, ChatMessage } from '../types';

type TeacherScreen = 'loading' | 'create' | 'live';

interface CreatePollOption {
  text: string;
  isCorrect: boolean;
}

const TeacherPageContent = () => {
  const { socket, isConnected, emit, on, off } = useSocketContext();
  const { messages, addMessage } = useChatContext();
  const { state: pollState, setPoll, setOptions, setResults, clearPoll } = usePollContext();

  const [screen, setScreen] = useState<TeacherScreen>('loading');
  const [remainingTime, setRemainingTime] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isPollEnded, setIsPollEnded] = useState(false);
  
  // Ref to track current poll ID for socket handlers
  const currentPollIdRef = useRef<string | null>(null);
  
  // Keep ref in sync with poll state
  useEffect(() => {
    currentPollIdRef.current = pollState.currentPoll?.id || null;
  }, [pollState.currentPoll]);

  // Recover state on mount
  useEffect(() => {
    const recoverState = async () => {
      try {
        const state = await stateApi.getTeacherState();
        
        // Always load online students
        if (state.onlineStudents) {
          setStudents(state.onlineStudents);
        }
        
        if (state.activePoll) {
          setPoll(state.activePoll);
          setOptions(state.activePoll.options);
          setRemainingTime(state.remainingTime);
          
          // Always set results if available (for both active and completed polls)
          if (state.results) {
            setResults(state.results);
          }
          
          // If poll is completed, mark it as ended but stay on live screen
          if (state.activePoll.status === 'completed') {
            setIsPollEnded(true);
          }
          setScreen('live');
        } else {
          setScreen('create');
        }

        // Load poll history (only completed polls)
        const polls = await pollApi.getHistory();
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

    // Real-time presence update (primary source of truth)
    const handleParticipantsUpdate = (data: unknown) => {
      const payload = data as { count: number; participants: Array<{ id: string; name: string; joinedAt: string }> };
      setStudents(payload.participants.map(p => ({
        id: p.id,
        name: p.name,
        session_id: '', // Not needed for display
        is_online: true,
        created_at: p.joinedAt,
      })) as Student[]);
    };

    // User came online notification
    const handleUserOnline = (data: unknown) => {
      const payload = data as { id: string; name: string };
      toast.success(`${payload.name} joined`);
    };

    // User went offline notification
    const handleUserOffline = (_data: unknown) => {
      // Participants are updated via PRESENCE_PARTICIPANTS_UPDATE
    };

    const handleStudentRemoved = (data: unknown) => {
      const payload = data as { studentId: string };
      setStudents((prev) => prev.filter((s) => s.id !== payload.studentId));
    };

    const handleTimerTick = (data: unknown) => {
      const payload = data as { remainingTime: number };
      setRemainingTime(payload.remainingTime);
    };

    const handleVoteUpdate = (data: unknown) => {
      const payload = data as { pollId: string; results: PollResults };
      // Use ref to always have the latest poll ID
      if (currentPollIdRef.current && payload.pollId === currentPollIdRef.current) {
        setResults(payload.results);
      }
    };

    const handlePollEnded = async (data: unknown) => {
      const payload = data as { results: PollResults };
      setResults(payload.results);
      setIsPollEnded(true);
      // Stay on live screen, just show the "Ask a new question" button
      
      // Refresh poll history to include the newly completed poll
      try {
        const polls = await pollApi.getHistory();
        setPollHistory(polls);
      } catch {
        // Ignore errors
      }
    };

    const handleNewMessage = (data: unknown) => {
      const message = data as ChatMessage;
      addMessage(message);
    };

    // Presence events (real-time, socket-based)
    on(SOCKET_EVENTS.PRESENCE_PARTICIPANTS_UPDATE, handleParticipantsUpdate);
    on(SOCKET_EVENTS.PRESENCE_USER_ONLINE, handleUserOnline);
    on(SOCKET_EVENTS.PRESENCE_USER_OFFLINE, handleUserOffline);
    on(SOCKET_EVENTS.STUDENT_REMOVED, handleStudentRemoved);
    on(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
    on(SOCKET_EVENTS.VOTE_UPDATE, handleVoteUpdate);
    on(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
    on(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);

    return () => {
      off(SOCKET_EVENTS.PRESENCE_PARTICIPANTS_UPDATE, handleParticipantsUpdate);
      off(SOCKET_EVENTS.PRESENCE_USER_ONLINE, handleUserOnline);
      off(SOCKET_EVENTS.PRESENCE_USER_OFFLINE, handleUserOffline);
      off(SOCKET_EVENTS.STUDENT_REMOVED, handleStudentRemoved);
      off(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
      off(SOCKET_EVENTS.VOTE_UPDATE, handleVoteUpdate);
      off(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
      off(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);
    };
  }, [socket, on, off, setResults]);

  // Join as teacher when connected
  useEffect(() => {
    if (isConnected) {
      emit(SOCKET_EVENTS.STATE_REQUEST, { role: 'teacher' });
    }
  }, [isConnected, emit]);

  const handleCreatePoll = async (question: string, options: CreatePollOption[], duration: number) => {
    try {
      setIsCreating(true);
      setIsPollEnded(false);
      
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
      // senderId omitted for teacher so backend stores NULL
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
      setIsPollEnded(true);
      setRemainingTime(0);
      setScreen('live');
    } catch {
      toast.error('Failed to load poll results');
    }
  };

  const handleNewPoll = () => {
    clearPoll();
    setIsPollEnded(false);
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
      <div className="min-h-screen grid py-2 px-4  pl-[10vw]">
        <div className="">
              <PollCreator onCreatePoll={handleCreatePoll} isLoading={isCreating} />
        </div>
        <div className=''>
          
            <PollHistory polls={pollHistory} onViewResults={handleViewResults} />
  
          <ChatPanel
          messages={messages}
          currentUserId="teacher"
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
          participants={students}
          onKickStudent={handleKickStudent}
          isTeacher={true}
        />
        </div>
        
      </div>
    );
  }
// 
  if (screen === 'live' && pollState.currentPoll) {
    return (
      <div className="min-h-screen bg-light p-4">
        <div className="max-w-4xl mx-auto">
        
              <LiveResults
                poll={pollState.currentPoll}
                options={pollState.options}
                results={pollState.results}
                remainingTime={remainingTime}
                onEndPoll={handleEndPoll}
                onNewPoll={isPollEnded ? handleNewPoll : undefined}
                polls={pollHistory}
                onViewResults={handleViewResults}
              />
          
        </div>
        <ChatPanel
          messages={messages}
          currentUserId="teacher"
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
          participants={students}
          onKickStudent={handleKickStudent}
          isTeacher={true}
        />
      </div>
    );
  }

  return null;
};

export const TeacherPage = () => {
  return (
    <SocketProvider role="teacher">
      <TeacherPageContent />
    </SocketProvider>
  );
};
