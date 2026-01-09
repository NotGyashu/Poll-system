import { Server, Socket } from 'socket.io';
import { studentService } from '../services/student.service';
import { stateService } from '../services/state.service';
import { presenceManager } from '../services/presence.service';

export const studentHandler = (io: Server, socket: Socket) => {
  socket.on('student:join', async (data, callback) => {
    try {
      const student = await studentService.registerStudent({
        name: data.name,
        session_id: data.sessionId,
      });

      // Add to presence manager (socket-based tracking)
      presenceManager.addUser(student, socket.id);
      
      const state = await stateService.getStudentState(student.id, null);

      io.emit('student:joined', { student });
      
      callback?.({
        success: true,
        data: { ...state, student },
      });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('student:reconnect', async (data, callback) => {
    try {
      const student = await studentService.getStudentBySessionId(data.sessionId);
      
      if (student) {
        // Add to presence manager (handles multi-tab)
        presenceManager.addUser(student, socket.id);
        
        const state = await stateService.getStudentState(student.id, null);
        
        callback?.({
          success: true,
          data: { ...state, student },
        });
      } else {
        callback?.({ success: false, error: 'Student not found' });
      }
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('student:leave', async (data, callback) => {
    try {
      // Remove from presence manager
      presenceManager.removeUser(data.studentId);
      io.emit('student:left', { studentId: data.studentId });
      callback?.({ success: true });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('disconnect', async () => {
    try {
      // Remove socket from presence (handles multi-tab gracefully)
      await presenceManager.removeSocket(socket.id);
    } catch (err) {
      console.error('Error on disconnect:', err);
    }
  });

  socket.on('state:request', async (data, callback) => {
    try {
      const state = await stateService.getStudentState(
        data?.studentId || null,
        data?.sessionId || null
      );
      callback?.({ success: true, data: state });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('teacher:state', async (callback) => {
    try {
      const state = await stateService.getTeacherState();
      callback?.({ success: true, data: state });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });
};
