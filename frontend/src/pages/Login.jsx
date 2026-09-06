import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Landmark } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('officer@gem.gov.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const setDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-blue-600/20 border border-blue-400/20">
            🏛️
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-sans">GeM-Intel Gateway</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-Powered Procurement Intelligence & Auditability Platform
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
            <Landmark className="w-3 h-3" /> GFR 2017 Rule 149 Compliance Portal
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-xl shadow-md">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Official Government Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gem.gov.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In with Government ID'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Selector */}
        <div className="pt-4 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-semibold block mb-2.5 text-center uppercase tracking-wider">
            ⚡ One-Click Demo Role Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoUser('officer@gem.gov.in')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold text-emerald-400 block">Officer</span>
              <span className="text-[9px] text-slate-400">Min. of Finance</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('auditor@gem.gov.in')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold text-amber-400 block">Auditor</span>
              <span className="text-[9px] text-slate-400">CAG Office</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('admin@gem.gov.in')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold text-purple-400 block">Admin</span>
              <span className="text-[9px] text-slate-400">GeM Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
