import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Layers,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Database,
  BarChart2,
  FileText
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    desc: 'System metrics & overview',
    path: '/dashboard', // We will route / to dashboard or new assessment
    icon: BarChart2,
    roles: ['officer', 'admin'],
  },
  {
    label: 'New Assessment',
    desc: 'Verify a GeM listing',
    path: '/',
    icon: Search,
    roles: ['officer', 'admin'],
  },
  {
    label: 'Evidence Logs',
    desc: 'Immutable audit trail',
    path: '/comparisons',
    icon: Layers,
    roles: ['officer', 'auditor', 'admin'],
  },
  {
    label: 'Certificates',
    desc: 'Public verification node',
    path: '/verify',
    icon: ShieldCheck,
    roles: ['officer', 'auditor', 'admin', 'guest'],
  }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111417] z-50 flex flex-col border-r border-[#1A1E24]">
      {/* Logo */}
      <div className="px-5 pt-6 pb-6 flex items-center gap-3 border-b border-[#1A1E24]/50">
        <div className="w-8 h-8 rounded bg-[#1A1E24] flex items-center justify-center text-slate-300 border border-[#2D333B]">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-[14px] text-[#E6E8EA] tracking-wide uppercase font-mono">GeM-Intel</span>
          <p className="text-[9px] text-slate-500 font-mono tracking-widest mt-0.5">GFR 149 SECURE</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-1 mt-6">
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2 px-2">Navigation</span>
        {navItems.map((item) => {
          if (!item.roles.includes('guest') && (!user || !item.roles.includes(user.role))) {
            return null;
          }
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#3B82C4]/10 text-[#3B82C4] border-l-2 border-[#3B82C4]'
                  : 'text-slate-400 hover:text-[#E6E8EA] hover:bg-[#1A1E24]/50 border-l-2 border-transparent'
              }`}
            >
              <Icon className="w-[16px] h-[16px] flex-shrink-0" />
              <div className="min-w-0">
                <div className="truncate">{item.label}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-[#1A1E24] rounded-lg p-3 flex items-center gap-3 border border-[#2D333B]">
            <div className="w-7 h-7 rounded bg-[#2D333B] flex items-center justify-center text-[#E6E8EA] font-mono text-xs font-bold flex-shrink-0">
              {user.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-[#E6E8EA] truncate">{user.name}</div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
                {user.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-[#2D333B] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 px-1 text-[9px] text-slate-500 font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
            <span>Encrypted Session</span>
          </div>
        </div>
      )}
    </aside>
  );
}
