import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Header from './components/Header';

// Pages
import Dashboard from './pages/Dashboard';
import Comparisons from './pages/Comparisons';
import Anomalies from './pages/Anomalies';
import Verify from './pages/Verify';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/comparisons" element={<Comparisons />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/verify" element={<Verify />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
