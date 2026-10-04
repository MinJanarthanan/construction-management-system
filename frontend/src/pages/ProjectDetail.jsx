import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Building2,
  ArrowLeft,
  Calendar,
  User,
  Users,
  CheckSquare,
  Milestone as MilestoneIcon,
  DollarSign,
  Wrench,
  Package,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  TrendingUp,
  Tag
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { isAdmin, isProjectManager, isSiteEngineer, isAccountant, isSiteSupervisor } = useAuth();
  
  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Forms
  const [taskForm, setTaskForm] = useState({ Task_Name: '', Assigned_To: '', Start_Date: '', Due_Date: '', Status: 'Open' });
  const [milestoneForm, setMilestoneForm] = useState({ Milestone_Name: '', Description: '', Due_Date: '', Status: 'Pending' });
  const [expenseForm, setExpenseForm] = useState({ Category: 'Material', Amount: '', Expense_Date: '', Description: '' });
  const [resourceForm, setResourceForm] = useState({ Resource_Name: '', Type: 'Equipment', Quantity: '1', Unit: 'Units', Remarks: '' });
  const [materialForm, setMaterialForm] = useState({ Material_Name: '', Quantity: '', Unit: 'ton', Unit_Cost: '' });
  const [budgetForm, setBudgetForm] = useState({ Total_Budget: '', Approved_Budget: '', Remarks: '' });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, summaryRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/summary`),
        api.get('/users')
      ]);
      setProject(projRes.data.project);
      setSummary(summaryRes.data.summary);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/tasks', { ...taskForm, Project_ID: id });
      setIsTaskModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { Status: newStatus });
      fetchProjectData();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/milestones', { ...milestoneForm, Project_ID: id });
      setIsMilestoneModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId, newStatus) => {
    try {
      await api.put(`/milestones/${milestoneId}`, { Status: newStatus });
      fetchProjectData();
    } catch (err) {
      console.error('Failed to update milestone status:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await api.delete(`/milestones/${milestoneId}`);
      fetchProjectData();
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/expenses', { ...expenseForm, Project_ID: id });
      setIsExpenseModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchProjectData();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/resources', { ...resourceForm, Project_ID: id });
      setIsResourceModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to allocate resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Remove this resource allocation?')) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      fetchProjectData();
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/materials', { ...materialForm, Project_ID: id });
      setIsMaterialModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to add material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Delete this material record?')) return;
    try {
      await api.delete(`/materials/${materialId}`);
      fetchProjectData();
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/budgets', { ...budgetForm, Project_ID: id });
      setIsBudgetModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Loading project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)' }}>Project not found.</p>
        <Link to="/projects" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  const { financials, tasks: taskStats, milestones: milestoneStats, inventory } = summary || {};

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div>
        <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{project.Project_Name}</h1>
            <StatusBadge status={project.Status} />
          </div>
          {(isAdmin || isProjectManager || isAccountant) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setBudgetForm({
                  Total_Budget: project.budget?.Total_Budget || '',
                  Approved_Budget: project.budget?.Approved_Budget || '',
                  Remarks: project.budget?.Remarks || ''
                });
                setIsBudgetModalOpen(true);
              }}
            >
              <DollarSign size={15} />
              <span>Configure Budget</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview', icon: Building2 },
          { id: 'tasks', label: `Tasks (${project.tasks?.length || 0})`, icon: CheckSquare },
          { id: 'milestones', label: `Milestones (${project.milestones?.length || 0})`, icon: MilestoneIcon },
          { id: 'finance', label: 'Budget & Expenses', icon: DollarSign },
          { id: 'resources', label: `Resources (${project.resources?.length || 0})`, icon: Wrench },
          { id: 'materials', label: `Materials (${project.materials?.length || 0})`, icon: Package }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-3">
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timeline</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Calendar size={18} color="var(--accent-secondary)" />
                <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{project.Start_Date} to {project.End_Date}</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project Manager</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <User size={18} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{project.manager?.Full_Name || 'Unassigned'}</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contractor</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Users size={18} color="var(--warning)" />
                <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{project.contractor?.Contractor_Name || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Financial Health */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '1rem' }}>Financial Utilization</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Approved Budget:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(financials?.approvedBudget)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Spent:</span>
                  <strong style={{ color: 'var(--success)' }}>{formatCurrency(financials?.totalSpent)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Remaining Variance:</span>
                  <strong style={{ color: financials?.remainingBudget >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                    {formatCurrency(financials?.remainingBudget)}
                  </strong>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget Burn Rate</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{financials?.burnRatePercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(financials?.burnRatePercent || 0, 100)}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task & Milestone Progress */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '1rem' }}>Execution Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Task Completion ({taskStats?.done}/{taskStats?.total})</span>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{taskStats?.completionPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${taskStats?.completionPercent || 0}%`, height: '100%', backgroundColor: 'var(--accent-secondary)' }}></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Milestones Achieved</p>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                      {milestoneStats?.achieved} / {milestoneStats?.total}
                    </h4>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Stock Materials</p>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: inventory?.lowStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {inventory?.lowStockCount} items
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Project Tasks</h3>
            {!isAccountant && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setTaskForm({ Task_Name: '', Assigned_To: users[0]?.User_ID || '', Start_Date: new Date().toISOString().split('T')[0], Due_Date: '', Status: 'Open' });
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Add Task</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Assignee</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No tasks created for this project yet.
                    </td>
                  </tr>
                ) : (
                  project.tasks?.map((t) => (
                    <tr key={t.Task_ID}>
                      <td style={{ fontWeight: 600 }}>{t.Task_Name}</td>
                      <td>{t.assignee?.Full_Name || 'Unassigned'}</td>
                      <td>{t.Start_Date} to {t.Due_Date}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                          value={t.Status}
                          onChange={(e) => handleUpdateTaskStatus(t.Task_ID, e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="In-Progress">In-Progress</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Done">Done</option>
                        </select>
                      </td>
                      <td>
                        {!isAccountant && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                            onClick={() => handleDeleteTask(t.Task_ID)}
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
        </div>
      )}

      {/* TAB 3: MILESTONES */}
      {activeTab === 'milestones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Key Milestones</h3>
            {(isAdmin || isProjectManager || isSiteEngineer) && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setMilestoneForm({ Milestone_Name: '', Description: '', Due_Date: '', Status: 'Pending' });
                  setIsMilestoneModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Add Milestone</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Description</th>
                  <th>Target Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.milestones?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No milestones registered yet.
                    </td>
                  </tr>
                ) : (
                  project.milestones?.map((m) => (
                    <tr key={m.Milestone_ID}>
                      <td style={{ fontWeight: 600 }}>{m.Milestone_Name}</td>
                      <td>{m.Description || '-'}</td>
                      <td>{m.Due_Date}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                          value={m.Status}
                          onChange={(e) => handleUpdateMilestoneStatus(m.Milestone_ID, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Achieved">Achieved</option>
                          <option value="Delayed">Delayed</option>
                        </select>
                      </td>
                      <td>
                        {(isAdmin || isProjectManager || isSiteEngineer) && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                            onClick={() => handleDeleteMilestone(m.Milestone_ID)}
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
        </div>
      )}

      {/* TAB 4: FINANCE & EXPENSES */}
      {activeTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Project Expenses</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Total Recorded: <strong style={{ color: 'var(--success)' }}>{formatCurrency(financials?.totalSpent)}</strong>
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setExpenseForm({ Category: 'Material', Amount: '', Expense_Date: new Date().toISOString().split('T')[0], Description: '' });
                setIsExpenseModalOpen(true);
              }}
            >
              <Plus size={15} />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.expenses?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No expenses logged for this project yet.
                    </td>
                  </tr>
                ) : (
                  project.expenses?.map((e) => (
                    <tr key={e.Expense_ID}>
                      <td>{e.Expense_Date}</td>
                      <td>
                        <StatusBadge status={e.Category} />
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(e.Amount)}</td>
                      <td>{e.Description || '-'}</td>
                      <td>
                        {(isAdmin || isProjectManager || isAccountant) && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                            onClick={() => handleDeleteExpense(e.Expense_ID)}
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
        </div>
      )}

      {/* TAB 5: RESOURCES */}
      {activeTab === 'resources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Allocated Resources & Labor</h3>
            {!isAccountant && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setResourceForm({ Resource_Name: '', Type: 'Equipment', Quantity: '1', Unit: 'Units', Remarks: '' });
                  setIsResourceModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Allocate Resource</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Type</th>
                  <th>Quantity / Unit</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.resources?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No equipment or labor crews allocated yet.
                    </td>
                  </tr>
                ) : (
                  project.resources?.map((r) => (
                    <tr key={r.Resource_ID}>
                      <td style={{ fontWeight: 600 }}>{r.Resource_Name}</td>
                      <td><StatusBadge status={r.Type} /></td>
                      <td>{parseFloat(r.Quantity)} {r.Unit}</td>
                      <td>{r.Remarks || '-'}</td>
                      <td>
                        {!isAccountant && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                            onClick={() => handleDeleteResource(r.Resource_ID)}
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
        </div>
      )}

      {/* TAB 6: MATERIALS */}
      {activeTab === 'materials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Site Materials & Inventory</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Total Material Valuation: <strong>{formatCurrency(inventory?.totalMaterialCost)}</strong>
              </p>
            </div>
            {!isAccountant && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setMaterialForm({ Material_Name: '', Quantity: '', Unit: 'ton', Unit_Cost: '' });
                  setIsMaterialModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Add Material</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Stock Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost (Auto-Calc)</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.materials?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No materials cataloged for this project yet.
                    </td>
                  </tr>
                ) : (
                  project.materials?.map((m) => {
                    const isLow = parseFloat(m.Quantity) <= 10;
                    return (
                      <tr key={m.Material_ID}>
                        <td style={{ fontWeight: 600 }}>{m.Material_Name}</td>
                        <td>{parseFloat(m.Quantity)} {m.Unit}</td>
                        <td>₹{parseFloat(m.Unit_Cost).toFixed(2)}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(m.Total_Cost)}</td>
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
                              onClick={() => handleDeleteMaterial(m.Material_ID)}
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
        </div>
      )}

      {/* TASK MODAL */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign New Task">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Task Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Pour level 3 slab"
              value={taskForm.Task_Name}
              onChange={(e) => setTaskForm({ ...taskForm, Task_Name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select
              className="form-select"
              value={taskForm.Assigned_To}
              onChange={(e) => setTaskForm({ ...taskForm, Assigned_To: e.target.value })}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.User_ID} value={u.User_ID}>{u.Full_Name} ({u.role?.Role_Name})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={taskForm.Start_Date}
                onChange={(e) => setTaskForm({ ...taskForm, Start_Date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={taskForm.Due_Date}
                onChange={(e) => setTaskForm({ ...taskForm, Due_Date: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>Create Task</button>
          </div>
        </form>
      </Modal>

      {/* MILESTONE MODAL */}
      <Modal isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)} title="Add Milestone">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateMilestone}>
          <div className="form-group">
            <label className="form-label">Milestone Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Substructure Certification"
              value={milestoneForm.Milestone_Name}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, Milestone_Name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Key criteria or deliverables"
              value={milestoneForm.Description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, Description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Due Date *</label>
            <input
              type="date"
              className="form-control"
              required
              value={milestoneForm.Due_Date}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, Due_Date: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMilestoneModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>Save Milestone</button>
          </div>
        </form>
      </Modal>

      {/* EXPENSE MODAL */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Record Project Expense">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateExpense}>
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
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Concrete mix delivery invoice #412"
              value={expenseForm.Description}
              onChange={(e) => setExpenseForm({ ...expenseForm, Description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsExpenseModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>Log Expense</button>
          </div>
        </form>
      </Modal>

      {/* RESOURCE MODAL */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title="Allocate Resource">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateResource}>
          <div className="form-group">
            <label className="form-label">Resource Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. 50-Ton Mobile Hydraulic Crane"
              value={resourceForm.Resource_Name}
              onChange={(e) => setResourceForm({ ...resourceForm, Resource_Name: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className="form-select"
                value={resourceForm.Type}
                onChange={(e) => setResourceForm({ ...resourceForm, Type: e.target.value })}
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
                value={resourceForm.Quantity}
                onChange={(e) => setResourceForm({ ...resourceForm, Quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Units / Workers"
                value={resourceForm.Unit}
                onChange={(e) => setResourceForm({ ...resourceForm, Unit: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Remarks</label>
            <input
              type="text"
              className="form-control"
              placeholder="Shift schedule or operator specifications"
              value={resourceForm.Remarks}
              onChange={(e) => setResourceForm({ ...resourceForm, Remarks: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResourceModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>Save Resource</button>
          </div>
        </form>
      </Modal>

      {/* MATERIAL MODAL */}
      <Modal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} title="Catalog Project Material">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateMaterial}>
          <div className="form-group">
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Grade 60 Rebar 25mm"
              value={materialForm.Material_Name}
              onChange={(e) => setMaterialForm({ ...materialForm, Material_Name: e.target.value })}
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
                value={materialForm.Quantity}
                onChange={(e) => setMaterialForm({ ...materialForm, Quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="ton, bag, m³"
                value={materialForm.Unit}
                onChange={(e) => setMaterialForm({ ...materialForm, Unit: e.target.value })}
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
                value={materialForm.Unit_Cost}
                onChange={(e) => setMaterialForm({ ...materialForm, Unit_Cost: e.target.value })}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            * Total cost is auto-calculated as Quantity × Unit Cost. Items with Quantity ≤ 10 trigger low-stock alerts.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMaterialModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>Add Material</button>
          </div>
        </form>
      </Modal>

      {/* BUDGET CONFIG MODAL */}
      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Configure Project Budget">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleSaveBudget}>
          <div className="form-group">
            <label className="form-label">Total Allocated Budget (₹) *</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              required
              value={budgetForm.Total_Budget}
              onChange={(e) => setBudgetForm({ ...budgetForm, Total_Budget: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Approved Budget (₹) *</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              required
              value={budgetForm.Approved_Budget}
              onChange={(e) => setBudgetForm({ ...budgetForm, Approved_Budget: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Remarks / Tranche Notes</label>
            <input
              type="text"
              className="form-control"
              value={budgetForm.Remarks}
              onChange={(e) => setBudgetForm({ ...budgetForm, Remarks: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsBudgetModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>Save Budget</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
