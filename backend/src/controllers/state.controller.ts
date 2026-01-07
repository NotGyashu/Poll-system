import { Request, Response } from 'express';
import { pollService } from '../services/poll.service';
import { voteService } from '../services/vote.service';
import { timerService } from '../services/timer.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getCurrentState = asyncHandler(async (_req: Request, res: Response) => {
  const activePoll = await pollService.getActivePoll();
  
  let results = null;
  let remainingTime = 0;

  if (activePoll) {
    results = await voteService.getPollResults(activePoll.id);
    remainingTime = timerService.getRemainingTime();
  }

  res.json({
    success: true,
    data: {
      activePoll,
      results,
      remainingTime,
    },
  });
});
