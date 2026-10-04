import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Users,
  Eye,
  Edit2,
  Trash2,
  CheckSquare
} from 'lucide-react';

const Projects = () => {
  const { isProjectManager, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    Project_Name: '',
    Description: '',
    Start_Date: '',
    End_Date: '',
    Status: 'Planned',
    Manager_ID: '',
    Contractor_ID: '',
    Total_Budget: '',
    Approved_Budget: '',
    Budget_Remarks: ''
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined
        }
      });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [usersRes, contractorsRes] = await Promise.all([
        api.get('/users'),
        api.get('/contractors')
      ]);
      setManagers(usersRes.data.users || []);
      setContractors(contractorsRes.data.contractors || []);
    } catch (err) {
      console.error('Failed to load aux data:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  useEffect(() => {
    fetchAuxData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      Project_Name: '',
      Description: '',
      Start_Date: new Date().toISOString().split('T')[0],
      End_Date: '',
      Status: 'Planned',
      Manager_ID: managers[0]?.User_ID || '',
      Contractor_ID: contractors[0]?.Contractor_ID || '',
      Total_Budget: '',
      Approved_Budget: '',
      Budget_Remarks: 'Initial allocation'
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setFormData({
      Project_Name: project.Project_Name,
      Description: project.Description || '',
      Start_Date: project.Start_Date,
      End_Date: project.End_Date,
      Status: project.Status,
      Manager_ID: project.Manager_ID || '',
      Contractor_ID: project.Contractor_ID || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/projects', formData);
      setIsCreateModalOpen(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.put(`/projects/${selectedProject.Project_ID}`, formData);
      setIsEditModalOpen(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    try {
      await api.delete(`/projects/${selectedProject.Project_ID}`);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString('en-IN')}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Construction Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Lifecycle tracking, schedules, contractors, and project budgets
          </p>
        </div>
        {(isAdmin || isProjectManager) && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In-Progress">In-Progress</option>
            <option value="On-Hold">On-Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No projects found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Try clearing search filters or create a new construction project.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {projects.map((project) => {
            const stats = project.stats || {};
            return (
              <div key={project.Project_ID} className="glass-card glass-card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {project.Project_Name}
                    </h3>
                    <StatusBadge status={project.Status} />
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.Description || 'No project description provided.'}
                  </p>

                  {/* Metadata items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={15} color="var(--accent-secondary)" />
                      <span>{project.Start_Date} to {project.End_Date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={15} color="var(--accent-primary)" />
                      <span>Manager: {project.manager ? project.manager.Full_Name : 'Unassigned'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={15} color="var(--warning)" />
                      <span>Contractor: {project.contractor ? project.contractor.Contractor_Name : 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Task Completion</span>
                      <span style={{ color: 'var(--accent-secondary)' }}>{stats.completionPercent || 0}% ({stats.doneTasks || 0}/{stats.totalTasks || 0})</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.completionPercent || 0}%`, height: '100%', backgroundColor: 'var(--accent-secondary)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>

                  {/* Financials pill */}
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8125rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Budget: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(stats.approvedBudget || 0)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Spent: </span>
                      <strong style={{ color: 'var(--success)' }}>{formatCurrency(stats.totalSpent || 0)}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <Link to={`/projects/${project.Project_ID}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Eye size={15} />
                    <span>View Workspace</span>
                  </Link>

                  {(isAdmin || isProjectManager) && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(project)}
                        title="Edit Project"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDeleteModalOpen(true);
                        }}
                        style={{ color: 'var(--danger)' }}
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Construction Project" maxWidth="600px">
        {formError && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Skyline Commercial Center Phase II"
              value={formData.Project_Name}
              onChange={(e) => setFormData({ ...formData, Project_Name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Enter architectural and engineering scope..."
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.Start_Date}
                onChange={(e) => setFormData({ ...formData, Start_Date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.End_Date}
                onChange={(e) => setFormData({ ...formData, End_Date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
              >
                <option value="Planned">Planned</option>
                <option value="In-Progress">In-Progress</option>
                <option value="On-Hold">On-Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Manager</label>
              <select
                className="form-select"
                value={formData.Manager_ID}
                onChange={(e) => setFormData({ ...formData, Manager_ID: e.target.value })}
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m.User_ID} value={m.User_ID}>
                    {m.Full_Name} ({m.role?.Role_Name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contractor</label>
              <select
                className="form-select"
                value={formData.Contractor_ID}
                onChange={(e) => setFormData({ ...formData, Contractor_ID: e.target.value })}
              >
                <option value="">Select Contractor</option>
                {contractors.map((c) => (
                  <option key={c.Contractor_ID} value={c.Contractor_ID}>
                    {c.Contractor_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Initial Financial Budget (Optional)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Total Budget (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 25000000"
                  value={formData.Total_Budget}
                  onChange={(e) => setFormData({ ...formData, Total_Budget: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Approved Budget (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 22000000"
                  value={formData.Approved_Budget}
                  onChange={(e) => setFormData({ ...formData, Approved_Budget: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PROJECT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project Details" maxWidth="600px">
        {formError && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.Project_Name}
              onChange={(e) => setFormData({ ...formData, Project_Name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.Start_Date}
                onChange={(e) => setFormData({ ...formData, Start_Date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.End_Date}
                onChange={(e) => setFormData({ ...formData, End_Date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
              >
                <option value="Planned">Planned</option>
                <option value="In-Progress">In-Progress</option>
                <option value="On-Hold">On-Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Manager</label>
              <select
                className="form-select"
                value={formData.Manager_ID}
                onChange={(e) => setFormData({ ...formData, Manager_ID: e.target.value })}
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m.User_ID} value={m.User_ID}>
                    {m.Full_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contractor</label>
              <select
                className="form-select"
                value={formData.Contractor_ID}
                onChange={(e) => setFormData({ ...formData, Contractor_ID: e.target.value })}
              >
                <option value="">Select Contractor</option>
                {contractors.map((c) => (
                  <option key={c.Contractor_ID} value={c.Contractor_ID}>
                    {c.Contractor_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Construction Project"
        message={`Are you sure you want to delete "${selectedProject?.Project_Name}"? All associated tasks, milestones, budgets, expenses, and materials will be permanently removed.`}
        confirmText="Delete Project"
      />
    </div>
  );
};

export default Projects;
