import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function AppProvider({ children }) {
  const { token, updateBalance, isAuthenticated } = useAuth();
  const [markets, setMarkets]       = useState([]);
  const [bets, setBets]             = useState([]);
  const [activeTab, setActiveTab]   = useState('All');
  const [loading, setLoading]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast]           = useState(null);

  function authHeaders() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  function showToast(message, type = 'info') {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }

  const fetchMarkets = useCallback(async (category = 'All') => {
    setLoading(true);
    try {
      const url = category === 'All'
        ? `${API}/api/markets`
        : `${API}/api/markets?category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const data = await res.json();
      setMarkets(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load markets', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/bets/mine`, { headers: authHeaders() });
      const data = await res.json();
      setBets(Array.isArray(data) ? data : []);
    } catch {}
  }, [token]);

  useEffect(() => { fetchMarkets('All'); }, [fetchMarkets]);
  useEffect(() => { fetchMarkets(activeTab); }, [activeTab, fetchMarkets]);
  useEffect(() => { if (isAuthenticated) fetchBets(); }, [isAuthenticated, fetchBets]);

  async function placeBet(marketId, side, amount) {
    if (!token) { showToast('Sign in to place a bet', 'error'); return false; }
    try {
      const res = await fetch(`${API}/api/bets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ marketId, side, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bet failed');
      updateBalance(data.newBalance);
      setBets(prev => [data.bet, ...prev]);
      setMarkets(prev => prev.map(m => m.id === data.updatedMarket.id ? data.updatedMarket : m));
      showToast(`${side === 'YES' ? '▲' : '▼'} ${side} — ${amount} pts staked · max payout ${data.bet.payout.toFixed(1)} pts`, side === 'YES' ? 'success' : 'error');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  }

  async function generateMarkets(topic) {
    if (!token) { showToast('Sign in to generate markets', 'error'); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/markets/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      await fetchMarkets(activeTab);
      showToast(`${data.length} new markets created`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  }

  async function purchaseFunds(packageId, cardDetails) {
    try {
      const res = await fetch(`${API}/api/funds/purchase`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ packageId, ...cardDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');
      updateBalance(data.newBalance);
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }

  return (
    <AppContext.Provider value={{
      markets, bets, activeTab, setActiveTab,
      loading, generating, toast,
      placeBet, generateMarkets, purchaseFunds,
      fetchMarkets, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
