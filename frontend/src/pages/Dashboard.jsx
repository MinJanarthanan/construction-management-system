import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Building2,
  IndianRupee,
  CheckSquare,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Package,
  FileText,
  Activity,
  ShieldAlert,
  ClipboardList,
  Clock,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const TASK_COLORS = {
  'Done': '#10b981',
  'In-Progress': '#3b82f6',
  'Open': '#f59e0b',
  'Blocked': '#ef4444'
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [formStats, setFormStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, formsRes] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/forms/stats')
        ]);
        setData(dashRes.data);
        if (formsRes.data.success) {
          setFormStats(formsRes.data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Unable to load construction telemetry.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading construction telemetry & analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)' }}>{error || 'Error loading dashboard'}</p>
      </div>
    );
  }

  const { kpis, taskStatusCounts, expensesByCategory, budgetVsSpentByProject, lowStockMaterials, upcomingMilestones } = data;

  const taskPieData = Object.entries(taskStatusCounts || {}).map(([name, value]) => ({
    name,
    value
  }));

  const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Project Dashboard</h1>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Live Database</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Centralized role-based construction telemetry across 8 active job sites
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/forms" className="btn btn-secondary">
            <ClipboardList size={16} />
            <span>Site Forms (10k)</span>
          </Link>
          <Link to="/projects" className="btn btn-primary">
            <span>Manage Projects</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid-4">
        <StatCard
          title="Active Projects"
          value={`${kpis.activeProjects} / ${kpis.totalProjects}`}
          subtext={`${kpis.completedProjects} Completed projects`}
          icon={Building2}
          color="#6366f1"
        />
        <StatCard
          title="Approved Budget"
          value={formatCurrency(kpis.totalApprovedBudget)}
          subtext={`Spent: ${formatCurrency(kpis.totalSpent)}`}
          icon={IndianRupee}
          color="#10b981"
        />
        <StatCard
          title="Total Tasks"
          value={kpis.totalTasks}
          subtext={`${kpis.finishedTasks || taskStatusCounts['Done'] || 0} finished`}
          icon={CheckSquare}
          color="#06b6d4"
        />
        <StatCard
          title="Low-Stock Items"
          value={kpis.lowStockCount}
          subtext={kpis.lowStockCount > 0 ? "Requires restock replenishment" : "Inventory healthy"}
          icon={AlertTriangle}
          color={kpis.lowStockCount > 0 ? "#ef4444" : "#10b981"}
        />
      </div>

      {/* Primary Charts: Financials & Task Distribution */}
      <div className="grid-2">
        {/* Budget vs Actual Spend by Project */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Budget vs. Actual Spent</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Approved capital allocation vs expenses incurred</p>
            </div>
            <TrendingUp size={20} color="var(--accent-primary)" />
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsSpentByProject} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [formatCurrency(value), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="budget" name="Approved Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Total Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Breakdown Donut */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Task Distribution</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status breakdown across active site workflows</p>
            </div>
            <CheckSquare size={20} color="var(--accent-secondary)" />
          </div>

          <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {taskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TASK_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NEW FROM REAL DATASET: SITE FORMS QUALITY & SAFETY INTELLIGENCE SECTION */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={22} color="var(--accent-secondary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Site Inspection Forms Intelligence</h2>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Real Dataset (10,254 Rows)</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Historical quality, safety, and site diary logs across 8 projects (2019-02 to 2020-09)
            </p>
          </div>
          <Link to="/forms" style={{ fontSize: '0.8125rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
            Open Filterable Form Explorer →
          </Link>
        </div>

        {/* Action Metrics Row */}
        {formStats && formStats.actionMetrics && (
          <div className="grid-4">
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Forms Logged</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>10,254</p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--success)' }}>100% Ingested & Verified</span>
            </div>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Forms with Open Actions</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                {formStats.actionMetrics.FormsWithOpenActions?.toLocaleString() || 0}
              </p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--warning)' }}>Requires site follow-up</span>
            </div>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Open Action Items</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>
                {formStats.actionMetrics.TotalOpenActions?.toLocaleString() || 0}
              </p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Across all 8 job sites</span>
            </div>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stale Open Forms (&gt;30d)</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7', marginTop: '0.25rem' }}>
                {formStats.actionMetrics.StaleOpenForms?.toLocaleString() || 0}
              </p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Derived from Status Changed</span>
            </div>
          </div>
        )}

        {/* Charts: Forms per Month & Forms by Group */}
        <div className="grid-2">
          {/* (a) Forms Per Month Line / Area Chart */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Forms Logged per Month (2019-02 to 2020-09)</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Timeline cadence of field diary & safety records</p>
            </div>
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formStats?.formsPerMonth || []} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="Month" stroke="var(--text-muted)" fontSize={10} interval={1} angle={-30} textAnchor="end" />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="Count" name="Total Forms" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* (b) Forms by Report Forms Group Bar Chart */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Forms by Report Forms Group</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Distribution across Quality, Safety, Site Mgmt & Design</p>
            </div>
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formStats?.formsByGroup || []} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis type="category" dataKey="ReportGroup" stroke="var(--text-muted)" fontSize={11} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="Count" name="Forms Count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {(formStats?.formsByGroup || []).map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts: (c) Open vs Closed by Project & (d) Top 10 Raw Statuses */}
        <div className="grid-2">
          {/* (c) Open vs Closed by Project */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Open vs. Closed Forms by Project</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Resolution ratio across 8 construction sites</p>
            </div>
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formStats?.openVsClosedByProject || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="Project_Name" stroke="var(--text-muted)" fontSize={10} interval={0} angle={-20} textAnchor="end" />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="ClosedForms" name="Closed Forms" fill="#10b981" stackId="a" />
                  <Bar dataKey="OpenForms" name="Open Forms" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* (d) Top 10 Raw Statuses Table */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Top 10 Raw Status Categories</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Frequent status states preserved from field diaries</p>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Status Category</th>
                    <th>Class</th>
                    <th style={{ textAlign: 'right' }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {(formStats?.topStatuses || []).map((s, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{s.Status}</td>
                      <td>
                        <span className={`badge ${s.StatusClass === 'Open' ? 'badge-warning' : s.StatusClass === 'Closed' ? 'badge-success' : ''}`}>
                          {s.StatusClass}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                        {s.Count?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Widgets: Low Stock Alerts & Upcoming Milestones */}
      <div className="grid-2">
        {/* Low Stock Alerts */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--danger)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Low-Stock Material Alerts</h3>
            </div>
            <Link to="/materials" style={{ fontSize: '0.8125rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
              View Inventory →
            </Link>
          </div>

          {lowStockMaterials.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              All inventory levels are above safety threshold.
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Project</th>
                    <th>Remaining Stock</th>
                    <th>Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockMaterials.slice(0, 4).map((m) => (
                    <tr key={m.Material_ID}>
                      <td style={{ fontWeight: 600 }}>{m.Material_Name}</td>
                      <td>Project #{m.Project_ID}</td>
                      <td>
                        <span className="badge badge-danger">
                          {m.Quantity} {m.Unit}
                        </span>
                      </td>
                      <td>₹{parseFloat(m.Unit_Cost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Milestones */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Upcoming Key Milestones</h3>
            </div>
            <Link to="/projects" style={{ fontSize: '0.8125rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
              All Projects →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingMilestones.map((ms) => (
              <div
                key={ms.Milestone_ID}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{ms.Milestone_Name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ms.project?.Project_Name || `Project #${ms.Project_ID}`} • Due: {ms.Due_Date}
                  </p>
                </div>
                <StatusBadge status={ms.Status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
