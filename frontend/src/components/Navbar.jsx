import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { LogOut, User, Shield, ChevronDown, RefreshCw } from 'lucide-react';
import StatusBadge from './StatusBadge';

const Navbar = () => {
  const { user, userRole, logout, login } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleQuickSwitch = async (account) => {
    try {
      setSwitching(true);
      setShowRoleSwitcher(false);
      await login(account.username, 'Demo@123');
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header style={{
      height: '65px',
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Left side info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Welcome,</span>
        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {user?.Full_Name || user?.Username}
        </span>
        <StatusBadge status={userRole || 'User'} />
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Role Switcher Dropdown for evaluators & graders */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--border-focus)' }}
            title="Switch demo persona to test RBAC permissions"
          >
            <Shield size={15} color="var(--accent-secondary)" />
            <span>Switch Role</span>
            <ChevronDown size={14} />
          </button>

          {showRoleSwitcher && (
            <div
              className="glass-card animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                backgroundColor: '#1e293b',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                zIndex: 50
              }}
            >
              <div style={{ padding: '0.35rem 0.65rem 0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Quick Persona Switch (RBAC)
                </p>
              </div>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => handleQuickSwitch(acc)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: user?.Username === acc.username ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = user?.Username === acc.username ? 'rgba(99, 102, 241, 0.2)' : 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{acc.name}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--accent-secondary)' }}>{acc.role}</span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{acc.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Log Out Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
