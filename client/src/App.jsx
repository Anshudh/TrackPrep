import React, { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components & Pages
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import Applications from './pages/Applications';
import StudyPlanner from './pages/StudyPlanner';
import { Menu } from 'lucide-react';

// Guard wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-neon-primary" role="status">
          <span className="visually-hidden">Validating login...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main layout for logged-in sessions (Sidebar + Content outlet)
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (val) => {
    setSidebarOpen(val !== undefined ? val : !sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Mobile Header Navigation */}
        <div className="d-md-none d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--card-border)' }}>
          <span className="fs-5 fw-extrabold text-neon-glow">TrackPrep</span>
          <button 
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => toggleSidebar(true)}
          >
            <Menu size={16} />
            <span>Menu</span>
          </button>
        </div>

        {/* Nested Page Outlet */}
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/planner" element={<StudyPlanner />} />
              {/* Redirect fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Root Fallback Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
