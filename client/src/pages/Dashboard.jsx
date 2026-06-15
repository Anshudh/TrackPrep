import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../services/api';
import { 
  Code2, 
  Briefcase, 
  CalendarCheck, 
  TrendingUp, 
  Plus,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboardStats();
        if (res.success) {
          setStats(res.data);
        } else {
          setError('Failed to load dashboard metrics.');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Database connection error. Setup tables or start Postgres.');
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  // Preset Colors for charts
  const DIFFICULTY_COLORS = {
    Easy: '#10b981',   // Emerald
    Medium: '#f59e0b', // Amber
    Hard: '#ef4444',   // Rose
  };

  const STATUS_COLORS = {
    Applied: '#3b82f6',   // Blue
    OA: '#8b5cf6',        // Purple
    Interview: '#06b6d4', // Cyan
    Rejected: '#ef4444',  // Red
    Offer: '#10b981',     // Emerald
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-neon-primary" role="status">
          <span className="visually-hidden">Loading Stats...</span>
        </div>
      </div>
    );
  }

  // Fallback defaults if DB returns empty
  const metrics = stats?.metrics || { totalProblems: 0, totalApplications: 0, pendingTasks: 0 };
  const charts = stats?.charts || { difficulty: [], topic: [], applicationStatus: [] };

  // Prepare Difficulty Data for Recharts Pie
  const difficultyData = charts.difficulty.map(item => ({
    name: item.difficulty,
    value: parseInt(item.count),
    color: DIFFICULTY_COLORS[item.difficulty] || '#6b7280'
  }));

  // Prepare Application Status Data
  const appStatusData = charts.applicationStatus.map(item => ({
    name: item.status,
    value: parseInt(item.count),
    color: STATUS_COLORS[item.status] || '#6b7280'
  }));

  // Prepare Topic Data
  const topicData = charts.topic.map(item => ({
    topic: item.topic,
    solved: parseInt(item.count)
  }));

  return (
    <div>
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Your Prep Hub</h2>
          <p className="text-muted mb-0">Overview of your coding performance and hiring cycles</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/problems" className="btn btn-neon-primary btn-sm d-flex align-items-center gap-2 px-3 py-2">
            <Plus size={16} /> Add Problem
          </Link>
          <Link to="/applications" className="btn btn-neon-secondary btn-sm d-flex align-items-center gap-2 px-3 py-2">
            <Plus size={16} /> Add Application
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-3 mb-4 bg-warning bg-opacity-10 border-warning border-opacity-20 text-warning d-flex align-items-center gap-3" role="alert">
          <span>⚠️</span>
          <div>
            <strong>Database Offline:</strong> Showing dashboard canvas shell. Please ensure your PostgreSQL server is active and the schemas have been loaded.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-hover p-4 d-flex align-items-center gap-4">
            <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#8b5cf6' }}>
              <Code2 size={32} />
            </div>
            <div>
              <span className="text-muted d-block small fw-medium text-uppercase">Problems Solved</span>
              <h2 className="mb-0 fw-bold mt-1 text-neon-glow">{metrics.totalProblems}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-hover p-4 d-flex align-items-center gap-4">
            <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#06b6d4' }}>
              <Briefcase size={32} />
            </div>
            <div>
              <span className="text-muted d-block small fw-medium text-uppercase">Applications</span>
              <h2 className="mb-0 fw-bold mt-1 text-neon-glow">{metrics.totalApplications}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-hover p-4 d-flex align-items-center gap-4">
            <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
              <CalendarCheck size={32} />
            </div>
            <div>
              <span className="text-muted d-block small fw-medium text-uppercase">Pending Tasks</span>
              <h2 className="mb-0 fw-bold mt-1 text-neon-glow">{metrics.pendingTasks}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Panels */}
      {metrics.totalProblems === 0 && metrics.totalApplications === 0 ? (
        /* Empty Dashboard State */
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-md-8 text-center py-5 glass-card">
            <div className="mb-4">
              <Compass size={64} className="text-neon-primary animate-pulse" />
            </div>
            <h4 className="text-white">Your dashboard stats are ready and waiting!</h4>
            <p className="text-muted max-w-lg mx-auto small px-3">
              Add coding problems, apply for jobs, and set scheduling deadlines. The charts will automatically populate once data is logged.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Link to="/problems" className="btn btn-neon-primary px-4 py-2">
                Log Solved Problem
              </Link>
              <Link to="/planner" className="btn btn-neon-secondary px-4 py-2">
                Create Study Plan
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Render Visual Data */
        <div className="row g-4">
          {/* Difficulty Pie Chart */}
          <div className="col-12 col-lg-4">
            <div className="glass-card p-4 h-100">
              <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                <TrendingUp size={18} className="text-neon-primary" /> Problems by Difficulty
              </h5>
              <div style={{ width: '100%', height: 260 }}>
                {difficultyData.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 18, 27, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-muted small">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No difficulty metrics logged.</div>
                )}
              </div>
            </div>
          </div>

          {/* Applications funnel */}
          <div className="col-12 col-lg-4">
            <div className="glass-card p-4 h-100">
              <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                <TrendingUp size={18} className="text-neon-secondary" /> Job Recruitment Pipeline
              </h5>
              <div style={{ width: '100%', height: 260 }}>
                {appStatusData.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={appStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                      >
                        {appStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 18, 27, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-muted small">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No applications metrics logged.</div>
                )}
              </div>
            </div>
          </div>

          {/* Topics solved bar chart */}
          <div className="col-12 col-lg-4">
            <div className="glass-card p-4 h-100">
              <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                <TrendingUp size={18} className="text-neon-primary" /> Solved by Topic
              </h5>
              <div style={{ width: '100%', height: 260 }}>
                {topicData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="topic" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 18, 27, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <Bar dataKey="solved" fill="url(#colorTopicBar)" radius={[4, 4, 0, 0]}>
                        {topicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="url(#colorTopicBar)" />
                        ))}
                      </Bar>
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="colorTopicBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No topic metrics logged.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
