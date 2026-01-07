import { Server, Socket } from 'socket.io';
import { studentService } from '../services/student.service';
import { pollService } from '../services/poll.service';
import { voteService } from '../services/vote.service';
import { timerService } from '../services/timer.service';

export const studentHandler = (io: Server, socket: Socket) => {
  socket.on('student:join', async (data, callback) => {
    try {
      const student = await studentService.registerStudent({
        name: data.name,
        session_id: data.sessionId,
      });

      await studentService.updateSocketId(student.id, socket.id);

      const activePoll = await pollService.getActivePoll();
      let results = null;
      let remainingTime = 0;
      let hasVoted = false;

      if (activePoll) {
        results = await voteService.getPollResults(activePoll.id);
        remainingTime = timerService.getRemainingTime();
        hasVoted = await voteService.hasVoted(activePoll.id, student.id);
      }

      io.emit('student:joined', { student });
      
      callback?.({
        success: true,
        data: {
          student,
          activePoll,
          results,
          remainingTime,
          hasVoted,
        },
      });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('student:leave', async (data, callback) => {
    try {
      await studentService.setStudentOffline(data.studentId);
      io.emit('student:left', { studentId: data.studentId });
      callback?.({ success: true });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('disconnect', async () => {
    try {
      await studentService.setStudentOfflineBySocketId(socket.id);
    } catch (err) {
      console.error('Error on disconnect:', err);
    }
  });

  socket.on('state:request', async (data, callback) => {
    try {
      const activePoll = await pollService.getActivePoll();
      let results = null;
      let remainingTime = 0;
      let hasVoted = false;

      if (activePoll) {
        results = await voteService.getPollResults(activePoll.id);
        remainingTime = timerService.getRemainingTime();
        
        if (data?.studentId) {
          hasVoted = await voteService.hasVoted(activePoll.id, data.studentId);
        }
      }

      callback?.({
        success: true,
        data: { activePoll, results, remainingTime, hasVoted },
      });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });
};
