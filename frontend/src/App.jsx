import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Comparisons from './pages/Comparisons';
import Anomalies from './pages/Anomalies';
import Verify from './pages/Verify';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const hideHeader = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {!hideHeader && <Header />}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['officer', 'auditor', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/comparisons"
            element={
              <ProtectedRoute allowedRoles={['officer', 'auditor', 'admin']}>
                <Comparisons />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/anomalies"
            element={
              <ProtectedRoute allowedRoles={['officer', 'auditor', 'admin']}>
                <Anomalies />
              </ProtectedRoute>
            }
          />

          {/* Public Route for Certificate Verification */}
          <Route path="/verify" element={<Verify />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
