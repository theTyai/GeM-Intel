import React from 'react';
import { ExternalLink, Check, AlertTriangle } from 'lucide-react';

export default function ComparisonMatrix({ gemProduct, matches = [], fairMarketValue, pinCode }) {
  const gemPrice = gemProduct?.price || gemProduct?.priceHistory?.[0]?.price || fairMarketValue || 0;

  const getVerificationTier = (platform) => {
    if (platform === 'amazon' || platform === 'flipkart') return { label: 'Verified Source', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { label: 'Self-Reported', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">Evidence Matrix</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">PIN: {pinCode || '462003'} | TCO Normalization</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px]">
          <thead>
            <tr className="bg-white text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">
              <th className="py-3 px-4 font-semibold">Source</th>
              <th className="py-3 px-4 font-semibold">Listed Price</th>
              <th className="py-3 px-4 font-semibold text-right">Freight</th>
              <th className="py-3 px-4 font-semibold text-right">GST</th>
              <th className="py-3 px-4 font-semibold text-right">AMC (Norm)</th>
              <th className="py-3 px-4 font-bold text-slate-800 text-right bg-slate-50">Normalized TCO</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* GeM Target */}
            <tr className="bg-indigo-50/30 border-b-2 border-slate-200">
              <td className="py-4 px-4">
                <div className="font-bold text-indigo-700 uppercase">GeM (Target)</div>
                <div className="text-[10px] text-slate-600 mt-1 max-w-[150px] truncate">{gemProduct?.title}</div>
              </td>
              <td className="py-4 px-4 text-slate-800 font-medium">₹{Math.round(gemPrice).toLocaleString('en-IN')}</td>
              <td className="py-4 px-4 text-right text-slate-500">-</td>
              <td className="py-4 px-4 text-right text-slate-500">Incl.</td>
              <td className="py-4 px-4 text-right text-slate-500">-</td>
              <td className="py-4 px-4 text-right font-bold text-indigo-700 bg-indigo-50/50 text-[12px]">
                ₹{Math.round(gemPrice).toLocaleString('en-IN')}
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-[9px] uppercase tracking-widest text-indigo-700 font-bold border border-indigo-200 bg-indigo-100 px-2.5 py-1 rounded-md">Target</span>
              </td>
            </tr>

            {/* Matches */}
            {matches.map((item, idx) => {
              const tier = getVerificationTier(item.platform);

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800 uppercase">{item.platform}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.matchedListingUrl ? (
                        <a href={item.matchedListingUrl.startsWith('http') ? item.matchedListingUrl : `https://${item.matchedListingUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline">
                          Trace Listing <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">No URL Provided</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    ₹{Math.round(item.basePrice || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-600">
                    ₹{Math.round(item.freight || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-600">
                    <span className="text-[9px] text-slate-400 block mb-0.5">Incl.</span>
                    ₹{Math.round(item.gst || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-600">
                    ₹{Math.round(item.amc || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-slate-800 bg-slate-50 text-[12px]">
                    ₹{Math.round(item.landedCost || item.basePrice || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className={`text-[9px] uppercase font-bold tracking-widest border px-2 py-1 rounded-md inline-flex items-center justify-center gap-1.5 ${tier.color}`}>
                      {tier.label === 'Verified Source' ? <Check className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                      {tier.label}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
