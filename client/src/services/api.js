import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create Axios Instance
const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true, // Crucial for session cookie transmission
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const checkAuthStatus = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutUser = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  // Directly trigger backend redirection
  window.location.href = `${backendUrl}/api/auth/logout`;
};

// Dashboard Stats API
export const fetchDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Problems APIs
export const getProblems = async (params = {}) => {
  const response = await api.get('/problems', { params });
  return response.data;
};

export const addProblem = async (problemData) => {
  const response = await api.post('/problems', problemData);
  return response.data;
};

export const updateProblem = async (id, problemData) => {
  const response = await api.put(`/problems/${id}`, problemData);
  return response.data;
};

export const deleteProblem = async (id) => {
  const response = await api.delete(`/problems/${id}`);
  return response.data;
};

// Applications APIs
export const getApplications = async (params = {}) => {
  const response = await api.get('/applications', { params });
  return response.data;
};

export const addApplication = async (appData) => {
  const response = await api.post('/applications', appData);
  return response.data;
};

export const updateApplication = async (id, appData) => {
  const response = await api.put(`/applications/${id}`, appData);
  return response.data;
};

export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

// Tasks (Study Planner) APIs
export const getTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

export const addTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export default api;
