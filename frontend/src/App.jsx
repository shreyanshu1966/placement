import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseCreate from './pages/CourseCreate';
import AssignmentGenerate from './pages/AssignmentGenerate';
import AssessmentCreator from './pages/AssessmentCreator';
import Assignment from './pages/Assignment';
import Test from './pages/Test';
import Results from './pages/Results';
import EnhancedResults from './pages/EnhancedResults';
import Analytics from './pages/Analytics';
import EnhancedAnalytics from './pages/EnhancedAnalytics';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AssignmentManagement from './pages/AssignmentManagement';
import ProctoredTest from './pages/ProctoredTest';
import ProctoringDashboard from './pages/ProctoringDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/courses" element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } />
              
              {/* Faculty-only routes */}
              <Route path="/courses/create" element={
                <ProtectedRoute requiredRole="faculty">
                  <CourseCreate />
                </ProtectedRoute>
              } />
              <Route path="/create-assessment" element={
                <ProtectedRoute requiredRole="faculty">
                  <AssessmentCreator />
                </ProtectedRoute>
              } />
              <Route path="/assignments" element={
                <ProtectedRoute requiredRole="faculty">
                  <AssignmentManagement />
                </ProtectedRoute>
              } />
              <Route path="/faculty-dashboard" element={
                <ProtectedRoute requiredRole="faculty">
                  <FacultyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute requiredRole="faculty">
                  <EnhancedAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/proctoring/:assignmentId" element={
                <ProtectedRoute requiredRole="faculty">
                  <ProctoringDashboard />
                </ProtectedRoute>
              } />
              
              {/* Student-accessible routes */}
              <Route path="/student-dashboard" element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/generate-assignment" element={
                <ProtectedRoute requiredRole="student">
                  <AssignmentGenerate />
                </ProtectedRoute>
              } />
              
              {/* Common protected routes */}
              <Route path="/assignment/:id" element={
                <ProtectedRoute>
                  <Assignment />
                </ProtectedRoute>
              } />
              <Route path="/test/:id" element={
                <ProtectedRoute>
                  <Test />
                </ProtectedRoute>
              } />
              <Route path="/proctored-test/:id" element={
                <ProtectedRoute>
                  <ProctoredTest />
                </ProtectedRoute>
              } />
              <Route path="/results" element={
                <ProtectedRoute>
                  <EnhancedResults />
                </ProtectedRoute>
              } />
              
              {/* Legacy routes for backward compatibility */}
              <Route path="/results-legacy" element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } />
              <Route path="/analytics-legacy" element={
                <ProtectedRoute requiredRole="faculty">
                  <Analytics />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
