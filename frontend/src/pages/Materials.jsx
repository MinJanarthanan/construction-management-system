import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  DollarSign,
  Trash2,
  Filter,
  Layers
} from 'lucide-react';

const Materials = () => {
  const { isAccountant } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    Project_ID: '',
    Material_Name: '',
    Quantity: '',
    Unit: 'ton',
    Unit_Cost: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials', {
        params: {
          search: search || undefined,
          projectId: projectFilter || undefined,
          lowStockOnly: lowStockOnly ? 'true' : undefined
        }
      });
      setMaterials(res.data.materials || []);
      setLowStockCount(res.data.lowStockCount || 0);
      setTotalCost(res.data.totalInventoryCost || 0);
    } catch (err) {
      console.error('Failed to load materials:', err);
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
    fetchMaterials();
  }, [search, projectFilter, lowStockOnly]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/materials', form);
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material record?')) return;
    try {
      await api.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Materials & Inventory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Material requisition, unit cost calculation, and low-stock replenishment alerts
          </p>
        </div>
        {!isAccountant && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm({
                Project_ID: projects[0]?.Project_ID || '',
                Material_Name: '',
                Quantity: '',
                Unit: 'ton',
                Unit_Cost: ''
              });
              setFormError('');
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Add Material</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Cataloged Items</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{materials.length}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Inventory Valuation</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(totalCost)}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: lowStockCount > 0 ? 'var(--danger-bg)' : 'rgba(16, 185, 129, 0.15)', color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Low Stock Alert (&le; 10 units)</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: lowStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {lowStockCount} items
            </h3>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search material name..."
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            style={{ accentColor: 'var(--danger)', width: '16px', height: '16px' }}
          />
          <span>Show Low Stock Only</span>
        </label>
      </div>

      {/* Materials Inventory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Project</th>
              <th>Stock Quantity</th>
              <th>Unit Cost</th>
              <th>Total Cost (Computed)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading materials inventory...
                </td>
              </tr>
            ) : materials.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No materials match the filter criteria.
                </td>
              </tr>
            ) : (
              materials.map((m) => {
                const isLow = m.isLowStock || parseFloat(m.Quantity) <= 10;
                return (
                  <tr key={m.Material_ID}>
                    <td style={{ fontWeight: 600 }}>{m.Material_Name}</td>
                    <td style={{ color: 'var(--accent-secondary)' }}>{m.project?.Project_Name}</td>
                    <td>{parseFloat(m.Quantity)} {m.Unit}</td>
                    <td>₹{parseFloat(m.Unit_Cost).toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(m.Total_Cost)}</td>
                    <td>
                      {isLow ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} />
                          Low Stock
                        </span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      {!isAccountant && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleDelete(m.Material_ID)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MATERIAL MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Material to Inventory">
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
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Portland Cement Type II"
              value={form.Material_Name}
              onChange={(e) => setForm({ ...form, Material_Name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                required
                placeholder="0"
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
                placeholder="bag, ton, m³"
                value={form.Unit}
                onChange={(e) => setForm({ ...form, Unit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Cost (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                required
                placeholder="0.00"
                value={form.Unit_Cost}
                onChange={(e) => setForm({ ...form, Unit_Cost: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Save Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Materials;
