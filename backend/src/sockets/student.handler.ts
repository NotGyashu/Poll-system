import { Server, Socket } from 'socket.io';
import { studentService } from '../services/student.service';
import { stateService } from '../services/state.service';

export const studentHandler = (io: Server, socket: Socket) => {
  socket.on('student:join', async (data, callback) => {
    try {
      const student = await studentService.registerStudent({
        name: data.name,
        session_id: data.sessionId,
      });

      await studentService.updateSocketId(student.id, socket.id);
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
        await studentService.updateSocketId(student.id, socket.id);
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
