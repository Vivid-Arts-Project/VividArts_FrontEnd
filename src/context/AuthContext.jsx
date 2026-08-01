import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// This context holds the logged-in admin's data and makes it available
// to every component in the app — Sidebar, Topbar, Settings page, etc.
// Any component can call useAuth() to get { admin, loading, login, logout }.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);   // null = not logged in
  const [loading, setLoading] = useState(true);   // true while checking session

  // On app startup, ask the backend "am I still logged in?"
  // This handles page refresh — the session cookie persists so the admin
  // doesn't have to log in again every time they refresh the page.
  useEffect(() => {
    api.get('/admin/me')
      .then(res => setAdmin(res.data))
      .catch(() => setAdmin(null))       // 401 = not logged in, just clear admin
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/admin/login', { username, password });
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const register = async (formData) => {
    const res = await api.post('/admin/register', formData);
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      setAdmin(null);
    }
  };

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

export function useAuth() {
  return useContext(AuthContext);
}
