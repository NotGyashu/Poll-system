import { query } from '../config/database';
import { Option } from '../types/poll.types';

export class OptionModel {

  static async findById(id: string): Promise<Option | null> {
    const result = await query('SELECT * FROM options WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByPollId(pollId: string): Promise<Option[]> {
    const result = await query(
      'SELECT * FROM options WHERE poll_id = $1 ORDER BY display_order',
      [pollId]
    );
    return result.rows;
  }

  static async create(pollId: string, text: string, order: number, isCorrect: boolean = false): Promise<Option> {
    const result = await query(
      `INSERT INTO options (poll_id, text, display_order, is_correct)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [pollId, text, order, isCorrect]
    );
    return result.rows[0];
  }

  static async deleteByPollId(pollId: string): Promise<void> {
    await query('DELETE FROM options WHERE poll_id = $1', [pollId]);
  }

  static async belongsToPoll(optionId: string, pollId: string): Promise<boolean> {
    const result = await query(
      'SELECT COUNT(*) as count FROM options WHERE id = $1 AND poll_id = $2',
      [optionId, pollId]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  }
}

export default OptionModel;
