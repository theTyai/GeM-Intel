import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      const res = await api.get('/anomalies');
      setAnomalies(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-6 w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" /> Risk Alerts & Exceptions
        </h1>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">Automated detection of GFR 149 policy deviations</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[11px] text-slate-500 font-mono">Scanning ledgers...</div>
        ) : anomalies.length === 0 ? (
          <div className="p-12 text-center text-[11px] text-emerald-600 font-mono flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            No outstanding risk alerts detected.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">
                  <th className="py-3 px-4 font-semibold">Flag Date</th>
                  <th className="py-3 px-4 font-semibold">Reference ID</th>
                  <th className="py-3 px-4 font-semibold">Variance Level</th>
                  <th className="py-3 px-4 font-semibold">Risk Drivers</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {anomalies.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-slate-600">
                      {new Date(a.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-slate-800 font-bold">
                      {a._id.substring(a._id.length - 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${a.status === 'high_risk_variance' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {a.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <ul className="list-disc pl-4 text-slate-600 space-y-1">
                        {a.anomalyFlags?.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                        {(!a.anomalyFlags || a.anomalyFlags.length === 0) && <li>Excessive price divergence</li>}
                      </ul>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-widest text-[9px] transition-colors bg-indigo-50 px-2 py-1 border border-indigo-100 rounded">
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
