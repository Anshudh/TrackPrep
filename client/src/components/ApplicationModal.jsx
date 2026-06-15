import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ApplicationModal = ({ isOpen, onClose, onSubmit, application }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (application) {
      setCompany(application.company || '');
      setRole(application.role || '');
      setStatus(application.status || 'Applied');
      const dateVal = application.applied_date 
        ? new Date(application.applied_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setAppliedDate(dateVal);
      setNotes(application.notes || '');
    } else {
      setCompany('');
      setRole('');
      setStatus('Applied');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrors({});
  }, [application, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!company.trim()) newErrors.company = 'Company is required';
    if (!role.trim()) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      company: company.trim(),
      role: role.trim(),
      status,
      applied_date: appliedDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || null,
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
              {application ? 'Edit Application Details' : 'Track Job Application'}
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
              {/* Company */}
              <div>
                <label className="form-label text-muted small fw-medium">Company Name</label>
                <input 
                  type="text" 
                  className={`form-control form-control-glass ${errors.company ? 'is-invalid border-danger' : ''}`}
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                {errors.company && <div className="invalid-feedback">{errors.company}</div>}
              </div>

              {/* Role */}
              <div>
                <label className="form-label text-muted small fw-medium">Role / Position</label>
                <input 
                  type="text" 
                  className={`form-control form-control-glass ${errors.role ? 'is-invalid border-danger' : ''}`}
                  placeholder="e.g. Software Engineer Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                {errors.role && <div className="invalid-feedback">{errors.role}</div>}
              </div>

              {/* Status & Applied Date Grid */}
              <div className="row">
                <div className="col-6">
                  <label className="form-label text-muted small fw-medium">Recruitment Stage</label>
                  <select 
                    className="form-select form-select-glass"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="OA">OA (Online Assessment)</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer Received</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label text-muted small fw-medium">Applied Date</label>
                  <input 
                    type="date" 
                    className="form-control form-control-glass"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="form-label text-muted small fw-medium">Notes (Optional)</label>
                <textarea 
                  className="form-control form-control-glass"
                  placeholder="Recruiter contact, interview dates, reference, preparation details..."
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
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

export default ApplicationModal;
