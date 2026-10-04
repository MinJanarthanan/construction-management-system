import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Users, Plus, Search, Phone, Mail, MapPin, Building2, Trash2, Edit2 } from 'lucide-react';

const Contractors = () => {
  const { isAdmin, isProjectManager } = useAuth();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    Contractor_Name: '',
    Phone: '',
    Email: '',
    Address: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contractors', {
        params: { search: search || undefined }
      });
      setContractors(res.data.contractors || []);
    } catch (err) {
      console.error('Failed to load contractors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [search]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setForm({ Contractor_Name: '', Phone: '', Email: '', Address: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditMode(true);
    setSelectedId(c.Contractor_ID);
    setForm({
      Contractor_Name: c.Contractor_Name,
      Phone: c.Phone,
      Email: c.Email,
      Address: c.Address
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (isEditMode) {
        await api.put(`/contractors/${selectedId}`, form);
      } else {
        await api.post('/contractors', form);
      }
      setIsModalOpen(false);
      fetchContractors();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save contractor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contractor profile?')) return;
    try {
      await api.delete(`/contractors/${id}`);
      fetchContractors();
    } catch (err) {
      console.error('Failed to delete contractor:', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Contractors Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            External vendor profiles, contact details, and project agreements
          </p>
        </div>
        {(isAdmin || isProjectManager) && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            <span>Add Contractor</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search contractor name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading contractor partners...
        </div>
      ) : contractors.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No contractors found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Register new contractor partners using the button above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {contractors.map((c) => (
            <div key={c.Contractor_ID} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.Contractor_Name}
                  </h3>
                  <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                    {c.projectCount || 0} Projects
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={15} color="var(--accent-secondary)" />
                    <span>{c.Phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={15} color="var(--accent-primary)" />
                    <span>{c.Email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <MapPin size={15} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ lineHeight: 1.4 }}>{c.Address}</span>
                  </div>
                </div>

                {/* Assigned Projects Pills */}
                {c.projects && c.projects.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Active Engagements
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {c.projects.map((p) => (
                        <span key={p.Project_ID} style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}>
                          {p.Project_Name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(isAdmin || isProjectManager) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(c)}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => handleDelete(c.Contractor_ID)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Contractor' : 'Register New Contractor'}>
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Contractor Organization Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Apex Structural Foundations Ltd"
              value={form.Contractor_Name}
              onChange={(e) => setForm({ ...form, Contractor_Name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="+1-555-0192"
                value={form.Phone}
                onChange={(e) => setForm({ ...form, Phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="contact@contractor.com"
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Office / Yard Address *</label>
            <textarea
              className="form-control"
              rows={2}
              required
              placeholder="Enter physical address..."
              value={form.Address}
              onChange={(e) => setForm({ ...form, Address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEditMode ? 'Update Contractor' : 'Create Contractor')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Contractors;
