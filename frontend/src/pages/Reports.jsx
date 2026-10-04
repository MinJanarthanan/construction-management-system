import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  FileBarChart2,
  Download,
  Printer,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const [budgetReport, setBudgetReport] = useState(null);
  const [progressReport, setProgressReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('budget');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [bRes, pRes] = await Promise.all([
        api.get('/reports/budget-vs-actual'),
        api.get('/reports/project-progress')
      ]);
      setBudgetReport(bRes.data);
      setProgressReport(pRes.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const exportBudgetCSV = () => {
    if (!budgetReport?.report) return;
    const headers = ['Project ID', 'Project Name', 'Status', 'Contractor', 'Total Budget', 'Approved Budget', 'Total Spent', 'Variance', 'Burn Rate (%)', 'Labor Cost', 'Material Cost', 'Equipment Cost', 'Misc Cost'];
    const rows = budgetReport.report.map(r => [
      r.Project_ID,
      `"${r.Project_Name}"`,
      r.Status,
      `"${r.Contractor_Name}"`,
      r.Total_Budget,
      r.Approved_Budget,
      r.Total_Spent,
      r.Variance,
      r.Burn_Rate_Percent,
      r.Breakdown.Labor,
      r.Breakdown.Material,
      r.Breakdown.Equipment,
      r.Breakdown.Misc
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Budget_vs_Actual_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProgressCSV = () => {
    if (!progressReport?.progressReports) return;
    const headers = ['Project ID', 'Project Name', 'Status', 'Manager', 'Health', 'Total Tasks', 'Done Tasks', 'Task Progress (%)', 'Total Milestones', 'Achieved Milestones', 'Milestone Progress (%)'];
    const rows = progressReport.progressReports.map(r => [
      r.Project_ID,
      `"${r.Project_Name}"`,
      r.Status,
      `"${r.Manager_Name}"`,
      r.Health,
      r.Tasks.total,
      r.Tasks.done,
      r.Tasks.progressPercent,
      r.Milestones.total,
      r.Milestones.achieved,
      r.Milestones.progressPercent
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Project_Progress_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Generating analytical reports...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reports & Executive Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Comprehensive cost variance, progress telemetry, and exportable datasets
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={activeTab === 'budget' ? exportBudgetCSV : exportProgressCSV}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'budget' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('budget')}
        >
          <DollarSign size={15} />
          <span>Budget vs. Actual Variance</span>
        </button>
        <button
          className={`btn ${activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('progress')}
        >
          <CheckCircle2 size={15} />
          <span>Project Progress & Schedule Health</span>
        </button>
      </div>

      {/* TAB 1: BUDGET REPORT */}
      {activeTab === 'budget' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary KPIs */}
          <div className="grid-4">
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Approved Capital</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {formatCurrency(budgetReport?.summary?.overallApprovedBudget)}
              </h3>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Spent</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
                {formatCurrency(budgetReport?.summary?.overallTotalSpent)}
              </h3>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Variance Balance</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)', marginTop: '0.25rem' }}>
                {formatCurrency(budgetReport?.summary?.overallVariance)}
              </h3>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Overall Burn Rate</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                {budgetReport?.summary?.overallBurnRate}%
              </h3>
            </div>
          </div>

          {/* Detailed Data Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Contractor</th>
                  <th>Approved Budget</th>
                  <th>Total Spent</th>
                  <th>Variance</th>
                  <th>Burn Rate</th>
                  <th>Category Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {budgetReport?.report?.map((r) => (
                  <tr key={r.Project_ID}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.Project_Name}</div>
                      <StatusBadge status={r.Status} />
                    </td>
                    <td>{r.Contractor_Name}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(r.Approved_Budget)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(r.Total_Spent)}</td>
                    <td style={{ color: r.Variance >= 0 ? 'var(--text-primary)' : 'var(--danger)', fontWeight: 600 }}>
                      {formatCurrency(r.Variance)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{r.Burn_Rate_Percent}%</span>
                        <div style={{ width: '50px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(r.Burn_Rate_Percent, 100)}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>L: {formatCurrency(r.Breakdown.Labor)}</span> •{' '}
                        <span>M: {formatCurrency(r.Breakdown.Material)}</span> •{' '}
                        <span>E: {formatCurrency(r.Breakdown.Equipment)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRESS REPORT */}
      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Manager</th>
                  <th>Health</th>
                  <th>Task Completion</th>
                  <th>Milestones Achieved</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {progressReport?.progressReports?.map((p) => {
                  let healthBadge = 'badge-success';
                  if (p.Health === 'Warning') healthBadge = 'badge-warning';
                  if (p.Health === 'Critical') healthBadge = 'badge-danger';

                  return (
                    <tr key={p.Project_ID}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.Project_Name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.Start_Date} to {p.End_Date}
                        </span>
                      </td>
                      <td>{p.Manager_Name}</td>
                      <td>
                        <span className={`badge ${healthBadge}`}>
                          {p.Health}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${p.Tasks.progressPercent}%`, height: '100%', backgroundColor: 'var(--accent-secondary)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                            {p.Tasks.progressPercent}% ({p.Tasks.done}/{p.Tasks.total})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
                          {p.Milestones.achieved} / {p.Milestones.total}
                        </span>
                        {p.Milestones.delayed > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginLeft: '0.5rem' }}>
                            ({p.Milestones.delayed} Delayed)
                          </span>
                        )}
                      </td>
                      <td><StatusBadge status={p.Status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
