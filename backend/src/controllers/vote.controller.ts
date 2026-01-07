import { Request, Response } from 'express';
import { voteService } from '../services/vote.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const submitVote = asyncHandler(async (req: Request, res: Response) => {
  const { poll_id, option_id, student_id } = req.body;
  const vote = await voteService.submitVote({ poll_id, option_id, student_id });
  res.status(201).json({ success: true, data: vote });
});

export const getPollResults = asyncHandler(async (req: Request, res: Response) => {
  const results = await voteService.getPollResults(req.params.id);
  res.json({ success: true, data: results });
});

export const checkVoted = asyncHandler(async (req: Request, res: Response) => {
  const { poll_id, student_id } = req.query;
  const hasVoted = await voteService.hasVoted(poll_id as string, student_id as string);
  res.json({ success: true, data: { hasVoted } });
});
