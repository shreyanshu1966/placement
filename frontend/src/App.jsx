import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseCreate from './pages/CourseCreate';
import AssignmentGenerate from './pages/AssignmentGenerate';
import AssessmentCreator from './pages/AssessmentCreator';
import Assignment from './pages/Assignment';
import Test from './pages/Test';
import Results from './pages/Results';
import Analytics from './pages/Analytics';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/create" element={<CourseCreate />} />
            <Route path="/generate-assignment" element={<AssignmentGenerate />} />
            <Route path="/create-assessment" element={<AssessmentCreator />} />
            <Route path="/assignment/:id" element={<Assignment />} />
            <Route path="/test/:id" element={<Test />} />
            <Route path="/results" element={<Results />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
