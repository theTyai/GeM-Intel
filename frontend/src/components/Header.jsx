import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, LogOut, Layers, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo (Resets to Dashboard) */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-300 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[14px] text-slate-800 tracking-wide uppercase font-mono group-hover:text-indigo-600 transition-colors">GeM-Intel</span>
            <p className="text-[9px] text-slate-500 font-mono tracking-widest mt-0.5">GFR 149 SECURE</p>
          </div>
        </Link>

        {/* Global Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-[12px] font-semibold tracking-wide uppercase ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
              Assessment
            </Link>
            <Link to="/comparisons" className={`text-[12px] font-semibold tracking-wide uppercase ${location.pathname === '/comparisons' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
              Evidence Logs
            </Link>
            {['auditor', 'admin'].includes(user.role) && (
              <Link to="/anomalies" className={`text-[12px] font-semibold tracking-wide uppercase ${location.pathname === '/anomalies' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                Risk Alerts
              </Link>
            )}
            <Link to="/verify" className={`text-[12px] font-semibold tracking-wide uppercase ${location.pathname === '/verify' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
              Public Node
            </Link>
          </nav>
        )}

        {/* User Profile */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-bold text-slate-800">{user.name}</div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Public Node Access
          </div>
        )}
      </div>
    </header>
  );
}
