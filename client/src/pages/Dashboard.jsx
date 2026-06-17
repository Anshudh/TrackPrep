import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../services/api';
import { useSocket } from '../services/socket';
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

  const socket = useSocket();
  const [activities, setActivities] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [roomMessages, setRoomMessages] = useState([]);
  const [progressMsg, setProgressMsg] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handleActivity = (activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 10));
    };

    const handleRoomMessage = (msg) => {
      setRoomMessages((prev) => [...prev, msg]);
    };

    socket.on('live_activity', handleActivity);
    socket.on('room_message', handleRoomMessage);

    let timer;
    if (socket && !socket.io) {
      // Setup a periodic timer for simulated activities in mock mode
      const mockUsers = ['AliceCoder', 'BobDev', 'CodeMaster9', 'ViteFanatic', 'Algopreneur'];
      const mockActions = [
        { text: 'solved a problem', title: 'Two Sum (LeetCode)' },
        { text: 'added an application', title: 'Meta - Frontend Engineer' },
        { text: 'completed a task', title: 'Revise sliding window patterns' },
        { text: 'solved a problem', title: 'Merge K Sorted Lists (LeetCode)' },
        { text: 'added an application', title: 'Stripe - Software Engineer' }
      ];

      timer = setInterval(() => {
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const action = mockActions[Math.floor(Math.random() * mockActions.length)];
        const simulatedActivity = {
          userId: 999,
          userName: user,
          actionText: action.text,
          entityTitle: action.title,
          timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString()
        };
        handleActivity(simulatedActivity);
      }, 15000);
    }

    return () => {
      socket.off('live_activity', handleActivity);
      socket.off('room_message', handleRoomMessage);
      if (timer) clearInterval(timer);
    };
  }, [socket]);

  const joinRoom = (e) => {
    e.preventDefault();
    if (!roomName.trim() || !socket) return;
    socket.emit('join_room', roomName);
    setJoinedRoom(roomName);
    setRoomMessages([]);
  };

  const leaveRoom = () => {
    if (!socket || !joinedRoom) return;
    socket.emit('leave_room', joinedRoom);
    setJoinedRoom(null);
    setRoomName('');
    setRoomMessages([]);
  };

  const sendProgressUpdate = (e) => {
    e.preventDefault();
    if (!progressMsg.trim() || !socket || !joinedRoom) return;
    socket.emit('send_room_message', {
      room: joinedRoom,
      text: progressMsg,
      sender: 'Me'
    });
    setProgressMsg('');
  };

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
    Easy: '#8da891',   // Sage Green
    Medium: '#dfb17b', // Champagne Gold
    Hard: '#d67b73',   // Terracotta Red
  };

  const STATUS_COLORS = {
    Applied: '#a69a8f',   // Warm Taupe
    OA: '#c49c74',        // Sandy Ochre
    Interview: '#c5a880', // Warm Bronze
    Rejected: '#cd6b65',  // Muted Rust
    Offer: '#8da891',     // Sage Green
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
            <div className="p-3 rounded-4 theme-icon-primary">
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
            <div className="p-3 rounded-4 theme-icon-secondary">
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
            <div className="p-3 rounded-4 theme-icon-success">
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
                          <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="var(--secondary-neon)" stopOpacity={0.3} />
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

      {/* Real-time Collaboration Section */}
      <div className="row g-4 mt-3">
        {/* Live Activity Feed */}
        <div className="col-12 col-lg-6">
          <div className="glass-card p-4 h-100">
            <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
              <span className="position-relative d-inline-block" style={{ width: '10px', height: '10px' }}>
                <span className="position-absolute top-50 start-50 translate-middle p-1 bg-success rounded-circle animate-ping" style={{ width: '100%', height: '100%', opacity: 0.75 }}></span>
                <span className="position-absolute top-50 start-50 translate-middle p-1 bg-success border border-light rounded-circle" style={{ width: '8px', height: '8px' }}></span>
              </span>
              Live Activity Feed
            </h5>
            
            <div className="activity-list overflow-auto pr-2" style={{ maxHeight: '280px', minHeight: '200px' }}>
              {activities.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small py-5">
                  Waiting for activity events...
                </div>
              ) : (
                activities.map((act, idx) => (
                  <div key={idx} className="p-3 mb-2 rounded-3 border border-light border-opacity-10 bg-white bg-opacity-5 d-flex justify-content-between align-items-center animate-fade-in">
                    <div>
                      <span className="fw-semibold text-white">{act.userName || 'Someone'}</span>{' '}
                      <span className="text-muted">{act.actionText}</span>{' '}
                      <span className="fw-medium text-neon-secondary">{act.entityTitle}</span>
                    </div>
                    <span className="text-muted small ms-2" style={{ fontSize: '0.75rem' }}>{act.timeString}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Study Groups */}
        <div className="col-12 col-lg-6">
          <div className="glass-card p-4 h-100">
            <h5 className="text-white mb-3 fw-bold d-flex align-items-center gap-2">
              <Compass size={18} className="text-neon-secondary" /> Study Groups (Socket.io Rooms)
            </h5>
            
            {joinedRoom ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="text-muted small">Connected to Room:</span>
                    <h6 className="text-neon-glow mb-0 fw-bold">{joinedRoom}</h6>
                  </div>
                  <button onClick={leaveRoom} className="btn btn-outline-danger btn-sm px-3">Leave Room</button>
                </div>
                
                <div className="room-messages overflow-auto mb-3 p-3 rounded-3 border border-light border-opacity-10 bg-black bg-opacity-20" style={{ maxHeight: '160px', minHeight: '130px' }}>
                  {roomMessages.length === 0 ? (
                    <div className="text-muted small text-center py-4">No recent room updates. Share your progress!</div>
                  ) : (
                    roomMessages.map((msg, idx) => (
                      <div key={idx} className="mb-2 text-white small">
                        <span className="text-neon-secondary fw-semibold">{msg.sender}: </span>
                        <span>{msg.text}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <form onSubmit={sendProgressUpdate} className="d-flex gap-2">
                  <input
                    type="text"
                    value={progressMsg}
                    onChange={(e) => setProgressMsg(e.target.value)}
                    placeholder="Share your task or stats..."
                    className="form-control form-control-glass py-2 text-white"
                  />
                  <button type="submit" className="btn btn-neon-primary px-3">Send</button>
                </form>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-muted small">Join a study group room to connect and share progress with peers in real time.</p>
                <form onSubmit={joinRoom} className="d-flex gap-2 mt-3">
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter Room Name (e.g. FAANG_Prep)"
                    className="form-control form-control-glass py-2 text-white"
                    required
                  />
                  <button type="submit" className="btn btn-neon-secondary px-4">Join Room</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
