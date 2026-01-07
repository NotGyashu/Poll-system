import { VoteModel } from '../models/vote.model';
import { PollModel } from '../models/poll.model';
import { OptionModel } from '../models/option.model';
import { CreateVoteDTO, Vote, PollResults } from '../types/vote.types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class VoteService {
  // submit a vote
  async submitVote(data: CreateVoteDTO): Promise<Vote> {
    // check if poll exists and is active
    const poll = await PollModel.findById(data.poll_id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (poll.status !== 'active') {
      throw new BadRequestError('Poll is not active');
    }

    // check if option belongs to this poll
    const optionValid = await OptionModel.belongsToPoll(data.option_id, data.poll_id);
    if (!optionValid) {
      throw new BadRequestError('Invalid option for this poll');
    }

    // check if student already voted
    const alreadyVoted = await VoteModel.hasVoted(data.poll_id, data.student_id);
    if (alreadyVoted) {
      throw new BadRequestError('You have already voted on this poll');
    }

    // create vote
    const vote = await VoteModel.create(data);
    return vote;
  }

  // check if student has voted
  async hasVoted(pollId: string, studentId: string): Promise<boolean> {
    return VoteModel.hasVoted(pollId, studentId);
  }

  // get student's vote for a poll
  async getStudentVote(pollId: string, studentId: string): Promise<Vote | null> {
    return VoteModel.findByStudentAndPoll(pollId, studentId);
  }

  // get vote counts for a poll
  async getVoteCounts(pollId: string): Promise<any[]> {
    const poll = await PollModel.findById(pollId);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }
    return VoteModel.getVoteCounts(pollId);
  }

  // get full poll results
  async getPollResults(pollId: string): Promise<PollResults> {
    const results = await VoteModel.getPollResults(pollId);
    if (!results) {
      throw new NotFoundError('Poll not found');
    }
    return results;
  }

  // get total votes for a poll
  async getTotalVotes(pollId: string): Promise<number> {
    return VoteModel.getTotalVotes(pollId);
  }
}

export const voteService = new VoteService();
