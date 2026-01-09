import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { AppProvider } from './contexts';
import { StudentPage, TeacherPage } from './pages';
import { ErrorBoundary, IntervueBadge, Button } from './components/shared';

function HomePage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'student') {
      navigate('/student');
    } else if (selectedRole === 'teacher') {
      navigate('/teacher');
    }
  };

  return (
    <div className="min-h-screen  bg-white flex items-center justify-center">
      <div className=" flex flex-col gap-4 text-center lg:w-[50vw] w-[90vw]">
        <div>
          <IntervueBadge />
        </div>
        <span className="text-3xl text-gray-800 mb-2">
          Welcome to the <b>Live Polling System</b>

          <p className="text-gray-500 text-base">
          Please select the role that best describes you to begin using the live polling system
        </p>
        </span>
        
        
        <div className="grid grid-cols-2 gap-4 my-4">
          {/* Student Card */}
          <button
            onClick={() => setSelectedRole('student')}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              selectedRole === 'student'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
           
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              I'm a Student
            </h3>
            <p className="text-sm text-gray-500">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => setSelectedRole('teacher')}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              selectedRole === 'teacher'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
           
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              I'm a Teacher
            </h3>
            <p className="text-sm text-gray-500">
              Submit answers and view live poll results in real-time.
            </p>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedRole}
          className=" inline-flex items-center justify-center w-fit mx-auto px-14 py-2"
           
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <div className="min-h-screen bg-white">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/teacher" element={<TeacherPage />} />
              <Route path="/student" element={<StudentPage />} />
            </Routes>
          </div>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
