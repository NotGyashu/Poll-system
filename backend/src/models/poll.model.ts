import { query } from '../config/database';
import { Poll, PollStatus, CreatePollDTO, PollWithOptions, Option } from '../types/poll.types';

export class PollModel {

  static async create(data: CreatePollDTO): Promise<PollWithOptions> {
    const client = await (await import('../config/database')).getClient();

    try {
      await client.query('BEGIN');

      // Insert poll
      const pollResult = await client.query<Poll>(
        `INSERT INTO polls (question, duration, status)
         VALUES ($1, $2, 'pending')
         RETURNING *`,
        [data.question, data.duration || 60]
      );

      const poll = pollResult.rows[0];

      // Insert options
      const options: Option[] = [];
      for (let i = 0; i < data.options.length; i++) {
        const optionResult = await client.query<Option>(
          `INSERT INTO options (poll_id, text, display_order)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [poll.id, data.options[i], i]
        );
        options.push(optionResult.rows[0]);
      }

      await client.query('COMMIT');

      return { ...poll, options };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }


  static async findById(id: string): Promise<Poll | null> {
    const result = await query<Poll>('SELECT * FROM polls WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

 
  static async findByIdWithOptions(id: string): Promise<PollWithOptions | null> {
    const pollResult = await query<Poll>('SELECT * FROM polls WHERE id = $1', [id]);
    if (pollResult.rows.length === 0) return null;

    const poll = pollResult.rows[0];
    const optionsResult = await query<Option>(
      'SELECT * FROM options WHERE poll_id = $1 ORDER BY display_order',
      [id]
    );

    return { ...poll, options: optionsResult.rows };
  }

  
  static async findAll(): Promise<Poll[]> {
    const result = await query<Poll>('SELECT * FROM polls ORDER BY created_at DESC');
    return result.rows;
  }

 
  static async findActive(): Promise<PollWithOptions | null> {
    const result = await query<Poll>(
      "SELECT * FROM polls WHERE status = 'active' LIMIT 1"
    );

    if (result.rows.length === 0) return null;

    const poll = result.rows[0];
    const optionsResult = await query<Option>(
      'SELECT * FROM options WHERE poll_id = $1 ORDER BY display_order',
      [poll.id]
    );

    return { ...poll, options: optionsResult.rows };
  }

  static async updateStatus(id: string, status: PollStatus): Promise<Poll | null> {
    const updates: string[] = ['status = $2'];
    const params: unknown[] = [id, status];

    if (status === 'active') {
      updates.push('started_at = CURRENT_TIMESTAMP');
    } else if (status === 'completed') {
      updates.push('ended_at = CURRENT_TIMESTAMP');
    }

    const result = await query<Poll>(
      `UPDATE polls SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    return result.rows[0] || null;
  }


  static async hasActivePoll(): Promise<boolean> {
    const result = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM polls WHERE status = 'active'"
    );
    return parseInt(result.rows[0].count, 10) > 0;
  }

  static async getHistory(): Promise<Poll[]> {
    const result = await query<Poll>(
      "SELECT * FROM polls WHERE status = 'completed' ORDER BY ended_at DESC"
    );
    return result.rows;
  }
}

export default PollModel;
