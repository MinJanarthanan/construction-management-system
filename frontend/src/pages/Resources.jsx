import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Wrench, Plus, Search, Filter, Trash2, Users, Truck, Briefcase } from 'lucide-react';

const Resources = () => {
  const { isAccountant } = useAuth();
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    Project_ID: '',
    Resource_Name: '',
    Type: 'Equipment',
    Quantity: '1',
    Unit: 'Units',
    Remarks: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources', {
        params: {
          search: search || undefined,
          projectId: projectFilter || undefined,
          type: typeFilter || undefined
        }
      });
      setResources(res.data.resources || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search, projectFilter, typeFilter]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/resources', form);
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to allocate resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource allocation?')) return;
    try {
      await api.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const equipmentCount = resources.filter(r => r.Type === 'Equipment').length;
  const manpowerCount = resources.filter(r => r.Type === 'Manpower').length;
  const subcontractCount = resources.filter(r => r.Type === 'Subcontract').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Resources & Labor</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Heavy machinery, labor crews, and subcontractor assignments
          </p>
        </div>
        {!isAccountant && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm({
                Project_ID: projects[0]?.Project_ID || '',
                Resource_Name: '',
                Type: 'Equipment',
                Quantity: '1',
                Unit: 'Units',
                Remarks: ''
              });
              setFormError('');
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Allocate Resource</span>
          </button>
        )}
      </div>

      {/* Resource Type Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Equipment / Machinery</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{equipmentCount} allocations</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Manpower / Crews</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{manpowerCount} teams</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Subcontract Units</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{subcontractCount} contracts</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '220px' }}
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: '160px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Equipment">Equipment</option>
          <option value="Manpower">Manpower</option>
          <option value="Subcontract">Subcontract</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Type</th>
              <th>Project</th>
              <th>Quantity / Unit</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading resources...
                </td>
              </tr>
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No resources found for current filters.
                </td>
              </tr>
            ) : (
              resources.map((r) => (
                <tr key={r.Resource_ID}>
                  <td style={{ fontWeight: 600 }}>{r.Resource_Name}</td>
                  <td><StatusBadge status={r.Type} /></td>
                  <td style={{ color: 'var(--accent-secondary)' }}>{r.project?.Project_Name}</td>
                  <td>{parseFloat(r.Quantity)} {r.Unit}</td>
                  <td>{r.Remarks || '-'}</td>
                  <td>
                    {!isAccountant && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                        onClick={() => handleDelete(r.Resource_ID)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Resource to Project">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select
              className="form-select"
              required
              value={form.Project_ID}
              onChange={(e) => setForm({ ...form, Project_ID: e.target.value })}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Resource Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Komatsu Hydraulic Excavator PC210"
              value={form.Resource_Name}
              onChange={(e) => setForm({ ...form, Resource_Name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className="form-select"
                value={form.Type}
                onChange={(e) => setForm({ ...form, Type: e.target.value })}
              >
                <option value="Equipment">Equipment</option>
                <option value="Manpower">Manpower</option>
                <option value="Subcontract">Subcontract</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                required
                value={form.Quantity}
                onChange={(e) => setForm({ ...form, Quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Units, Workers"
                value={form.Unit}
                onChange={(e) => setForm({ ...form, Unit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <input
              type="text"
              className="form-control"
              placeholder="Specifications or shift notes"
              value={form.Remarks}
              onChange={(e) => setForm({ ...form, Remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Allocation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;
