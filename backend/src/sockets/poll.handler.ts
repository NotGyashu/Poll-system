import { Server, Socket } from 'socket.io';
import { pollService } from '../services/poll.service';
import { voteService } from '../services/vote.service';
import { timerService } from '../services/timer.service';

export const pollHandler = (io: Server, socket: Socket) => {
  socket.on('poll:create', async (data, callback) => {
    try {
      const poll = await pollService.createPoll(data);
      io.emit('poll:created', poll);
      callback?.({ success: true, data: poll });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('poll:start', async (data, callback) => {
    try {
      const poll = await pollService.startPoll(data.pollId);
      timerService.startTimer(poll);
      
      const remainingTime = timerService.getRemainingTime();
      io.emit('poll:started', { poll, remainingTime });
      callback?.({ success: true, data: poll });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('poll:end', async (data, callback) => {
    try {
      const poll = await pollService.endPoll(data.pollId);
      timerService.stopTimer();
      
      const results = await voteService.getPollResults(data.pollId);
      io.emit('poll:ended', { pollId: data.pollId, results });
      callback?.({ success: true, data: poll });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('poll:get-active', async (callback) => {
    try {
      const poll = await pollService.getActivePoll();
      const remainingTime = timerService.getRemainingTime();
      callback?.({ success: true, data: { poll, remainingTime } });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });
};
