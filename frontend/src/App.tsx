import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-light">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl text-primary">Poll System - Coming Soon</h1></div>} />
          <Route path="/teacher" element={<div>Teacher Page</div>} />
          <Route path="/student" element={<div>Student Page</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
