import { query } from '../config/database';
import { Poll, PollStatus, CreatePollDTO, PollWithOptions, Option } from '../types/poll.types';

export class PollModel {

  static async create(data: CreatePollDTO): Promise<PollWithOptions> {
    const client = await (await import('../config/database')).getClient();

    try {
      await client.query('BEGIN');

      // insert poll
      const pollResult = await client.query(
        `INSERT INTO polls (question, duration, status)
         VALUES ($1, $2, 'pending')
         RETURNING *`,
        [data.question, data.duration || 60]
      );

      const poll = pollResult.rows[0];

      // insert options
      const opts: Option[] = [];
      for (let i = 0; i < data.options.length; i++) {
        const optResult = await client.query(
          `INSERT INTO options (poll_id, text, display_order)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [poll.id, data.options[i], i]
        );
        opts.push(optResult.rows[0]);
      }

      await client.query('COMMIT');

      return { ...poll, options: opts };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<Poll | null> {
    const result = await query('SELECT * FROM polls WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByIdWithOptions(id: string): Promise<PollWithOptions | null> {
    const pollResult = await query('SELECT * FROM polls WHERE id = $1', [id]);
    if (pollResult.rows.length === 0) return null;

    const poll = pollResult.rows[0];
    const optionsResult = await query(
      'SELECT * FROM options WHERE poll_id = $1 ORDER BY display_order',
      [id]
    );

    return { ...poll, options: optionsResult.rows };
  }

  static async findAll(): Promise<Poll[]> {
    const result = await query('SELECT * FROM polls ORDER BY created_at DESC');
    return result.rows;
  }

  static async findActive(): Promise<PollWithOptions | null> {
    const result = await query(
      "SELECT * FROM polls WHERE status = 'active' LIMIT 1"
    );

    if (result.rows.length === 0) return null;

    const poll = result.rows[0];
    const optionsResult = await query(
      'SELECT * FROM options WHERE poll_id = $1 ORDER BY display_order',
      [poll.id]
    );

    return { ...poll, options: optionsResult.rows };
  }

  static async updateStatus(id: string, status: PollStatus): Promise<Poll | null> {
    let queryText = 'UPDATE polls SET status = $2';
    const params: any[] = [id, status];

    if (status === 'active') {
      queryText += ', started_at = CURRENT_TIMESTAMP';
    } else if (status === 'completed') {
      queryText += ', ended_at = CURRENT_TIMESTAMP';
    }

    queryText += ' WHERE id = $1 RETURNING *';

    const result = await query(queryText, params);
    return result.rows[0] || null;
  }

  static async hasActivePoll(): Promise<boolean> {
    const result = await query(
      "SELECT COUNT(*) as count FROM polls WHERE status = 'active'"
    );
    return parseInt(result.rows[0].count, 10) > 0;
  }

  static async getHistory(): Promise<Poll[]> {
    const result = await query(
      "SELECT * FROM polls WHERE status = 'completed' ORDER BY ended_at DESC"
    );
    return result.rows;
  }
}

export default PollModel;
