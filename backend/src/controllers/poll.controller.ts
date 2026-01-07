import { Request, Response } from 'express';
import { pollService } from '../services/poll.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const createPoll = asyncHandler(async (req: Request, res: Response) => {
  const { question, options, duration } = req.body;
  const poll = await pollService.createPoll({ question, options, duration });
  res.status(201).json({ success: true, data: poll });
});

export const getAllPolls = asyncHandler(async (_req: Request, res: Response) => {
  const polls = await pollService.getAllPolls();
  res.json({ success: true, data: polls });
});

export const getPollById = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.getPollById(req.params.id);
  res.json({ success: true, data: poll });
});

export const getActivePoll = asyncHandler(async (_req: Request, res: Response) => {
  const poll = await pollService.getActivePoll();
  res.json({ success: true, data: poll });
});

export const startPoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.startPoll(req.params.id);
  res.json({ success: true, data: poll });
});

export const endPoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.endPoll(req.params.id);
  res.json({ success: true, data: poll });
});

export const getPollHistory = asyncHandler(async (_req: Request, res: Response) => {
  const polls = await pollService.getPollHistory();
  res.json({ success: true, data: polls });
});
