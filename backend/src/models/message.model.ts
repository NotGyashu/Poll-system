import { pool } from '../config/database';
import { Message, CreateMessageDTO } from '../types/chat.types';

export class MessageModel {
  static async create(data: CreateMessageDTO): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, sender_name, sender_type, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.sender_id || null, data.sender_name, data.sender_type, data.content]
    );
    return result.rows[0];
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<Message[]> {
    const result = await pool.query(
      `SELECT * FROM messages
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows.reverse();
  }

  static async findById(id: string): Promise<Message | null> {
    const result = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  static async clearAll(): Promise<void> {
    await pool.query('DELETE FROM messages');
  }
}
