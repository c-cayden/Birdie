import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FundsModal from './components/FundsModal';
import Toast from './components/Toast';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#636363' }}>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  const [fundsOpen, setFundsOpen] = useState(false);

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <>
                <Header onAddFunds={() => setFundsOpen(true)} />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                  </Routes>
                </main>
                <FundsModal open={fundsOpen} onClose={() => setFundsOpen(false)} />
              </>
            </ProtectedRoute>
          } />
        </Routes>
        <Toast />
      </div>
    </AppProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
