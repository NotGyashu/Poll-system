import { pollService } from './poll.service';
import { voteService } from './vote.service';
import { studentService } from './student.service';
import { timerService } from './timer.service';

export interface CurrentState {
  activePoll: any;
  results: any;
  remainingTime: number;
  hasVoted: boolean;
  student: any;
}

export class StateService {
  async getStudentState(studentId: string | null, sessionId: string | null): Promise<CurrentState> {
    const activePoll = await pollService.getActivePoll();
    let results = null;
    let remainingTime = 0;
    let hasVoted = false;
    let student = null;

    if (sessionId) {
      student = await studentService.getStudentBySessionId(sessionId);
    }

    if (activePoll) {
      results = await voteService.getPollResults(activePoll.id);
      remainingTime = timerService.getRemainingTime();

      const id = studentId || student?.id;
      if (id) {
        hasVoted = await voteService.hasVoted(activePoll.id, id);
      }
    }

    return {
      activePoll,
      results,
      remainingTime,
      hasVoted,
      student,
    };
  }

  async getTeacherState(): Promise<any> {
    const activePoll = await pollService.getActivePoll();
    let results = null;
    let remainingTime = 0;

    if (activePoll) {
      results = await voteService.getPollResults(activePoll.id);
      remainingTime = timerService.getRemainingTime();
    }

    const onlineStudents = await studentService.getOnlineStudents();
    const pollHistory = await pollService.getPollHistory();

    return {
      activePoll,
      results,
      remainingTime,
      onlineStudents,
      pollHistory,
    };
  }
}

export const stateService = new StateService();
