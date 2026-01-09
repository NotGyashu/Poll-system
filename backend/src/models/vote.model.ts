import { query } from '../config/database';
import { Vote, CreateVoteDTO, OptionResult, PollResults } from '../types/vote.types';

export class VoteModel {

  static async create(data: CreateVoteDTO): Promise<Vote> {
    const result = await query(
      `INSERT INTO votes (poll_id, option_id, student_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.poll_id, data.option_id, data.student_id]
    );
    return result.rows[0];
  }

  static async hasVoted(pollId: string, studentId: string): Promise<boolean> {
    const result = await query(
      'SELECT COUNT(*) as count FROM votes WHERE poll_id = $1 AND student_id = $2',
      [pollId, studentId]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  }

  static async findByStudentAndPoll(pollId: string, studentId: string): Promise<Vote | null> {
    const result = await query(
      'SELECT * FROM votes WHERE poll_id = $1 AND student_id = $2',
      [pollId, studentId]
    );
    return result.rows[0] || null;
  }

  static async getVoteCounts(pollId: string): Promise<OptionResult[]> {
    const result = await query(
      `SELECT 
        o.id as option_id,
        o.text as option_text,
        o.is_correct,
        COUNT(v.id)::text as vote_count
       FROM options o
       LEFT JOIN votes v ON o.id = v.option_id
       WHERE o.poll_id = $1
       GROUP BY o.id, o.text, o.is_correct, o.display_order
       ORDER BY o.display_order`,
      [pollId]
    );

    let total = 0;
    for (const row of result.rows) {
      total += parseInt(row.vote_count, 10);
    }

    return result.rows.map((row: any) => ({
      option_id: row.option_id,
      option_text: row.option_text,
      vote_count: parseInt(row.vote_count, 10),
      percentage: total > 0 ? Math.round((parseInt(row.vote_count, 10) / total) * 100) : 0,
      is_correct: row.is_correct,
    }));
  }

  static async getPollResults(pollId: string): Promise<PollResults | null> {
    const pollResult = await query(
      'SELECT id, question FROM polls WHERE id = $1',
      [pollId]
    );

    if (pollResult.rows.length === 0) return null;

    const poll = pollResult.rows[0];
    const options = await this.getVoteCounts(pollId);
    
    let totalVotes = 0;
    for (const opt of options) {
      totalVotes += opt.vote_count;
    }

    return {
      poll_id: poll.id,
      question: poll.question,
      total_votes: totalVotes,
      options,
    };
  }

  static async getTotalVotes(pollId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM votes WHERE poll_id = $1',
      [pollId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  static async deleteByPollId(pollId: string): Promise<void> {
    await query('DELETE FROM votes WHERE poll_id = $1', [pollId]);
  }
}

export default VoteModel;
