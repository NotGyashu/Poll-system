import { StudentModel } from '../models/student.model';
import { Student, CreateStudentDTO } from '../types/student.types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class StudentService {
  // register a new student or return existing
  async registerStudent(data: CreateStudentDTO): Promise<Student> {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestError('Name is required');
    }

    if (!data.session_id || data.session_id.trim().length === 0) {
      throw new BadRequestError('Session ID is required');
    }

    // find or create student
    const student = await StudentModel.findOrCreate({
      name: data.name.trim(),
      session_id: data.session_id.trim(),
    });

    return student;
  }

  // get student by id
  async getStudentById(id: string): Promise<Student> {
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    return student;
  }

  // get student by session id
  async getStudentBySessionId(sessionId: string): Promise<Student | null> {
    return StudentModel.findBySessionId(sessionId);
  }

  // get all students
  async getAllStudents(): Promise<Student[]> {
    return StudentModel.findAll();
  }

  // get online students
  async getOnlineStudents(): Promise<Student[]> {
    return StudentModel.getOnlineStudents();
  }

  // update student socket connection
  async updateSocketId(studentId: string, socketId: string | null): Promise<Student> {
    const student = await StudentModel.updateSocketId(studentId, socketId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    return student;
  }

  // set student offline
  async setStudentOffline(studentId: string): Promise<void> {
    await StudentModel.setOffline(studentId);
  }

  // set student offline by socket id
  async setStudentOfflineBySocketId(socketId: string): Promise<void> {
    await StudentModel.setOfflineBySocketId(socketId);
  }

  // remove a student (teacher action)
  async removeStudent(id: string): Promise<boolean> {
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    return StudentModel.delete(id);
  }

  // count online students
  async countOnlineStudents(): Promise<number> {
    return StudentModel.countOnline();
  }

  // find student by socket id
  async getStudentBySocketId(socketId: string): Promise<Student | null> {
    return StudentModel.findBySocketId(socketId);
  }
}

export const studentService = new StudentService();
