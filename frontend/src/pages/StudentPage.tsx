import { useState, useEffect } from 'react';
import { useSocketContext, useStudentContext, useChatContext, usePollContext, SocketProvider } from '../contexts';
import { NameEntry, WaitingRoom, PollView, KickedMessage } from '../components/student';
import { ChatPanel } from '../components/chat';
import { LoadingSpinner } from '../components/shared';
import { LiveResults } from '../components/teacher';
import { studentApi, stateApi } from '../services';
import { SOCKET_EVENTS } from '../utils/constants';
import toast from 'react-hot-toast';
import type { PollWithOptions, PollResults, ChatMessage, Student } from '../types';

type StudentScreen = 'loading' | 'name-entry' | 'waiting' | 'poll' | 'kicked';

const StudentPageContent = () => {
  const { socket, isConnected, emit, on, off } = useSocketContext();
  const { student, sessionId, isRegistered, setStudent, clearStudent } = useStudentContext();
  const { messages, addMessage, clearMessages } = useChatContext();
  const { state: pollState, setPoll, setOptions, setResults, selectOption, markVoted, clearPoll } = usePollContext();

  const [screen, setScreen] = useState<StudentScreen>('loading');
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participants, setParticipants] = useState<Student[]>([]);
  const [isPollEnded, setIsPollEnded] = useState(false);

  // Recover state on mount
  useEffect(() => {
    const recoverState = async () => {
      console.log('[Student] Starting state recovery...', { 
        isRegistered, 
        studentId: student?.id,
        studentName: student?.name,
        sessionId 
      });

      // Always try to recover from backend first using sessionId
      try {
        console.log('[Student] Fetching state from backend...');
        const state = await stateApi.getStudentState(student?.id, sessionId);
        
        console.log('[Student] State recovery response:', { 
          hasStudent: !!state.student, 
          studentName: state.student?.name,
          hasActivePoll: !!state.activePoll 
        });
        
        // If backend recognizes the student, restore their session
        if (state.student) {
          // Restore student to context if not already there
          if (!isRegistered) {
            setStudent(state.student);
          }
          
          // Recover poll state
          if (state.activePoll) {
            setPoll(state.activePoll);
            setOptions(state.activePoll.options);
            setRemainingTime(state.remainingTime);
            
            if (state.hasVoted) {
              markVoted();
              // Restore selected option if available
              if (state.selectedOptionId) {
                selectOption(state.selectedOptionId);
              }
            }
            
          
            if (state.results) {
              setResults(state.results);
            }
            
            // Show poll screen regardless of status - LiveResults component handles both
            setScreen('poll');
          } else {
            // No active poll, go to waiting room
            setScreen('waiting');
          }
        } else {
          // Backend doesn't recognize the student, show name entry
          console.log('[Student] Backend does not recognize student');
          clearStudent();
          setScreen('name-entry');
        }
      } catch (error) {
        // Backend error - show name entry to start fresh
        console.error('[Student] Failed to recover state:', error);
        clearStudent();
        setScreen('name-entry');
      }
    };

    recoverState();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Real-time presence update
    const handleParticipantsUpdate = (data: unknown) => {
      if (screen === 'kicked') return; // Ignore if kicked
      const payload = data as { count: number; participants: Array<{ id: string; name: string; joinedAt: string }> };
      setParticipants(payload.participants.map(p => ({
        id: p.id,
        name: p.name,
        session_id: '',
        is_online: true,
        created_at: p.joinedAt,
      })) as Student[]);
    };

    const handlePollStarted = (data: unknown) => {
      // Ignore if kicked OR not registered
      if (screen === 'kicked' || !isRegistered) return;
      const payload = data as { poll: PollWithOptions; remainingTime: number };
      // Clear previous poll state before starting new poll
      clearPoll();
      setPoll(payload.poll);
      setOptions(payload.poll.options);
      setRemainingTime(payload.remainingTime);
      setIsPollEnded(false);
      setScreen('poll');
    };

    const handleTimerTick = (data: unknown) => {
      // Ignore if kicked OR not registered
      if (screen === 'kicked' || !isRegistered) return;
      const payload = data as { remainingTime: number };
      setRemainingTime(payload.remainingTime);
    };

    const handleVoteUpdate = (data: unknown) => {
      // Ignore if kicked OR not registered
      if (screen === 'kicked' || !isRegistered) return;
      const payload = data as { results: PollResults };
      setResults(payload.results);
    };

    const handlePollEnded = (data: unknown) => {
      // Ignore if kicked OR not registered
      if (screen === 'kicked' || !isRegistered) return;
      const payload = data as { results: PollResults };
      setResults(payload.results);
      setRemainingTime(0); // Set timer to 0 immediately
      setIsPollEnded(true);
      // If student hasn't voted yet, mark as voted so they can see results
      if (!pollState.hasVoted) {
        markVoted();
      }
      // No screen change - student stays on current view
    };

    const handleKicked = () => {
      clearStudent();
      clearPoll();
      clearMessages(); // Clear chat messages
      setScreen('kicked');
      // Disconnect socket when kicked
      if (socket) {
        socket.disconnect();
      }
      toast.error('You have been removed from the session');
    };

    const handleNewMessage = (data: unknown) => {
      if (screen === 'kicked') return; // Ignore if kicked
      const message = data as ChatMessage;
      addMessage(message);
    };

    on(SOCKET_EVENTS.PRESENCE_PARTICIPANTS_UPDATE, handleParticipantsUpdate);
    on(SOCKET_EVENTS.POLL_STARTED, handlePollStarted);
    on(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
    on(SOCKET_EVENTS.VOTE_UPDATE, handleVoteUpdate);
    on(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
    on(SOCKET_EVENTS.STUDENT_KICKED, handleKicked);
    on(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);

    return () => {
      off(SOCKET_EVENTS.PRESENCE_PARTICIPANTS_UPDATE, handleParticipantsUpdate);
      off(SOCKET_EVENTS.POLL_STARTED, handlePollStarted);
      off(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
      off(SOCKET_EVENTS.VOTE_UPDATE, handleVoteUpdate);
      off(SOCKET_EVENTS.POLL_ENDED, handlePollEnded);
      off(SOCKET_EVENTS.STUDENT_KICKED, handleKicked);
      off(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);
    };
  }, [socket, on, off, screen, isRegistered]);

  // Join room when student is registered
  useEffect(() => {
    if (isConnected && student) {
      emit(SOCKET_EVENTS.STUDENT_RECONNECT, {
        sessionId,
      });
    }
  }, [isConnected, student, sessionId, emit]);

  const handleNameSubmit = async (name: string) => {
    try {
      setIsSubmitting(true);
      const newStudent = await studentApi.register({ name, session_id: sessionId });
      setStudent(newStudent);
      
      // Check if there's an active poll after registration
      try {
        const state = await stateApi.getStudentState(newStudent.id, sessionId);
        if (state.activePoll) {
          setPoll(state.activePoll);
          setOptions(state.activePoll.options);
          setRemainingTime(state.remainingTime);
          
          if (state.results) {
            setResults(state.results);
          }
          
          // Show poll screen - LiveResults handles all states
          setScreen('poll');
        } else {
          setScreen('waiting');
        }
      } catch {
        // If state check fails, go to waiting room
        setScreen('waiting');
      }
      
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
      // Use socket to submit vote for real-time updates
      emit(SOCKET_EVENTS.VOTE_SUBMIT, {
        pollId: pollState.currentPoll.id,
        optionId: pollState.selectedOptionId,
        studentId: student.id,
      });
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
          participants={participants}
        />
      </>
    );
  }

  if (screen === 'poll' && pollState.currentPoll) {
    // If student has voted, show them live results like the teacher
    if (pollState.hasVoted) {
      return (
        <>
          <LiveResults
            poll={pollState.currentPoll}
            options={pollState.options}
            results={pollState.results}
            remainingTime={remainingTime}
            showWaitingMessage={isPollEnded}
          />
          <ChatPanel
            messages={messages}
            currentUserId={student?.id}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
            participants={participants}
          />
        </>
      );
    }

    // If student hasn't voted yet, show the voting interface
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
          participants={participants}
        />
      </>
    );
  }

  return null;
};

export const StudentPage = () => {
  return (
    <SocketProvider role="student">
      <StudentPageContent />
    </SocketProvider>
  );
};
