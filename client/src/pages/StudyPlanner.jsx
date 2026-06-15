import React, { useEffect, useState } from 'react';
import { getTasks, addTask, updateTask, deleteTask } from '../services/api';
import TaskModal from '../components/TaskModal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckSquare, 
  AlertCircle,
  Square
} from 'lucide-react';

const StudyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [viewTab, setViewTab] = useState('pending'); // 'pending' or 'completed'
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      // Query backend with filter
      const completedFilter = viewTab === 'completed';
      const res = await getTasks({ completed: completedFilter });
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [viewTab]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (selectedTask) {
        const res = await updateTask(selectedTask.id, formData);
        if (res.success) {
          showToast('Task updated successfully.');
        }
      } else {
        const res = await addTask(formData);
        if (res.success) {
          showToast('Task created successfully.');
        }
      }
      setIsModalOpen(false);
      fetchList();
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const res = await updateTask(task.id, { completed: !task.completed });
      if (res.success) {
        showToast(task.completed ? 'Task marked active.' : 'Task completed! 🎉');
        fetchList();
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await deleteTask(id);
      if (res.success) {
        showToast('Task deleted successfully.');
        fetchList();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const openAddModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isOverdue = (deadlineStr) => {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    // Set hours to end of day to be fair
    deadline.setHours(23, 59, 59, 999);
    return deadline < new Date();
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
          <h2 className="fw-bold mb-1">Study Planner</h2>
          <p className="text-muted mb-0">Outline your preparation milestones and target timelines</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="btn btn-neon-primary d-flex align-items-center gap-2 px-3 py-2"
        >
          <Plus size={18} /> Create Task
        </button>
      </div>

      {/* View Tabs */}
      <div className="d-flex gap-2 mb-4">
        <button 
          className={`btn ${viewTab === 'pending' ? 'btn-neon-primary' : 'btn-neon-secondary'} px-4 py-2`}
          onClick={() => setViewTab('pending')}
        >
          Pending Tasks
        </button>
        <button 
          className={`btn ${viewTab === 'completed' ? 'btn-neon-primary' : 'btn-neon-secondary'} px-4 py-2`}
          onClick={() => setViewTab('completed')}
        >
          Completed Tasks
        </button>
      </div>

      {/* Main Task List panel */}
      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading tasks...</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-5">
            <CheckSquare size={48} className="text-muted mb-3" />
            <h5 className="text-white">No tasks in this section</h5>
            <p className="text-muted small">
              {viewTab === 'pending' 
                ? 'Create a study task to plan your next Leetcode sprint or OA review!'
                : 'Tasks you complete will show up here.'}
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {tasks.map((t) => {
              const overdue = viewTab === 'pending' && isOverdue(t.deadline);
              return (
                <div 
                  key={t.id} 
                  className="glass-card p-3 d-flex align-items-center justify-content-between gap-3"
                  style={{ 
                    backgroundColor: 'rgba(25, 30, 43, 0.55)',
                    borderLeft: overdue ? '4px solid var(--accent-danger)' : '1px solid var(--card-border)'
                  }}
                >
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    {/* Checkbox */}
                    <input 
                      type="checkbox" 
                      className="task-checkbox" 
                      checked={t.completed}
                      onChange={() => handleToggleComplete(t)}
                    />
                    
                    <div>
                      <h6 className={`mb-1 text-white fw-medium ${t.completed ? 'task-completed-text' : ''}`}>
                        {t.title}
                      </h6>
                      
                      {t.deadline && (
                        <div className="d-flex align-items-center gap-1.5 text-muted small mt-1">
                          <Calendar size={12} />
                          <span style={{ fontSize: '0.8rem' }}>
                            Deadline: {new Date(t.deadline).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {overdue && (
                            <span className="text-danger d-flex align-items-center gap-1 ms-2 font-semibold" style={{ fontSize: '0.75rem' }}>
                              <AlertCircle size={12} /> Overdue
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <button 
                      onClick={() => openEditModal(t)} 
                      className="btn btn-sm btn-outline-secondary p-1.5 border-0"
                      title="Edit task"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)} 
                      className="btn btn-sm btn-outline-danger p-1.5 border-0"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Modal Container */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        task={selectedTask}
      />
    </div>
  );
};

export default StudyPlanner;
