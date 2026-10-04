import React from 'react';

const StatusBadge = ({ status, type = 'default' }) => {
  if (!status) return null;

  let badgeClass = 'badge-secondary';

  const normalized = status.toLowerCase();

  if (['completed', 'done', 'achieved', 'active'].includes(normalized)) {
    badgeClass = 'badge-success';
  } else if (['in-progress', 'planned', 'equipment'].includes(normalized)) {
    badgeClass = 'badge-info';
  } else if (['on-hold', 'pending', 'open', 'manpower'].includes(normalized)) {
    badgeClass = 'badge-warning';
  } else if (['blocked', 'delayed', 'suspended', 'inactive', 'low stock'].includes(normalized)) {
    badgeClass = 'badge-danger';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
