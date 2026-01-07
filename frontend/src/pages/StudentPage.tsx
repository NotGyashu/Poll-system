import { useState, useEffect } from 'react';
import { useSocketContext, useStudentContext, useChatContext, usePollContext } from '../contexts';
import { NameEntry, WaitingRoom, PollView, ResultsView, KickedMessage } from '../components/student';
import { ChatPanel } from '../components/chat';
import { LoadingSpinner } from '../components/shared';
import { studentApi, voteApi, stateApi } from '../services';
import { SOCKET_EVENTS } from '../utils/constants';
import toast from 'react-hot-toast';
import type { PollWithOptions, PollResults, ChatMessage } from '../types';

type StudentScreen = 'loading' | 'name-entry' | 'waiting' | 'poll' | 'results' | 'kicked';

export const StudentPage = () => {
  const { socket, isConnected, emit, on, off } = useSocketContext();
  const { student, sessionId, isRegistered, setStudent, clearStudent } = useStudentContext();
  const { messages, addMessage } = useChatContext();
  const { state: pollState, setPoll, setOptions, setResults, selectOption, markVoted, clearPoll } = usePollContext();

  const [screen, setScreen] = useState<StudentScreen>('loading');
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recover state on mount
  useEffect(() => {
    const recoverState = async () => {
      try {
        const state = await stateApi.getStudentState(student?.id, sessionId);
        
        if (state.activePoll) {
          setPoll(state.activePoll);
          setOptions(state.activePoll.options);
          setRemainingTime(state.remainingTime);
          
          if (state.hasVoted) {
            markVoted();
          }
          
          if (state.activePoll.status === 'completed' && state.results) {
            setResults(state.results);
            setScreen('results');
          } else {
            setScreen('poll');
          }
        } else if (isRegistered) {
          setScreen('waiting');
        } else {
          setScreen('name-entry');
        }
      } catch {
        if (isRegistered) {
          setScreen('waiting');
        } else {
          setScreen('name-entry');
        }
      }
    };

    recoverState();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handlePollStarted = (data: unknown) => {
      const payload = data as { poll: PollWithOptions; remainingTime: number };
      setPoll(payload.poll);
      setOptions(payload.poll.options);
      setRemainingTime(payload.remainingTime);
      setScreen('poll');
    };

    const handleTimerTick = (data: unknown) => {
      const payload = data as { remainingTime: number };
      setRemainingTime(payload.remainingTime);
    };

    const handlePollEnded = (data: unknown) => {
      const payload = data as { results: PollResults };
      setResults(payload.results);
      setScreen('results');
    };

    const handleKicked = () => {
      clearStudent();
      clearPoll();
      setScreen('kicked');
      toast.error('You have been removed from the session');
    };

    const handleNewMessage = (data: unknown) => {
      const message = data as ChatMessage;
      addMessage(message);
    };

    on(SOCKET_EVENTS.POLL_STARTED, handlePollStarted);
    on(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
    on(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
    on(SOCKET_EVENTS.STUDENT_KICKED, handleKicked);
    on(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);

    return () => {
      off(SOCKET_EVENTS.POLL_STARTED, handlePollStarted);
      off(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
      off(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
      off(SOCKET_EVENTS.STUDENT_KICKED, handleKicked);
      off(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);
    };
  }, [socket, on, off]);

  // Join room when student is registered
  useEffect(() => {
    if (isConnected && student) {
      emit(SOCKET_EVENTS.STUDENT_JOIN, {
        studentId: student.id,
        sessionId,
        studentName: student.name,
      });
    }
  }, [isConnected, student, sessionId, emit]);

  const handleNameSubmit = async (name: string) => {
    try {
      setIsSubmitting(true);
      const newStudent = await studentApi.register({ name, session_id: sessionId });
      setStudent(newStudent);
      setScreen('waiting');
      toast.success('Welcome to the poll!');
    } catch {
      toast.error('Failed to join. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!pollState.selectedOptionId || !student || !pollState.currentPoll) return;

    try {
      setIsSubmitting(true);
      await voteApi.submit(
        pollState.currentPoll.id,
        pollState.selectedOptionId,
        student.id
      );
      markVoted();
      toast.success('Vote submitted!');
    } catch {
      toast.error('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!student) return;
    emit(SOCKET_EVENTS.CHAT_SEND, {
      senderId: student.id,
      senderName: student.name,
      senderType: 'student',
      content,
    });
  };

  const handleRejoin = () => {
    clearStudent();
    setScreen('name-entry');
  };

  const handleNextPoll = () => {
    clearPoll();
    setScreen('waiting');
  };

  // Render screens
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (screen === 'kicked') {
    return <KickedMessage onRejoin={handleRejoin} />;
  }

  if (screen === 'name-entry') {
    return <NameEntry onSubmit={handleNameSubmit} isLoading={isSubmitting} />;
  }

  if (screen === 'waiting') {
    return (
      <>
        <WaitingRoom studentName={student?.name || 'Student'} />
        <ChatPanel
          messages={messages}
          currentUserId={student?.id}
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
        />
      </>
    );
  }

  if (screen === 'poll' && pollState.currentPoll) {
    return (
      <>
        <PollView
          poll={pollState.currentPoll}
          options={pollState.options}
          remainingTime={remainingTime}
          hasVoted={pollState.hasVoted}
          selectedOptionId={pollState.selectedOptionId}
          onSelectOption={selectOption}
          onSubmitVote={handleVoteSubmit}
          isSubmitting={isSubmitting}
        />
        <ChatPanel
          messages={messages}
          currentUserId={student?.id}
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
        />
      </>
    );
  }

  if (screen === 'results' && pollState.currentPoll && pollState.results) {
    return (
      <>
        <ResultsView
          poll={pollState.currentPoll}
          options={pollState.options}
          results={pollState.results}
          selectedOptionId={pollState.selectedOptionId}
          onNextPoll={handleNextPoll}
        />
        <ChatPanel
          messages={messages}
          currentUserId={student?.id}
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
        />
      </>
    );
  }

  return null;
};
