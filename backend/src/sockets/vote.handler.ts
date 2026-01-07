import { Server, Socket } from 'socket.io';
import { voteService } from '../services/vote.service';

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
      callback?.({ success: true, data: vote });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
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
