import { Server, Socket } from 'socket.io';
import { studentService } from '../services/student.service';

export const studentHandler = (io: Server, socket: Socket) => {
  socket.on('student:join', async (data, callback) => {
    try {
      const student = await studentService.registerStudent({
        name: data.name,
        session_id: data.sessionId,
      });

      await studentService.updateSocketId(student.id, socket.id);
      io.emit('student:joined', { student });
      callback?.({ success: true, data: student });
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
      console.error('Error setting student offline:', err);
    }
  });

  socket.on('state:request', async (callback) => {
    try {
      const { pollService } = await import('../services/poll.service');
      const { voteService } = await import('../services/vote.service');
      const { timerService } = await import('../services/timer.service');

      const activePoll = await pollService.getActivePoll();
      let results = null;
      let remainingTime = 0;

      if (activePoll) {
        results = await voteService.getPollResults(activePoll.id);
        remainingTime = timerService.getRemainingTime();
      }

      callback?.({
        success: true,
        data: { activePoll, results, remainingTime },
      });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });
};
