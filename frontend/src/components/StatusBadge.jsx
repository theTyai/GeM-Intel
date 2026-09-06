import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function StatusBadge({ status, variancePercent, showGuidance = false }) {
  const isAligned = status === 'benchmark_aligned' || status === 'compliant';
  const isReview = status === 'review_recommended' || status === 'review_required';
  const isHighRisk = status === 'high_risk_variance' || status === 'non_compliant';

  if (isAligned) {
    return (
      <div className="inline-flex flex-col">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>BENCHMARK ALIGNED (≤5%)</span>
          {variancePercent !== undefined && (
            <span className="text-[11px] font-mono font-normal opacity-85">
              ({variancePercent >= 0 ? `+${variancePercent.toFixed(1)}%` : `${variancePercent.toFixed(1)}%`})
            </span>
          )}
        </div>
        {showGuidance && (
          <span className="text-[10px] text-emerald-400/80 mt-1 pl-1">
            ✓ GFR 149 Reasonableness of Rates verified.
          </span>
        )}
      </div>
    );
  }

  if (isReview) {
    return (
      <div className="inline-flex flex-col">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>REVIEW RECOMMENDED (5–20%)</span>
          {variancePercent !== undefined && (
            <span className="text-[11px] font-mono font-normal opacity-85">
              (+{variancePercent.toFixed(1)}%)
            </span>
          )}
        </div>
        {showGuidance && (
          <span className="text-[10px] text-amber-400/80 mt-1 pl-1">
            ⚠ Potential GFR 149 justification recommended.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>HIGH-RISK VARIANCE (&gt;20%)</span>
        {variancePercent !== undefined && (
          <span className="text-[11px] font-mono font-normal opacity-85">
            (+{variancePercent.toFixed(1)}%)
          </span>
        )}
      </div>
      {showGuidance && (
        <span className="text-[10px] text-rose-400/80 mt-1 pl-1">
          ⛔ Significant price deviation: Officer justification & audit note required.
        </span>
      )}
    </div>
  );
}
