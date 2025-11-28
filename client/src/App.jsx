import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './components/ToastContainer';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExamList from './pages/ExamList';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateExam from './pages/CreateExam';
import ExamLauncher from './pages/ExamLauncher';
import ExamRunner from './pages/ExamRunner';
import Results from './pages/Results';
import ExamResults from './pages/ExamResults';
import AllAttempts from './pages/AllAttempts';
import ProctoringViewer from './pages/ProctoringViewer';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function StudentOnlyRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect instructors and admins to their dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  if (user?.role === 'instructor') {
    return <Navigate to="/instructor" />;
  }

  return children;
}

function RoleBasedRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect based on user role
  if (user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  if (user?.role === 'instructor') {
    return <Navigate to="/instructor" />;
  }

  return <Navigate to="/exams" />;
}

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/exams"
        element={
          <StudentOnlyRoute>
            <ExamList />
          </StudentOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <StudentOnlyRoute>
            <Dashboard />
          </StudentOnlyRoute>
        }
      />
      <Route
        path="/exams/:examId/start"
        element={
          <StudentOnlyRoute>
            <ExamLauncher />
          </StudentOnlyRoute>
        }
      />
      <Route
        path="/attempts/:attemptId"
        element={
          <StudentOnlyRoute>
            <ExamRunner />
          </StudentOnlyRoute>
        }
      />
      <Route
        path="/attempts/:attemptId/results"
        element={
          <StudentOnlyRoute>
            <Results />
          </StudentOnlyRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <PrivateRoute>
            <InstructorDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <InstructorDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/create-exam"
        element={
          <PrivateRoute>
            <CreateExam />
          </PrivateRoute>
        }
      />
      <Route
        path="/exams/:examId/results"
        element={
          <PrivateRoute>
            <ExamResults />
          </PrivateRoute>
        }
      />
      <Route
        path="/all-attempts"
        element={
          <PrivateRoute>
            <AllAttempts />
          </PrivateRoute>
        }
      />
      <Route
        path="/proctoring/:attemptId"
        element={
          <PrivateRoute>
            <ProctoringViewer />
          </PrivateRoute>
        }
      />
        <Route path="/" element={<RoleBasedRedirect />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col">
              <div className="flex-grow">
                <AppRoutes />
              </div>
              <Footer />
            </div>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
