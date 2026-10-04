import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = '#6366f1', trend }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: `${color}18`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${color}30`
          }}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {subtext && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {trend && (
            <span style={{ color: trend > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
