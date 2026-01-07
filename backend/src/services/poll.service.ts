import { PollModel } from '../models/poll.model';
import { OptionModel } from '../models/option.model';
import { CreatePollDTO, Poll, PollWithOptions } from '../types/poll.types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { config } from '../config';

export class PollService {
  // create a new poll
  async createPoll(data: CreatePollDTO): Promise<PollWithOptions> {
    // validate options
    if (!data.options || data.options.length < 2) {
      throw new BadRequestError('Poll must have at least 2 options');
    }

    // validate duration
    const duration = data.duration || config.poll.defaultDuration;
    if (duration < config.poll.minDuration || duration > config.poll.maxDuration) {
      throw new BadRequestError(
        `Duration must be between ${config.poll.minDuration} and ${config.poll.maxDuration} seconds`
      );
    }

    const poll = await PollModel.create({
      ...data,
      duration,
    });

    return poll;
  }

  // get poll by id
  async getPollById(id: string): Promise<PollWithOptions> {
    const poll = await PollModel.findByIdWithOptions(id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }
    return poll;
  }

  // get all polls
  async getAllPolls(): Promise<Poll[]> {
    return PollModel.findAll();
  }

  // get active poll
  async getActivePoll(): Promise<PollWithOptions | null> {
    return PollModel.findActive();
  }

  // start a poll
  async startPoll(id: string): Promise<PollWithOptions> {
    // check if poll exists
    const poll = await PollModel.findByIdWithOptions(id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    // check if poll is already active or completed
    if (poll.status !== 'pending') {
      throw new BadRequestError('Poll is already started or completed');
    }

    // check if another poll is active
    const hasActive = await PollModel.hasActivePoll();
    if (hasActive) {
      throw new BadRequestError('Another poll is already active');
    }

    // update poll status
    await PollModel.updateStatus(id, 'active');
    
    const updatedPoll = await PollModel.findByIdWithOptions(id);
    return updatedPoll!;
  }

  // end a poll
  async endPoll(id: string): Promise<Poll> {
    const poll = await PollModel.findById(id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (poll.status !== 'active') {
      throw new BadRequestError('Poll is not active');
    }

    const updatedPoll = await PollModel.updateStatus(id, 'completed');
    return updatedPoll!;
  }

  // get poll history
  async getPollHistory(): Promise<Poll[]> {
    return PollModel.getHistory();
  }

  // check if there is an active poll
  async hasActivePoll(): Promise<boolean> {
    return PollModel.hasActivePoll();
  }

  // get options for a poll
  async getPollOptions(pollId: string): Promise<any[]> {
    const poll = await PollModel.findById(pollId);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }
    return OptionModel.findByPollId(pollId);
  }
}

export const pollService = new PollService();
