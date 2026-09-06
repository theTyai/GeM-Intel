import React from 'react';

export default function PriceChart({ gemPrice, matches = [], fairMarketValue }) {
  const bmv = fairMarketValue || 0;

  if (matches.length === 0) return null;

  const tcos = matches.map(m => m.landedCost || m.basePrice || 0);
  tcos.push(gemPrice);
  
  const minPrice = Math.min(...tcos);
  const maxPrice = Math.max(...tcos);
  const range = maxPrice - minPrice || 1; // avoid div by 0

  // Padding to not put dots exactly on the edges
  const paddedMin = minPrice - (range * 0.1);
  const paddedMax = maxPrice + (range * 0.1);
  const paddedRange = paddedMax - paddedMin;

  const getPercentage = (val) => ((val - paddedMin) / paddedRange) * 100;

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">Statistical Price Dispersion</h3>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          Pure CSS dispersion plotting. Benchmark mathematically derived from {matches.length} external sources.
        </p>
      </div>

      <div className="relative w-full h-16 mt-6 mb-4">
        {/* The Base Axis Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 rounded -translate-y-1/2"></div>
        
        {/* Median / BMV Marker */}
        <div 
          className="absolute top-0 w-px h-full bg-emerald-500 z-10" 
          style={{ left: `${getPercentage(bmv)}%` }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
            BMV: ₹{Math.round(bmv).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Competitor Scatter Points */}
        {matches.map((m, idx) => {
          const val = m.landedCost || m.basePrice || 0;
          return (
            <div 
              key={idx}
              className="absolute top-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white -translate-y-1/2 -translate-x-1/2 z-20 shadow-sm"
              style={{ left: `${getPercentage(val)}%` }}
              title={`${m.platform}: ₹${Math.round(val).toLocaleString('en-IN')}`}
            ></div>
          )
        })}

        {/* GeM Target Point */}
        <div 
          className="absolute top-1/2 w-4 h-4 bg-indigo-600 rounded-sm border-2 border-white -translate-y-1/2 -translate-x-1/2 z-30 shadow-md"
          style={{ left: `${getPercentage(gemPrice)}%` }}
        >
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 whitespace-nowrap">
            GeM: ₹{Math.round(gemPrice).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-4">
        <span>₹{Math.round(paddedMin).toLocaleString('en-IN')}</span>
        <span>₹{Math.round(paddedMax).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
