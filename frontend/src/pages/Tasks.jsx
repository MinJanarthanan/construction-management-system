import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { CheckSquare, Plus, Search, Filter, Calendar, User, Trash2 } from 'lucide-react';

const Tasks = () => {
  const { isAccountant } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    Project_ID: '',
    Task_Name: '',
    Assigned_To: '',
    Start_Date: new Date().toISOString().split('T')[0],
    Due_Date: '',
    Status: 'Open'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          projectId: projectFilter || undefined
        }
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAux = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(projRes.data.projects || []);
      setUsers(userRes.data.users || []);
    } catch (err) {
      console.error('Failed to load auxiliary data:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, projectFilter]);

  useEffect(() => {
    fetchAux();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { Status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/tasks', taskForm);
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Construction Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Site operations, engineer assignments, and progress tracking
          </p>
        </div>
        {!isAccountant && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setTaskForm({
                Project_ID: projects[0]?.Project_ID || '',
                Task_Name: '',
                Assigned_To: users[0]?.User_ID || '',
                Start_Date: new Date().toISOString().split('T')[0],
                Due_Date: '',
                Status: 'Open'
              });
              setFormError('');
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search task name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '200px' }}
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Blocked">Blocked</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Project</th>
              <th>Assignee</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No tasks match the selected criteria.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.Task_ID}>
                  <td style={{ fontWeight: 600 }}>{task.Task_Name}</td>
                  <td style={{ color: 'var(--accent-secondary)' }}>{task.project?.Project_Name}</td>
                  <td>{task.assignee ? task.assignee.Full_Name : 'Unassigned'}</td>
                  <td>{task.Start_Date}</td>
                  <td>{task.Due_Date}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                      value={task.Status}
                      onChange={(e) => handleUpdateStatus(task.Task_ID, e.target.value)}
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
                        onClick={() => handleDelete(task.Task_ID)}
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

      {/* CREATE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        {formError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{formError}</p>}
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select
              className="form-select"
              required
              value={taskForm.Project_ID}
              onChange={(e) => setTaskForm({ ...taskForm, Project_ID: e.target.value })}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.Project_ID} value={p.Project_ID}>{p.Project_Name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Task Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Inspect foundation pilings"
              value={taskForm.Task_Name}
              onChange={(e) => setTaskForm({ ...taskForm, Task_Name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Engineer / Supervisor</label>
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

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={taskForm.Status}
              onChange={(e) => setTaskForm({ ...taskForm, Status: e.target.value })}
            >
              <option value="Open">Open</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
