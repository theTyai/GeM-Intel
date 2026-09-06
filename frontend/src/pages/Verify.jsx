import React, { useState } from 'react';
import { ShieldCheck, Search, ShieldAlert, CheckCircle2, Database } from 'lucide-react';
import api from '../api/client';

export default function Verify() {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.get(`/certificates/${certId.trim()}/verify`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Certificate not found or tampered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-lg mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-white border border-slate-200 shadow-sm text-indigo-600 mb-4">
          <Database className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-widest uppercase mb-2 text-slate-800">Public Verification Node</h1>
        <p className="text-[11px] text-slate-500 font-mono">Cryptographic GFR 149 Audit Certificate Verification</p>
      </div>

      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-md p-6 shadow-sm">
        <form onSubmit={handleVerify}>
          <label className="block text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-2 font-bold">
            Certificate Hash ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. 655b...9a2f"
              className="flex-1 bg-white border border-slate-300 rounded px-4 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-shadow"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-md bg-rose-50 border border-rose-200 flex gap-3 text-rose-700 animate-fadeIn shadow-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div className="text-[12px] font-mono">
              <strong className="block mb-1">VERIFICATION FAILED</strong>
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 animate-fadeIn shadow-sm">
            <div className="flex gap-3 mb-4 border-b border-emerald-200/60 pb-4">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block text-[12px] font-mono mb-1">CERTIFICATE VERIFIED</strong>
                <p className="text-[10px] font-mono opacity-80">Cryptographic hash matches immutable ledger record.</p>
              </div>
            </div>
            
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between border-b border-emerald-100 pb-1">
                <span className="opacity-70 font-semibold">Issued To:</span>
                <span className="text-emerald-900">{result.issuedTo?.name || 'Authorized Officer'}</span>
              </div>
              <div className="flex justify-between border-b border-emerald-100 pb-1">
                <span className="opacity-70 font-semibold">Timestamp:</span>
                <span className="text-emerald-900">{new Date(result.issuedAt).toUTCString()}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="opacity-70 font-semibold">Hash Signature:</span>
                <span className="text-emerald-900 truncate w-32" title={result.contentHash}>{result.contentHash}</span>
              </div>
            </div>

            {result.pdfUrl && (
              <a
                href={result.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block w-full text-center bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 py-2 rounded text-[11px] font-bold tracking-widest uppercase transition-colors shadow-sm"
              >
                Download Original Report
              </a>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 text-[9px] text-slate-500 font-mono tracking-widest text-center font-bold">
        THIS IS A PUBLIC VERIFICATION NODE<br/>
        NO LOGIN REQUIRED FOR ACCESS
      </div>
    </div>
  );
}
