import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  FileCheck2, 
  LogOut, 
  User, 
  SearchCode,
  Landmark
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Price Assessment', path: '/', icon: SearchCode, roles: ['officer', 'admin'] },
    { label: 'Evidence Logs', path: '/comparisons', icon: Layers, roles: ['officer', 'auditor', 'admin'] },
    { label: 'Risk & Market Intelligence', path: '/anomalies', icon: AlertTriangle, roles: ['auditor', 'admin'] },
    { label: 'Public Verification', path: '/verify', icon: ShieldCheck, roles: ['officer', 'auditor', 'admin', 'guest'] },
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 flex items-center justify-center text-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform border border-blue-400/20">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-wide font-sans">GeM-Intel</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  GovTech SIH-1360
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Procurement Intelligence & Auditability Platform</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              if (item.roles.includes('guest') || (user && item.roles.includes(user.role))) {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              }
              return null;
            })}
          </nav>

          {/* User Profile & Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200">{user.name}</span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400">{user.department}</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                      user.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                      user.role === 'auditor' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {user.role === 'officer' ? 'Procurement Officer' : user.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout Session"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg shadow-md shadow-blue-600/20 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                Official Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
