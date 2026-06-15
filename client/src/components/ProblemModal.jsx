import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProblemModal = ({ isOpen, onClose, onSubmit, problem }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [difficulty, setDifficulty] = useState('Medium');
  const [topic, setTopic] = useState('Array');
  const [solvedDate, setSolvedDate] = useState('');
  const [problemUrl, setProblemUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (problem) {
      setTitle(problem.title || '');
      setPlatform(problem.platform || 'LeetCode');
      setDifficulty(problem.difficulty || 'Medium');
      setTopic(problem.topic || 'Array');
      // Format Date to YYYY-MM-DD
      const dateVal = problem.solved_date 
        ? new Date(problem.solved_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setSolvedDate(dateVal);
      setProblemUrl(problem.problem_url || '');
    } else {
      setTitle('');
      setPlatform('LeetCode');
      setDifficulty('Medium');
      setTopic('Array');
      setSolvedDate(new Date().toISOString().split('T')[0]);
      setProblemUrl('');
    }
    setErrors({});
  }, [problem, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (problemUrl.trim()) {
      try {
        new URL(problemUrl);
      } catch (_) {
        newErrors.problemUrl = 'Must be a valid URL (e.g. https://leetcode.com/...)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      platform,
      difficulty,
      topic,
      solved_date: solvedDate || new Date().toISOString().split('T')[0],
      problem_url: problemUrl.trim() || null,
    });
  };

  return (
    <div 
      className="modal d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card border-0 overflow-hidden">
          {/* Modal Header */}
          <div 
            className="modal-header d-flex justify-content-between align-items-center p-4" 
            style={{ borderBottom: '1px solid var(--card-border)' }}
          >
            <h5 className="modal-title fw-bold text-white">
              {problem ? 'Edit Solved Problem' : 'Track Solved Problem'}
            </h5>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary rounded-circle p-1" 
              onClick={onClose}
              style={{ border: 'none' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleFormSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3">
              {/* Problem Title */}
              <div>
                <label className="form-label text-muted small fw-medium">Problem Title</label>
                <input 
                  type="text" 
                  className={`form-control form-control-glass ${errors.title ? 'is-invalid border-danger' : ''}`}
                  placeholder="e.g. Two Sum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Platform */}
              <div>
                <label className="form-label text-muted small fw-medium">Platform</label>
                <select 
                  className="form-select form-select-glass"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="CodeChef">CodeChef</option>
                  <option value="Other">Other Platform</option>
                </select>
              </div>

              {/* Difficulty & Topic Grid */}
              <div className="row">
                <div className="col-6">
                  <label className="form-label text-muted small fw-medium">Difficulty</label>
                  <select 
                    className="form-select form-select-glass"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label text-muted small fw-medium">Topic</label>
                  <select 
                    className="form-select form-select-glass"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="Array">Array</option>
                    <option value="String">String</option>
                    <option value="Linked List">Linked List</option>
                    <option value="Tree">Tree</option>
                    <option value="Graph">Graph</option>
                    <option value="DP">DP</option>
                    <option value="Greedy">Greedy</option>
                    <option value="Other">Other Topic</option>
                  </select>
                </div>
              </div>

              {/* Solved Date */}
              <div>
                <label className="form-label text-muted small fw-medium">Solved Date</label>
                <input 
                  type="date" 
                  className="form-control form-control-glass"
                  value={solvedDate}
                  onChange={(e) => setSolvedDate(e.target.value)}
                />
              </div>

              {/* Problem Link */}
              <div>
                <label className="form-label text-muted small fw-medium">Problem Link (Optional)</label>
                <input 
                  type="text" 
                  className={`form-control form-control-glass ${errors.problemUrl ? 'is-invalid border-danger' : ''}`}
                  placeholder="https://leetcode.com/problems/..."
                  value={problemUrl}
                  onChange={(e) => setProblemUrl(e.target.value)}
                />
                {errors.problemUrl && <div className="invalid-feedback">{errors.problemUrl}</div>}
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="modal-footer p-4 d-flex gap-2" 
              style={{ borderTop: '1px solid var(--card-border)' }}
            >
              <button 
                type="button" 
                className="btn btn-neon-secondary flex-grow-1 py-2" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-neon-primary flex-grow-1 py-2"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProblemModal;
