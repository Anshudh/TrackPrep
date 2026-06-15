import React, { useEffect, useState } from 'react';
import { getApplications, addApplication, updateApplication, deleteApplication } from '../services/api';
import ApplicationModal from '../components/ApplicationModal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Briefcase, 
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';

const STAGES = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'];

const STAGE_HEADER_COLORS = {
  Applied: 'border-top: 3px solid #3b82f6',
  OA: 'border-top: 3px solid #8b5cf6',
  Interview: 'border-top: 3px solid #06b6d4',
  Offer: 'border-top: 3px solid #10b981',
  Rejected: 'border-top: 3px solid #ef4444'
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await getApplications();
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (selectedApplication) {
        // Edit Mode
        const res = await updateApplication(selectedApplication.id, formData);
        if (res.success) {
          showToast('Job application details saved.');
        }
      } else {
        // Create Mode
        const res = await addApplication(formData);
        if (res.success) {
          showToast('Application tracked successfully.');
        }
      }
      setIsModalOpen(false);
      fetchList();
    } catch (err) {
      console.error('Error saving application:', err);
    }
  };

  const handleQuickStatusChange = async (app, newStatus) => {
    try {
      const updatedData = {
        company: app.company,
        role: app.role,
        status: newStatus,
        applied_date: app.applied_date,
        notes: app.notes
      };
      const res = await updateApplication(app.id, updatedData);
      if (res.success) {
        showToast(`Moved to ${newStatus}`);
        fetchList();
      }
    } catch (err) {
      console.error('Error changing stage:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job application from your dashboard?')) return;
    try {
      const res = await deleteApplication(id);
      if (res.success) {
        showToast('Application deleted.');
        fetchList();
      }
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const openAddModal = () => {
    setSelectedApplication(null);
    setIsModalOpen(true);
  };

  const openEditModal = (app) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Group applications by stage
  const groupedApps = STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter((app) => app.status === stage);
    return acc;
  }, {});

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
          <h2 className="fw-bold mb-1">Job Applications</h2>
          <p className="text-muted mb-0">Manage and follow recruitment progress for all companies</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="btn btn-neon-primary d-flex align-items-center gap-2 px-3 py-2"
        >
          <Plus size={18} /> Add Application
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading applications...</span>
          </div>
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="row g-3 flex-nowrap overflow-x-auto pb-4" style={{ minHeight: '650px' }}>
          {STAGES.map((stage) => (
            <div key={stage} className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ minWidth: '260px', flex: '1' }}>
              <div 
                className="glass-card h-100 p-3 d-flex flex-column" 
                style={{ 
                  backgroundColor: 'rgba(15, 18, 27, 0.4)',
                  borderTop: STAGE_HEADER_COLORS[stage].split('border-top: ')[1] 
                }}
              >
                {/* Column Title */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-white mb-0">{stage}</h6>
                  <span className="badge rounded-pill bg-dark text-muted border border-secondary border-opacity-20 px-2 py-1">
                    {groupedApps[stage]?.length || 0}
                  </span>
                </div>

                {/* Job Cards Column */}
                <div className="d-flex flex-column gap-3 overflow-y-auto mb-auto pe-1" style={{ maxHeight: '500px' }}>
                  {groupedApps[stage]?.length === 0 ? (
                    <div className="text-center py-4 border border-dashed rounded-3 border-secondary border-opacity-20">
                      <span className="text-muted small">No jobs tracked</span>
                    </div>
                  ) : (
                    groupedApps[stage].map((app) => (
                      <div key={app.id} className="glass-card p-3 d-flex flex-column gap-2" style={{ backgroundColor: 'rgba(25, 30, 43, 0.65)' }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="text-white mb-0 fw-bold">{app.company}</h6>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '160px' }}>{app.role}</small>
                          </div>
                          <div className="dropdown">
                            <button 
                              className="btn btn-sm btn-outline-secondary border-0 p-1" 
                              type="button" 
                              data-bs-toggle="dropdown" 
                              aria-expanded="false"
                            >
                              <ArrowRightLeft size={14} className="text-muted" />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end border-secondary">
                              <li className="dropdown-header text-muted small">Move to Stage</li>
                              {STAGES.filter(s => s !== stage).map(s => (
                                <li key={s}>
                                  <button 
                                    className="dropdown-item small py-1.5" 
                                    onClick={() => handleQuickStatusChange(app, s)}
                                  >
                                    {s}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {app.notes && (
                          <p className="text-muted mb-1 text-truncate" style={{ fontSize: '0.75rem', whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>
                            {app.notes}
                          </p>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary border-opacity-10">
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {new Date(app.applied_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </small>
                          <div className="d-flex gap-1">
                            <button 
                              onClick={() => openEditModal(app)} 
                              className="btn btn-sm text-secondary hover-text-white p-1"
                              title="Edit details"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              onClick={() => handleDelete(app.id)} 
                              className="btn btn-sm text-danger hover-text-white p-1"
                              title="Delete tracker"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal Container */}
      <ApplicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        application={selectedApplication}
      />
    </div>
  );
};

export default Applications;
