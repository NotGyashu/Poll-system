import { Server, Socket } from 'socket.io';
import { voteService } from '../services/vote.service';
import { studentService } from '../services/student.service';
import { pollService } from '../services/poll.service';
import { timerService } from '../services/timer.service';

export const voteHandler = (io: Server, socket: Socket) => {
  socket.on('vote:submit', async (data, callback) => {
    try {
      const vote = await voteService.submitVote({
        poll_id: data.pollId,
        option_id: data.optionId,
        student_id: data.studentId,
      });

      const results = await voteService.getPollResults(data.pollId);
      io.emit('vote:update', { pollId: data.pollId, results });

      // Check if all online students have voted
      let totalVotes = 0;
      let onlineStudents = 0;
      try {
        totalVotes = await voteService.getTotalVotes(data.pollId);
        onlineStudents = await studentService.countOnlineStudents();
      } catch (dbErr: any) {
        console.error('Database error during vote count:', dbErr);
        callback?.({ success: false, error: 'Database connection error. Please try again later.' });
        return;
      }

      // If all online students have voted, auto-end the poll
      if (onlineStudents > 0 && totalVotes >= onlineStudents) {
        console.log(`All ${onlineStudents} students voted. Auto-ending poll ${data.pollId}`);

        io.emit('timer:tick', { remainingTime: 0 });
        try {
          const endedPoll = await pollService.endPoll(data.pollId);
          timerService.stopTimer();
          io.emit('poll:ended', { poll: endedPoll, results });
        } catch (endErr: any) {
          console.error('Error ending poll:', endErr);
          io.emit('poll:end-error', { pollId: data.pollId, error: 'Failed to end poll due to server error.' });
        }
      }

      callback?.({ success: true, data: vote });
    } catch (err: any) {
      console.error('Vote submission error:', err);
      if (err.code === 'ECONNREFUSED' || err.message?.includes('connect')) {
        callback?.({ success: false, error: 'Database connection error. Please try again later.' });
      } else {
        callback?.({ success: false, error: err.message || 'Unknown error occurred.' });
      }
    }
  });

  socket.on('vote:get-results', async (data, callback) => {
    try {
      const results = await voteService.getPollResults(data.pollId);
      callback?.({ success: true, data: results });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('vote:check', async (data, callback) => {
    try {
      const hasVoted = await voteService.hasVoted(data.pollId, data.studentId);
      callback?.({ success: true, data: { hasVoted } });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });
};
