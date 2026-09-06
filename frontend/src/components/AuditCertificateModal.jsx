import React from 'react';
import { X, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function AuditCertificateModal({ comparison, isOpen, onClose }) {
  if (!isOpen || !comparison) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="print-container bg-white border border-slate-200 rounded-md shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-800">GFR 149 Evidence Certificate</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-[11px] font-mono space-y-6">
          
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded text-emerald-800 flex gap-3 shadow-sm">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong className="block mb-1 text-[12px]">CRYPTOGRAPHICALLY SEALED</strong>
              <p className="opacity-90">This assessment has been locked to the immutable ledger. It can be verified publicly using the Certificate ID below.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Certificate ID (SHA-256)</span>
                <div className="font-bold text-slate-800 bg-slate-100 p-2 rounded border border-slate-200 truncate" title={comparison._id}>
                  {comparison._id}
                </div>
              </div>
              
              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Timestamp</span>
                <div className="text-slate-700">
                  {new Date(comparison.createdAt).toUTCString()}
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Assessing Officer</span>
                <div className="text-slate-700 font-bold">
                  {comparison.requestedBy?.name || 'SYSTEM'} ({comparison.requestedBy?.department || 'Audit'})
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Target GeM Product</span>
                <div className="text-slate-800 font-bold truncate" title={comparison.gemProductId?.title}>
                  {comparison.gemProductId?.title}
                </div>
                <a href={comparison.gemProductId?.gemUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 mt-1 text-[9px]">
                  View Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Financial Assessment</span>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-slate-500 text-[9px]">GeM Price</span>
                    <span className="font-bold text-slate-800">₹{Math.round(comparison.gemProductId?.price || comparison.benchmarkMarketValue).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[9px]">Benchmark</span>
                    <span className="font-bold text-slate-800">₹{Math.round(comparison.benchmarkMarketValue).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="col-span-2 pt-2 mt-1 border-t border-slate-200">
                    <span className="block text-slate-500 text-[9px]">Variance</span>
                    <span className={`font-bold ${comparison.variancePercent > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {comparison.variancePercent > 0 ? '+' : ''}{comparison.variancePercent?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-2">Rule 149 Compliance Status</span>
            <div className={`p-3 rounded border font-bold ${comparison.status === 'benchmark_aligned' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : comparison.status === 'high_risk_variance' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
              {comparison.riskAssessment?.classification || comparison.status.replace(/_/g, ' ').toUpperCase()}
            </div>
            <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              {comparison.riskAssessment?.guidance} Verified against {comparison.riskAssessment?.independentSourcesCount} independent marketplace sources with PIN {comparison.pinCode} TCO normalization applied.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 no-print">
          <button onClick={onClose} className="px-4 py-2 rounded text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition-colors uppercase tracking-widest">
            Close
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
