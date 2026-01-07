import type { Student } from '../../types';

interface StudentListProps {
  students: Student[];
  onKickStudent: (studentId: string) => void;
}

export const StudentList = ({ students, onKickStudent }: StudentListProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Students</h2>
        <span className="text-sm text-gray-600">
          {students.length} connected
        </span>
      </div>

      {students.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No students connected yet
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-800">{student.name}</span>
              </div>
              <button
                onClick={() => onKickStudent(student.id)}
                className="text-gray-400 hover:text-timer-red transition-colors px-2 py-1 rounded hover:bg-red-50"
                title="Remove student"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
