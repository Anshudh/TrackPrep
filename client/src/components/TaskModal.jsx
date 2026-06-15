import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSubmit, task }) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      const dateVal = task.deadline 
        ? new Date(task.deadline).toISOString().split('T')[0]
        : '';
      setDeadline(dateVal);
    } else {
      setTitle('');
      setDeadline('');
    }
    setErrors({});
  }, [task, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Task title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      deadline: deadline || null,
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
              {task ? 'Edit Study Task' : 'Create New Study Task'}
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
              {/* Task Title */}
              <div>
                <label className="form-label text-muted small fw-medium">Task / Goal Title</label>
                <input 
                  type="text" 
                  className={`form-control form-control-glass ${errors.title ? 'is-invalid border-danger' : ''}`}
                  placeholder="e.g. Solve 5 Graph problems or Review DP notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Deadline */}
              <div>
                <label className="form-label text-muted small fw-medium">Deadline (Optional)</label>
                <input 
                  type="date" 
                  className="form-control form-control-glass"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
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
                Save Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
