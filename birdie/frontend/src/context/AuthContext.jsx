import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('birdie_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount if token exists
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); else logout(); })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function saveToken(t) {
    setToken(t);
    localStorage.setItem('birdie_token', t);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('birdie_token');
  }

  async function loginWithEmail(email, password) {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function registerWithEmail(email, username, password) {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function loginWithGoogle(idToken) {
    const res = await fetch(`${API}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google login failed');
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function updateBalance(newBalance) {
    setUser(prev => prev ? { ...prev, balance: newBalance } : prev);
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginWithEmail, registerWithEmail, loginWithGoogle,
      logout, updateBalance,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
