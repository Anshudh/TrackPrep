import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Briefcase, CalendarCheck, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleLogin = () => {
    // Redirect direct to express server Google auth route
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleMockLogin = () => {
    // Redirect direct to express server mock auth route
    window.location.href = 'http://localhost:5000/api/auth/mock';
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 text-center mb-5">
          <h1 className="display-4 fw-extrabold mb-3 text-neon-glow" style={{ letterSpacing: '-1.5px' }}>
            Master Your Tech Recruitment
          </h1>
          <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Track practice problems, organize job applications, and build study plans all in one unified, aesthetic platform.
          </p>
        </div>
      </div>

      <div className="row w-100 justify-content-center align-items-stretch g-4">
        {/* Features Column */}
        <div className="col-12 col-md-6 d-flex flex-column gap-3">
          <div className="glass-card p-4 d-flex align-items-start gap-4">
            <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary border border-primary border-opacity-20">
              <Code2 size={28} />
            </div>
            <div>
              <h5 className="text-white mb-1">Problem Tracker</h5>
              <p className="text-muted mb-0 small">Log solved problems from LeetCode, Codeforces, and CodeChef. Filter by topic and difficulty.</p>
            </div>
          </div>

          <div className="glass-card p-4 d-flex align-items-start gap-4">
            <div className="bg-info bg-opacity-10 p-3 rounded-3 text-info border border-info border-opacity-20">
              <Briefcase size={28} />
            </div>
            <div>
              <h5 className="text-white mb-1">Application Funnel</h5>
              <p className="text-muted mb-0 small">Track internship/full-time job applications from first apply to final offer with pipeline stages.</p>
            </div>
          </div>

          <div className="glass-card p-4 d-flex align-items-start gap-4">
            <div className="bg-warning bg-opacity-10 p-3 rounded-3 text-warning border border-warning border-opacity-20">
              <CalendarCheck size={28} />
            </div>
            <div>
              <h5 className="text-white mb-1">Study Planner</h5>
              <p className="text-muted mb-0 small">Add tasks and review schedules. Keep your preparation checklist updated on time.</p>
            </div>
          </div>
        </div>

        {/* Login Column */}
        <div className="col-12 col-md-5 d-flex">
          <div className="glass-card p-5 d-flex flex-column justify-content-center text-center w-100">
            <div className="mb-4">
              <span className="fs-1">🎯</span>
              <h3 className="text-white mt-3 fw-bold">Welcome to TrackPrep</h3>
              <p className="text-muted small">Access your account to check metrics progress</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-4 bg-danger bg-opacity-10 border-danger border-opacity-30 text-danger" role="alert">
                Authentication failed. Please try again.
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              <button 
                onClick={handleGoogleLogin} 
                className="btn btn-light py-3 px-4 d-flex align-items-center justify-content-center gap-3 fw-bold"
                style={{ borderRadius: '12px', transition: 'all 0.2s' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.66 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-2 3.71-4.94 3.71-8.61z"/>
                  <path fill="#FBBC05" d="M5.24 14.75c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.39 7.56C.5 9.36 0 11.38 0 12.5s.5 3.14 1.39 4.94l3.85-2.99z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.11-4.26 1.11-3.36 0-5.86-1.81-6.76-4.51L1.39 16.8C3.37 20.33 7.35 23 12 23z"/>
                </svg>
                Continue with Google
              </button>

              <div className="position-relative my-2 d-flex align-items-center">
                <hr className="w-100 border-secondary opacity-25" />
                <span className="position-absolute bg-dark px-3 text-muted small start-50 translate-middle">OR</span>
              </div>

              <button 
                onClick={handleMockLogin} 
                className="btn btn-neon-primary py-3 px-4 d-flex align-items-center justify-content-center gap-2"
              >
                <ShieldCheck size={20} />
                <span>Developer Mock Login</span>
              </button>
              
              <small className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                Use mock login to test immediately without setting up API credentials.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
