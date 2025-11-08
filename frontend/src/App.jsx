import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './components/home/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/common/Navbar';
import StudentDashboard from './components/dashboards/StudentDashboard';
import FacultyDashboard from './components/dashboards/FacultyDashboard';
import TakeAssessment from './components/assessment/TakeAssessment';
import AssessmentsPage from './components/assessment/AssessmentsPage';
import ResultDetails from './components/assessment/ResultDetails';
import AIChat from './components/ai/AIChat';
import CoursesPage from './components/courses/CoursesPage';
import CourseDetails from './components/courses/CourseDetails';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import './App.css';

// Dashboard Router component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'admin':
      return <FacultyDashboard />; // Can create separate AdminDashboard later
    default:
      return <Navigate to="/login" />;
  }
};

// Layout wrapper with Navbar
const LayoutWithNavbar = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="page-transition">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LayoutWithNavbar>
                  <DashboardRouter />
                </LayoutWithNavbar>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/assessments/:id/take"
            element={
              <ProtectedRoute>
                <TakeAssessment />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/ai-chat"
            element={
              <ProtectedRoute>
                <LayoutWithNavbar>
                  <AIChat />
                </LayoutWithNavbar>
              </ProtectedRoute>
            }
          />
          
          {/* Feature Pages */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <LayoutWithNavbar>
                  <CoursesPage />
                </LayoutWithNavbar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <LayoutWithNavbar>
                  <CourseDetails />
                </LayoutWithNavbar>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <LayoutWithNavbar>
                  <AssessmentsPage />
                </LayoutWithNavbar>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <LayoutWithNavbar>
                  <AnalyticsPage />
                </LayoutWithNavbar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <LayoutWithNavbar>
                  <ResultDetails />
                </LayoutWithNavbar>
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
