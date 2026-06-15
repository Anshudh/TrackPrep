import React, { useEffect, useState } from 'react';
import { getProblems, addProblem, updateProblem, deleteProblem } from '../services/api';
import ProblemModal from '../components/ProblemModal';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Code2
} from 'lucide-react';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await getProblems({ search, platform, difficulty, topic });
      if (res.success) {
        setProblems(res.data);
      }
    } catch (err) {
      console.error('Error loading problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [search, platform, difficulty, topic]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (selectedProblem) {
        // Edit Mode
        const res = await updateProblem(selectedProblem.id, formData);
        if (res.success) {
          showToast('Problem updated successfully.');
        }
      } else {
        // Create Mode
        const res = await addProblem(formData);
        if (res.success) {
          showToast('Problem tracked successfully.');
        }
      }
      setIsModalOpen(false);
      fetchList();
    } catch (err) {
      console.error('Error saving problem:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem record?')) return;
    try {
      const res = await deleteProblem(id);
      if (res.success) {
        showToast('Problem deleted successfully.');
        fetchList();
      }
    } catch (err) {
      console.error('Error deleting problem:', err);
    }
  };

  const openAddModal = () => {
    setSelectedProblem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getPlatformClass = (plat) => {
    switch (plat) {
      case 'LeetCode': return 'badge-leetcode';
      case 'Codeforces': return 'badge-codeforces';
      case 'CodeChef': return 'badge-codechef';
      default: return 'badge-other';
    }
  };

  const getDifficultyClass = (diff) => {
    switch (diff) {
      case 'Easy': return 'badge-easy';
      case 'Medium': return 'badge-medium';
      case 'Hard': return 'badge-hard';
      default: return 'badge-secondary';
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-success border-0 glass-card" role="alert">
            <div className="d-flex">
              <div className="toast-body fw-bold">{toastMessage}</div>
              <button 
                type="button" 
                className="btn-close btn-close-white me-2 m-auto" 
                onClick={() => setToastMessage(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Solved Problems</h2>
          <p className="text-muted mb-0">List of practice coding questions you have completed</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="btn btn-neon-primary d-flex align-items-center gap-2 px-3 py-2"
        >
          <Plus size={18} /> Track Problem
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-card p-4 mb-4">
        <div className="row g-3">
          {/* Search box */}
          <div className="col-12 col-md-4">
            <label className="form-label text-muted small fw-medium">Search Title</label>
            <div className="position-relative">
              <Search className="position-absolute text-muted start-3 top-50 translate-middle-y ms-3" size={16} />
              <input 
                type="text" 
                className="form-control form-control-glass ps-5" 
                placeholder="Search problems..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Platform filter */}
          <div className="col-6 col-md-2">
            <label className="form-label text-muted small fw-medium">Platform</label>
            <select 
              className="form-select form-select-glass" 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="">All Platforms</option>
              <option value="LeetCode">LeetCode</option>
              <option value="Codeforces">Codeforces</option>
              <option value="CodeChef">CodeChef</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="col-6 col-md-3">
            <label className="form-label text-muted small fw-medium">Difficulty</label>
            <select 
              className="form-select form-select-glass" 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Topic filter */}
          <div className="col-12 col-md-3">
            <label className="form-label text-muted small fw-medium">Topic</label>
            <select 
              className="form-select form-select-glass" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">All Topics</option>
              <option value="Array">Array</option>
              <option value="String">String</option>
              <option value="Linked List">Linked List</option>
              <option value="Tree">Tree</option>
              <option value="Graph">Graph</option>
              <option value="DP">DP</option>
              <option value="Greedy">Greedy</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-5">
            <Code2 size={48} className="text-muted mb-3" />
            <h5 className="text-white">No solved problems found</h5>
            <p className="text-muted small">Try modifying your search criteria or log a new practice problem.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr className="text-muted small" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th className="py-3 px-4" style={{ backgroundColor: 'transparent' }}>Title</th>
                  <th className="py-3" style={{ backgroundColor: 'transparent' }}>Platform</th>
                  <th className="py-3" style={{ backgroundColor: 'transparent' }}>Difficulty</th>
                  <th className="py-3" style={{ backgroundColor: 'transparent' }}>Topic</th>
                  <th className="py-3" style={{ backgroundColor: 'transparent' }}>Solved Date</th>
                  <th className="py-3 px-4 text-end" style={{ backgroundColor: 'transparent' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-3 px-4 fw-medium text-white" style={{ backgroundColor: 'transparent' }}>
                      <div className="d-flex align-items-center gap-2">
                        {p.title}
                        {p.problem_url && (
                          <a 
                            href={p.problem_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-muted hover-text-white"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ backgroundColor: 'transparent' }}>
                      <span className={`badge ${getPlatformClass(p.platform)} px-2.5 py-1.5`}>
                        {p.platform}
                      </span>
                    </td>
                    <td style={{ backgroundColor: 'transparent' }}>
                      <span className={`badge ${getDifficultyClass(p.difficulty)} px-2.5 py-1.5`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td style={{ backgroundColor: 'transparent' }}>
                      <span className="text-secondary small fw-medium">{p.topic}</span>
                    </td>
                    <td className="text-muted small" style={{ backgroundColor: 'transparent' }}>
                      {new Date(p.solved_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-end" style={{ backgroundColor: 'transparent' }}>
                      <div className="d-flex gap-2 justify-content-end">
                        <button 
                          onClick={() => openEditModal(p)} 
                          className="btn btn-sm btn-outline-secondary p-1.5"
                          style={{ border: 'none' }}
                          title="Edit Problem"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="btn btn-sm btn-outline-danger p-1.5"
                          style={{ border: 'none' }}
                          title="Delete Problem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Problem Modal Container */}
      <ProblemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        problem={selectedProblem}
      />
    </div>
  );
};

export default Problems;
