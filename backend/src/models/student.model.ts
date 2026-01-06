import { query } from '../config/database';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../types/student.types';

export class StudentModel {
 
  static async create(data: CreateStudentDTO): Promise<Student> {
    const result = await query<Student>(
      `INSERT INTO students (name, session_id)
       VALUES ($1, $2)
       RETURNING *`,
      [data.name, data.session_id]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Student | null> {
    const result = await query<Student>('SELECT * FROM students WHERE id = $1', [id]);
    return result.rows[0] || null;
  }


  static async findBySessionId(sessionId: string): Promise<Student | null> {
    const result = await query<Student>('SELECT * FROM students WHERE session_id = $1', [
      sessionId,
    ]);
    return result.rows[0] || null;
  }

 
  static async findBySocketId(socketId: string): Promise<Student | null> {
    const result = await query<Student>('SELECT * FROM students WHERE socket_id = $1', [socketId]);
    return result.rows[0] || null;
  }

  static async findOrCreate(data: CreateStudentDTO): Promise<Student> {
    const existing = await this.findBySessionId(data.session_id);
    if (existing) {
      return existing;
    }
    return this.create(data);
  }

  
  static async update(id: string, data: UpdateStudentDTO): Promise<Student | null> {
    const updates: string[] = [];
    const params: unknown[] = [id];
    let paramIndex = 2;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.socket_id !== undefined) {
      updates.push(`socket_id = $${paramIndex++}`);
      params.push(data.socket_id);
    }
    if (data.is_online !== undefined) {
      updates.push(`is_online = $${paramIndex++}`);
      params.push(data.is_online);
    }

    if (updates.length === 0) return this.findById(id);

    const result = await query<Student>(
      `UPDATE students SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    return result.rows[0] || null;
  }

 
  static async updateSocketId(id: string, socketId: string | null): Promise<Student | null> {
    const result = await query<Student>(
      `UPDATE students SET socket_id = $2, is_online = $3 WHERE id = $1 RETURNING *`,
      [id, socketId, socketId !== null]
    );
    return result.rows[0] || null;
  }

  
  static async setOffline(id: string): Promise<void> {
    await query('UPDATE students SET socket_id = NULL, is_online = false WHERE id = $1', [id]);
  }

  
  static async setOfflineBySocketId(socketId: string): Promise<void> {
    await query('UPDATE students SET socket_id = NULL, is_online = false WHERE socket_id = $1', [
      socketId,
    ]);
  }

  
  static async getOnlineStudents(): Promise<Student[]> {
    const result = await query<Student>('SELECT * FROM students WHERE is_online = true');
    return result.rows;
  }

  
  static async findAll(): Promise<Student[]> {
    const result = await query<Student>('SELECT * FROM students ORDER BY created_at DESC');
    return result.rows;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM students WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async countOnline(): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM students WHERE is_online = true'
    );
    return parseInt(result.rows[0].count, 10);
  }
}

export default StudentModel;
