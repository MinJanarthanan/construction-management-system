import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { username: 'alex.vance', role: 'Admin', name: 'Alex Vance', desc: 'System Admin & Governance' },
  { username: 'sarah.jenkins', role: 'Project Manager', name: 'Sarah Jenkins', desc: 'Multi-Project Delivery' },
  { username: 'rajesh.patel', role: 'Site Engineer', name: 'Rajesh Patel', desc: 'Site Operations & QA' },
  { username: 'elena.rostova', role: 'Accountant', name: 'Elena Rostova', desc: 'Budgets & Cost Audits' },
  { username: 'marcus.brody', role: 'Site Supervisor', name: 'Marcus Brody', desc: 'Field Tasks & Materials' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const switchRole = async (username) => {
    try {
      return await login(username, 'Demo@123');
    } catch (err) {
      console.error('Failed to switch role:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const userRole = user?.role?.Role_Name || user?.Role_Name || '';

  const permissions = {
    isAdmin: userRole === 'Admin',
    isProjectManager: userRole === 'Project Manager' || userRole === 'Admin',
    isSiteEngineer: userRole === 'Site Engineer' || userRole === 'Admin' || userRole === 'Project Manager',
    isAccountant: userRole === 'Accountant' || userRole === 'Admin',
    isSiteSupervisor: userRole === 'Site Supervisor',
    userRole
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, switchRole, logout, ...permissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
