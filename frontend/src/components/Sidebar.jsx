import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Package,
  Wrench,
  DollarSign,
  Users,
  UserCheck,
  FileBarChart2,
  HardHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { isAdmin, isAccountant, isSiteSupervisor } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: Building2 },
    ...(!isAccountant ? [
      { to: '/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/materials', label: 'Materials & Stock', icon: Package },
      { to: '/resources', label: 'Resources & Labor', icon: Wrench },
    ] : []),
    ...(isAdmin || isAccountant || !isSiteSupervisor ? [
      { to: '/finance', label: 'Finance & Budgets', icon: DollarSign },
      { to: '/contractors', label: 'Contractors', icon: Users },
    ] : []),
    ...(isAdmin ? [
      { to: '/users', label: 'User Governance', icon: UserCheck },
    ] : []),
    { to: '/forms', label: 'Site Forms (10k)', icon: HardHat },
    { to: '/reports', label: 'Reports & Export', icon: FileBarChart2 }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand Logo */}
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <HardHat size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BuildCorp
          </h2>
          <p style={{ fontSize: '0.6875rem', color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            DBMS Construction
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.75rem 0.75rem' }}>
          Management Modules
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer / System Status */}
      <div style={{
        padding: '1rem',
        margin: '0.75rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Online</span>
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          MySQL Normalized Engine
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
