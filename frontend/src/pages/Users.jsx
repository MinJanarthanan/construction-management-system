import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { UserCheck, Plus, Search, Shield, Mail, Trash2, Edit2, Key } from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    Full_Name: '',
    Username: '',
    Email: '',
    Password: '',
    Role_ID: '1',
    Status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: { search: search || undefined, roleId: roleFilter || undefined }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/users/roles');
      setRoles(res.data.roles || []);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      Full_Name: '',
      Username: '',
      Email: '',
      Password: '',
      Role_ID: roles[0]?.Role_ID || '1',
      Status: 'Active'
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setForm({
      Full_Name: u.Full_Name,
      Username: u.Username,
      Email: u.Email,
      Password: '',
      Role_ID: u.Role_ID,
      Status: u.Status
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/auth/register', form);
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        Full_Name: form.Full_Name,
        Email: form.Email,
        Role_ID: form.Role_ID,
        Status: form.Status
      };
      if (form.Password) {
        payload.Password = form.Password;
      }
      await api.put(`/users/${selectedUser.User_ID}`, payload);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.User_ID) {
      alert('You cannot delete your own logged-in administrator account.');
      return;
    }
    if (!window.confirm('Delete this user account?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User Governance & RBAC</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            System accounts, role definitions, and access permissions
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by full name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '200px' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.Role_ID} value={r.Role_ID}>{r.Role_Name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>Account Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading user accounts...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.User_ID}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.Full_Name}</div>
                    {u.User_ID === currentUser?.User_ID && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--accent-secondary)' }}>(You)</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{u.Username}</td>
                  <td>{u.Email}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                      <Shield size={12} />
                      {u.role?.Role_Name}
                    </span>
                  </td>
                  <td><StatusBadge status={u.Status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User"
                      >
                        <Edit2 size={13} />
                      </button>
                      {u.User_ID !== currentUser?.User_ID && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDelete(u.User_ID)}
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Register New System User">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Johnathan Doe"
              value={form.Full_Name}
              onChange={(e) => setForm({ ...form, Full_Name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. john_site"
                value={form.Username}
                onChange={(e) => setForm({ ...form, Username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="john@buildcorp.com"
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password * (Minimum 6 characters)</label>
            <input
              type="password"
              className="form-control"
              required
              minLength={6}
              placeholder="••••••••"
              value={form.Password}
              onChange={(e) => setForm({ ...form, Password: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select
                className="form-select"
                value={form.Role_ID}
                onChange={(e) => setForm({ ...form, Role_ID: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.Role_ID} value={r.Role_ID}>{r.Role_Name} - {r.Description}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={form.Status}
                onChange={(e) => setForm({ ...form, Status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User & Permissions">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              required
              value={form.Full_Name}
              onChange={(e) => setForm({ ...form, Full_Name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              required
              value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select
                className="form-select"
                value={form.Role_ID}
                onChange={(e) => setForm({ ...form, Role_ID: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.Role_ID} value={r.Role_ID}>{r.Role_Name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={form.Status}
                onChange={(e) => setForm({ ...form, Status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
            <label className="form-label">Reset Password (Leave blank to keep unchanged)</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={form.Password}
              onChange={(e) => setForm({ ...form, Password: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
