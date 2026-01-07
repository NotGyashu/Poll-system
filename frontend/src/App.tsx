import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts';
import { StudentPage, TeacherPage } from './pages';

function HomePage() {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Poll System</h1>
        <p className="text-gray-600 mb-8">Real-time classroom polling</p>
        
        <div className="space-y-4">
          <Link
            to="/teacher"
            className="block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            I'm a Teacher
          </Link>
          <Link
            to="/student"
            className="block w-full py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors"
          >
            I'm a Student
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-bg-light">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teacher" element={<TeacherPage />} />
            <Route path="/student" element={<StudentPage />} />
          </Routes>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
