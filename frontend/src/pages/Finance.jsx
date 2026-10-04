import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { IndianRupee, Plus, Search, Filter, Calendar, Trash2, PieChart as ChartIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const Finance = () => {
  const { isAdmin, isProjectManager, isAccountant } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    Project_ID: '',
    Category: 'Material',
    Amount: '',
    Expense_Date: new Date().toISOString().split('T')[0],
    Description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [expRes, budRes, projRes] = await Promise.all([
        api.get('/expenses', {
          params: {
            search: search || undefined,
            projectId: projectFilter || undefined,
            category: categoryFilter || undefined
          }
        }),
        api.get('/budgets'),
        api.get('/projects')
      ]);
      setExpenses(expRes.data.expenses || []);
      setTotalSpent(expRes.data.totalAmount || 0);
      setBudgets(budRes.data.budgets || []);
      setProjects(projRes.data.projects || []);
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [search, projectFilter, categoryFilter]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/expenses', expenseForm);
      setIsExpenseModalOpen(false);
      fetchFinanceData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchFinanceData();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const totalApprovedBudget = budgets.reduce((sum, b) => sum + parseFloat(b.Approved_Budget || 0), 0);
  const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Finance & Cost Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Multi-project budgets, cost categories, and expense transaction ledgers
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setExpenseForm({
              Project_ID: projects[0]?.Project_ID || '',
              Category: 'Material',
              Amount: '',
              Expense_Date: new Date().toISOString().split('T')[0],
              Description: ''
            });
            setFormError('');
            setIsExpenseModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Top Financial Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Approved Capital</span>
          <h3 style={{ fontSize: '1.625rem', fontWeight: 700, marginTop: '0.25rem' }}>{formatCurrency(totalApprovedBudget)}</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Across {budgets.length} allocated projects</p>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Recorded Expenses</span>
          <h3 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>{formatCurrency(totalSpent)}</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{expenses.length} transaction entries</p>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Remaining Variance</span>
          <h3 style={{ fontSize: '1.625rem', fontWeight: 700, color: totalApprovedBudget - totalSpent >= 0 ? 'var(--info)' : 'var(--danger)', marginTop: '0.25rem' }}>
            {formatCurrency(totalApprovedBudget - totalSpent)}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {totalApprovedBudget > 0 ? ((totalSpent / totalApprovedBudget) * 100).toFixed(1) : 0}% capital utilized
          </p>
        </div>
      </div>

      {/* Expense Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search description or invoice..."
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Labor">Labor</option>
          <option value="Material">Material</option>
          <option value="Equipment">Equipment</option>
          <option value="Misc">Misc</option>
        </select>
      </div>

      {/* Expense Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Project</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading expense ledger...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No expense records match the search filters.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.Expense_ID}>
                  <td>{exp.Expense_Date}</td>
                  <td style={{ color: 'var(--accent-secondary)' }}>{exp.project?.Project_Name}</td>
                  <td><StatusBadge status={exp.Category} /></td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(exp.Amount)}</td>
                  <td>{exp.Description || '-'}</td>
                  <td>
                    {(isAdmin || isProjectManager || isAccountant) && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                        onClick={() => handleDeleteExpense(exp.Expense_ID)}
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

      {/* RECORD EXPENSE MODAL */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Record New Expense">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateExpense}>
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select
              className="form-select"
              required
              value={expenseForm.Project_ID}
              onChange={(e) => setExpenseForm({ ...expenseForm, Project_ID: e.target.value })}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={expenseForm.Category}
                onChange={(e) => setExpenseForm({ ...expenseForm, Category: e.target.value })}
              >
                <option value="Labor">Labor</option>
                <option value="Material">Material</option>
                <option value="Equipment">Equipment</option>
                <option value="Misc">Misc</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                required
                placeholder="0.00"
                value={expenseForm.Amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, Amount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Date *</label>
            <input
              type="date"
              className="form-control"
              required
              value={expenseForm.Expense_Date}
              onChange={(e) => setExpenseForm({ ...expenseForm, Expense_Date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Invoice Reference</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Scaffolding inspection fee"
              value={expenseForm.Description}
              onChange={(e) => setExpenseForm({ ...expenseForm, Description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsExpenseModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Recording...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;
