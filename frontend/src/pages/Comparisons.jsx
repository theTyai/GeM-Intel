import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Database } from 'lucide-react';
import api from '../api/client';
import AuditCertificateModal from '../components/AuditCertificateModal';

export default function Comparisons() {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchComparisons();
  }, [statusFilter]);

  const fetchComparisons = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/comparisons', { params });
      setComparisons(res.data.data || []);
    } catch (err) {
      console.error('Failed to load evidence logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { label: 'ALL LOGS', value: '', activeBg: 'bg-indigo-100', activeText: 'text-indigo-700 border-indigo-200' },
    { label: 'ALIGNED', value: 'benchmark_aligned', activeBg: 'bg-emerald-100', activeText: 'text-emerald-700 border-emerald-200' },
    { label: 'REVIEW', value: 'review_recommended', activeBg: 'bg-amber-100', activeText: 'text-amber-700 border-amber-200' },
    { label: 'HIGH RISK', value: 'high_risk_variance', activeBg: 'bg-rose-100', activeText: 'text-rose-700 border-rose-200' },
  ];

  return (
    <div className="px-6 py-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" /> Evidence Logs
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">Immutable GFR 149 audit trail</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-md shadow-sm font-mono">
          {filters.map((f) => {
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded text-[10px] tracking-widest font-bold border transition-colors ${
                  isActive ? `${f.activeBg} ${f.activeText}` : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[11px] text-slate-500 font-mono">Loading immutable records...</div>
        ) : comparisons.length === 0 ? (
          <div className="p-12 text-center text-[11px] text-slate-500 font-mono">
            No evidence records found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">
                  <th className="py-3 px-4 font-semibold">Date (IST)</th>
                  <th className="py-3 px-4 font-semibold">Product Hash/Title</th>
                  <th className="py-3 px-4 font-semibold">Officer</th>
                  <th className="py-3 px-4 font-semibold text-right">BMV</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisons.map((c) => {
                  const bmv = c.benchmarkMarketValue || c.fairMarketValue || 0;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-600">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}<br/>
                        <span className="text-[9px] text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-800 font-medium line-clamp-1 max-w-[200px]" title={c.gemProductId?.title}>
                          {c.gemProductId?.title || 'GeM Listing'}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">PIN: {c.pinCode}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-700 font-medium">{c.requestedBy?.name || 'SYSTEM'}</div>
                        <div className="text-[9px] text-slate-500">{c.requestedBy?.department || 'Audit Dept'}</div>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-700 font-bold">
                        ₹{Math.round(bmv).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-right font-bold">
                        <span className={c.variancePercent > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {c.variancePercent >= 0 ? '+' : ''}{c.variancePercent?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => { setSelectedComparison(c); setShowModal(true); }}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-2 py-1 border border-indigo-100 rounded"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AuditCertificateModal
        comparison={selectedComparison}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
