import { useCallback, useState, useEffect } from 'react';
import api from '../api/axios';
import { AuthContext } from './useAuth';
import { clearAdminSession, hasAdminSession, startAdminSession, useIdleTimeout } from '../authSession';
import { navigate } from '../router';
import { showNotification } from '../pages/notifications';

// This context holds the logged-in admin's data and makes it available
// to every component in the app — Sidebar, Topbar, Settings page, etc.
// Any component can call useAuth() to get { admin, loading, login, logout }.

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);   // null = not logged in
  const [loading, setLoading] = useState(hasAdminSession); // true while restoring this tab's session

  useEffect(() => {
    if (!hasAdminSession()) return;

    api.get('/admin/me')
      .then((res) => setAdmin(res.data))
      .catch(() => {
        clearAdminSession();
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/admin/login', { username, password });
    startAdminSession();
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const register = async (formData) => {
    const res = await api.post('/admin/register', formData);
    startAdminSession();
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      clearAdminSession();
      setAdmin(null);
    }
  }, []);

  const handleIdleLogout = useCallback(() => {
    logout().finally(() => {
      showNotification('warning', 'You were signed out after 30 minutes of inactivity.');
      navigate('/admin/login', { replace: true });
    });
  }, [logout]);

  useIdleTimeout(Boolean(admin), handleIdleLogout);

  // updateAdmin is called by the Settings page after a successful PATCH —
  // it merges the new fields into the stored admin object so the Sidebar
  // and Topbar update immediately without a full page reload.
  const updateAdmin = (newData) => {
    setAdmin(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, register, logout, updateAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
