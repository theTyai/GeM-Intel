import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Layers, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const link = (to) =>
    `text-[12px] font-semibold tracking-wide uppercase ${
      location.pathname === to ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-300 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[14px] text-slate-800 tracking-wide uppercase font-mono group-hover:text-indigo-600 transition-colors">GeM-Intel</span>
            <p className="text-[9px] text-slate-500 font-mono tracking-widest mt-0.5">GFR 149 SECURE</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={link('/')}>Assessment</Link>
          <Link to="/comparisons" className={link('/comparisons')}>Evidence Logs</Link>
          <Link to="/anomalies" className={link('/anomalies')}>Risk Alerts</Link>
          <Link to="/verify" className={link('/verify')}>Public Node</Link>
        </nav>
      </div>
    </header>
  );
}
