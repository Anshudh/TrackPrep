import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/api';
import { 
  LayoutDashboard, 
  Code2, 
  Briefcase, 
  CalendarCheck, 
  LogOut,
  User
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''} d-flex flex-column p-3`}>
      {/* Brand Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 px-2">
        <span className="fs-4 fw-extrabold text-neon-glow d-flex align-items-center gap-2">
          🎯 TrackPrep
        </span>
        <button 
          className="btn btn-sm btn-outline-secondary d-md-none" 
          onClick={toggleSidebar}
        >
          ✕
        </button>
      </div>

      <hr style={{ borderColor: 'var(--card-border)' }} />

      {/* Navigation Links */}
      <ul className="nav nav-pills flex-column mb-auto gap-2">
        <li className="nav-item">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-link sidebar-link d-flex align-items-center gap-3 py-3 px-3 ${isActive ? 'active' : ''}`}
            onClick={() => toggleSidebar && toggleSidebar(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink 
            to="/problems" 
            className={({ isActive }) => `nav-link sidebar-link d-flex align-items-center gap-3 py-3 px-3 ${isActive ? 'active' : ''}`}
            onClick={() => toggleSidebar && toggleSidebar(false)}
          >
            <Code2 size={20} />
            <span>Problems</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink 
            to="/applications" 
            className={({ isActive }) => `nav-link sidebar-link d-flex align-items-center gap-3 py-3 px-3 ${isActive ? 'active' : ''}`}
            onClick={() => toggleSidebar && toggleSidebar(false)}
          >
            <Briefcase size={20} />
            <span>Applications</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink 
            to="/planner" 
            className={({ isActive }) => `nav-link sidebar-link d-flex align-items-center gap-3 py-3 px-3 ${isActive ? 'active' : ''}`}
            onClick={() => toggleSidebar && toggleSidebar(false)}
          >
            <CalendarCheck size={20} />
            <span>Study Planner</span>
          </NavLink>
        </li>
      </ul>

      <hr style={{ borderColor: 'var(--card-border)' }} />

      {/* User Information Panel */}
      {user && (
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-3 px-2">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="rounded-circle border border-secondary"
                width="40"
                height="40"
                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }}
              />
            ) : (
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                <User size={20} />
              </div>
            )}
            <div className="overflow-hidden">
              <h6 className="mb-0 text-white text-truncate" style={{ fontSize: '0.9rem' }}>{user.name}</h6>
              <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>{user.email}</small>
            </div>
          </div>
          
          <button 
            onClick={logoutUser}
            className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-2 py-2"
            style={{ borderRadius: '10px' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
