import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  FileCheck2,
  Clock,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const SiteForms = () => {
  const [forms, setForms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, totalRecords: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ projects: [], types: [], groups: [], statuses: [] });
  
  // Active Filter state
  const [filters, setFilters] = useState({
    projectId: '',
    typeId: '',
    group: '',
    status: '',
    statusClass: '',
    startDate: '',
    endDate: '',
    search: '',
    hasOpenActions: false
  });

  // Fetch filter options on load
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/forms/filter-options');
        if (res.data.success) {
          setFilterOptions(res.data.options);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch paginated records whenever page or filters change
  const fetchForms = async (pageToFetch = pagination.page) => {
    try {
      setLoading(true);
      const params = {
        page: pageToFetch,
        pageSize: pagination.pageSize,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.typeId && { typeId: filters.typeId }),
        ...(filters.group && { group: filters.group }),
        ...(filters.status && { status: filters.status }),
        ...(filters.statusClass && { statusClass: filters.statusClass }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
        ...(filters.hasOpenActions && { hasOpenActions: true })
      };

      const res = await api.get('/forms', { params });
      if (res.data.success) {
        setForms(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load site forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(1);
  }, [filters.projectId, filters.typeId, filters.group, filters.status, filters.statusClass, filters.hasOpenActions]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchForms(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchForms(newPage);
    }
  };

  const handleExportCsv = () => {
    const queryParams = new URLSearchParams();
    if (filters.projectId) queryParams.append('projectId', filters.projectId);
    if (filters.typeId) queryParams.append('typeId', filters.typeId);
    if (filters.group) queryParams.append('group', filters.group);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.statusClass) queryParams.append('statusClass', filters.statusClass);
    if (filters.search) queryParams.append('search', filters.search);

    const exportUrl = `${api.defaults.baseURL || '/api'}/forms/export?${queryParams.toString()}`;
    window.open(exportUrl, '_blank');
  };

  const resetFilters = () => {
    setFilters({
      projectId: '',
      typeId: '',
      group: '',
      status: '',
      statusClass: '',
      startDate: '',
      endDate: '',
      search: '',
      hasOpenActions: false
    });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Site Inspection Forms</h1>
            <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
              Real Dataset: 10,254 Records
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Multi-site historical QA/QC, safety diaries, and inspection form logs across 8 projects (Feb 2019 – Sep 2020)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={15} />
            <span>Reset Filters</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportCsv}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Control Panel */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Project Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Project</label>
              <select
                className="form-control"
                value={filters.projectId}
                onChange={(e) => handleFilterChange('projectId', e.target.value)}
              >
                <option value="">All Projects (8 Sites)</option>
                {filterOptions.projects.map(p => (
                  <option key={p.Project_ID} value={p.Project_ID}>
                    Project #{p.Project_ID}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Group Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Report Group</label>
              <select
                className="form-control"
                value={filters.group}
                onChange={(e) => handleFilterChange('group', e.target.value)}
              >
                <option value="">All Groups (5 Groups)</option>
                {filterOptions.groups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Form Type Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Form Type</label>
              <select
                className="form-control"
                value={filters.typeId}
                onChange={(e) => handleFilterChange('typeId', e.target.value)}
              >
                <option value="">All Form Types (12 Types)</option>
                {filterOptions.types.map(t => (
                  <option key={t.Type_ID} value={t.Type_ID}>{t.Type_Name}</option>
                ))}
              </select>
            </div>

            {/* Status Class Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Status Class</label>
              <select
                className="form-control"
                value={filters.statusClass}
                onChange={(e) => handleFilterChange('statusClass', e.target.value)}
              >
                <option value="">All Classes (Open & Closed)</option>
                <option value="Open">Open (2,717)</option>
                <option value="Closed">Closed (7,535)</option>
              </select>
            </div>

            {/* Raw Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Raw Status</label>
              <select
                className="form-control"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All 26 Free-text Statuses</option>
                {filterOptions.statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar & Action Filter */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by Form Name, Reference Code (e.g. F145185.4), or Location..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={filters.hasOpenActions}
                onChange={(e) => handleFilterChange('hasOpenActions', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
              />
              <span style={{ color: filters.hasOpenActions ? 'var(--warning)' : 'var(--text-secondary)' }}>
                Only Show Forms with Open Actions
              </span>
            </label>

            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.55rem 1.25rem' }}>
              Filter Records
            </button>
          </div>
        </form>
      </div>

      {/* Table Results */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{forms.length > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{Math.min(pagination.page * pagination.pageSize, pagination.totalRecords)}</strong> of <strong style={{ color: 'var(--accent-secondary)' }}>{pagination.totalRecords.toLocaleString()}</strong> records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Page Size:</span>
            <select
              className="form-control"
              style={{ width: '75px', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
              value={pagination.pageSize}
              onChange={(e) => {
                setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10) }));
                setTimeout(() => fetchForms(1), 50);
              }}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading site forms from database...</p>
          </div>
        ) : forms.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>No site forms match your active filter criteria</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try clearing the search query or adjusting project/group filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Ref</th>
                  <th style={{ width: '90px' }}>Project</th>
                  <th>Form Name</th>
                  <th>Form Type</th>
                  <th>Group</th>
                  <th>Status (Raw)</th>
                  <th>Class</th>
                  <th>Created</th>
                  <th>Open Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.Form_ID}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                      {form.Source_Ref}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        #{form.Project_ID}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={form.Form_Name}>
                      {form.Form_Name}
                      {form.Location_Path && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={form.Location_Path}>
                          📍 {form.Location_Path.split('>').pop()}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {form.formType ? form.formType.Type_Name : '—'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {form.formType?.Report_Group || '—'}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      <span title={form.Form_Status}>
                        {form.Form_Status.length > 25 ? form.Form_Status.substring(0, 23) + '...' : form.Form_Status}
                      </span>
                    </td>
                    <td>
                      {form.Status_Class === 'Open' ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>Open</span>
                      ) : form.Status_Class === 'Closed' ? (
                        <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>Closed</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.6875rem' }}>Null</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {form.Created_Date}
                    </td>
                    <td>
                      {form.Open_Actions > 0 ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertCircle size={14} />
                          {form.Open_Actions} / {form.Total_Actions}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          0 / {form.Total_Actions}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.totalPages || 1}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(1)}
              title="First Page"
            >
              « First
            </button>

            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>

            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.totalPages)}
              title="Last Page"
            >
              Last »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteForms;
