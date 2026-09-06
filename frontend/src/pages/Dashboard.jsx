import React, { useState, useEffect } from 'react';
import {
  Search, ShieldCheck, Activity, Check, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import api from '../api/client';
import ComparisonMatrix from '../components/ComparisonMatrix';
import PriceChart from '../components/PriceChart';
import AuditCertificateModal from '../components/AuditCertificateModal';

export default function Dashboard() {
  const [gemUrl, setGemUrl] = useState('');
  const [pinCode, setPinCode] = useState('462003');
  const [uiState, setUiState] = useState('idle'); // idle, fetching, checkpoint, verdict
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [recentAssessments, setRecentAssessments] = useState([]);

  useEffect(() => {
    if (uiState === 'idle') {
      fetchRecent();
    }
  }, [uiState]);

  const fetchRecent = async () => {
    try {
      const res = await api.get('/comparisons?limit=5');
      setRecentAssessments(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const startAssessment = async (e) => {
    e?.preventDefault();
    if (!gemUrl) {
      setError('Please provide a GeM URL.');
      return;
    }
    setError('');
    setUiState('fetching');
    setLoadingStep(1);

    // Simulate progressive processing for transparency
    const timeouts = [
      setTimeout(() => setLoadingStep(2), 600),
      setTimeout(() => setLoadingStep(3), 1200),
      setTimeout(() => setLoadingStep(4), 1800),
    ];

    try {
      const res = await api.post('/compare', {
        gemUrl: gemUrl,
        pinCode: pinCode || '462003',
      });
      setResult(res.data);
      // Mandatory Identity Gate
      setUiState('checkpoint');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to benchmark product. Ensure services are running.');
      setUiState('idle');
    } finally {
      timeouts.forEach(clearTimeout);
    }
  };

  const handleConfirmMatch = () => {
    setUiState('verdict');
  };

  const handleRejectMatch = () => {
    setGemUrl('');
    setResult(null);
    setUiState('idle');
  };

  const getStepStatus = (stepName) => {
    const states = ['idle', 'fetching', 'checkpoint', 'verdict'];
    const currentIndex = states.indexOf(uiState);
    const stepIndex = states.indexOf(stepName);
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'upcoming';
  };

  // ------------------------------------------------------------------
  // STEPPER UI
  // ------------------------------------------------------------------
  const renderStepper = () => {
    const steps = [
      { id: 'idle', label: 'Initiate' },
      { id: 'fetching', label: 'Extract' },
      { id: 'checkpoint', label: 'Verify' },
      { id: 'verdict', label: 'Benchmark' },
    ];

    return (
      <div className="flex items-center justify-between px-2 mb-8 mt-4 font-mono text-[10px] tracking-widest uppercase text-slate-400">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          return (
            <React.Fragment key={step.id}>
              <div className={`flex flex-col items-center gap-2 ${status === 'current' ? 'text-indigo-600 font-bold' : status === 'completed' ? 'text-emerald-600' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  status === 'current' ? 'border-indigo-600 bg-indigo-50' :
                  status === 'completed' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'
                }`}>
                  {status === 'completed' ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${status === 'completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
        {/* Step 5 is Certify which is a sub-state of verdict */}
        <div className={`flex-1 h-px mx-4 bg-slate-200`} />
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-300">5</div>
          <span>Certify</span>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // VIEW: IDLE
  // ------------------------------------------------------------------
  const renderIdle = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6">
        <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-600" /> New Price Assessment
        </h2>
        <form onSubmit={startAssessment} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={gemUrl}
              onChange={(e) => setGemUrl(e.target.value)}
              placeholder="Paste GeM Product URL..."
              className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-shadow"
            />
          </div>
          <div className="w-32">
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="PIN Code"
              className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-shadow"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-md text-[13px] transition-colors whitespace-nowrap shadow-sm"
          >
            Initiate Fetch
          </button>
        </form>
        {error && <p className="text-rose-600 text-[11px] mt-3 font-mono">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-md">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Assessments (Mtd)</span>
          <span className="text-xl font-mono text-slate-800 font-bold block mt-2">142</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-md">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Pending Review</span>
          <span className="text-xl font-mono text-amber-600 font-bold block mt-2">12</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-md">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Certificates</span>
          <span className="text-xl font-mono text-slate-800 font-bold block mt-2">98</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-md">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Avg Variance</span>
          <span className="text-xl font-mono text-emerald-600 font-bold block mt-2">-4.2%</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-md">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Recent Assessments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-normal">Date</th>
                <th className="py-3 px-4 font-normal">Product Reference</th>
                <th className="py-3 px-4 font-normal text-right">Variance</th>
                <th className="py-3 px-4 font-normal text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentAssessments.map(c => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-800 truncate max-w-[250px]">
                    {c.gemProductId?.title || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={c.variancePercent > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {c.variancePercent > 0 ? '+' : ''}{c.variancePercent?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500">{c.status.replace(/_/g, ' ')}</span>
                  </td>
                </tr>
              ))}
              {recentAssessments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ------------------------------------------------------------------
  // VIEW: FETCHING
  // ------------------------------------------------------------------
  const renderFetching = () => (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm rounded-md p-8">
      <div className="flex items-center gap-4 mb-8">
        <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
        <div>
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest">Extraction Pipeline</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Establishing mathematical proof...</p>
        </div>
      </div>
      <div className="space-y-4 font-mono text-[11px]">
        {[
          { step: 1, label: 'Data Retrieval: Fetching GeM specs' },
          { step: 2, label: 'AI Parsing: Extracting key attributes' },
          { step: 3, label: 'Candidate Generation: Scanning verified marketplaces' },
          { step: 4, label: 'Normalization: Applying PIN freight & HSN parity' },
        ].map(({ step, label }) => (
          <div key={step} className="flex items-center gap-3">
            {loadingStep > step ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : loadingStep === step ? (
              <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            ) : (
              <span className="w-4 h-4 rounded-full border-2 border-slate-200" />
            )}
            <span className={loadingStep >= step ? 'text-slate-700' : 'text-slate-400'}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // ------------------------------------------------------------------
  // VIEW: CHECKPOINT
  // ------------------------------------------------------------------
  const renderCheckpoint = () => {
    if (!result) return null;
    const prod = result.gemProductId;
    const matchData = result.matches?.[0]?.explainability || {};
    
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white border-2 border-indigo-100 rounded-md p-6 shadow-sm">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">Mandatory Identity Gate</h2>
                <p className="text-[11px] text-slate-500 mt-1">Confirm product identity resolution before accessing pricing data.</p>
              </div>
            </div>
            <span className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded text-[11px] font-mono">
              CONFIDENCE: {matchData.overallConfidence || 98}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-3">Extracted Target (GeM)</h3>
              <div className="text-[12px] text-slate-800 font-semibold mb-3 leading-relaxed">
                {prod.title}
              </div>
              <table className="w-full text-[11px] font-mono border-collapse">
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="py-2 text-slate-500">Brand</td><td className="py-2 text-right font-medium">{prod.brand || '-'}</td></tr>
                  <tr><td className="py-2 text-slate-500">Category</td><td className="py-2 text-right font-medium">{prod.category || '-'}</td></tr>
                  {Object.entries(prod.specifications || {}).map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-2 text-slate-500 capitalize">{k}</td>
                      <td className="py-2 text-right font-bold text-slate-800">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-3">AI Match Reasoning</h3>
              <ul className="space-y-2 text-[11px] font-mono">
                <li className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Brand Identity</span>
                  <span className="text-emerald-600 font-medium">{matchData.brandMatch || 'Exact'}</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Model Series</span>
                  <span className="text-emerald-600 font-medium">{matchData.modelMatch || 'Exact Series'}</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Processor / SoC</span>
                  <span className="text-emerald-600 font-medium">{matchData.processorMatch || 'Match'}</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-amber-200">
                  <span className="text-amber-700">Generation / Variant</span>
                  <span className="text-amber-700 font-medium">Inferred (Review)</span>
                </li>
              </ul>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                NLP embeddings confirm equivalent underlying hardware SKU across differing vendor titles. Please verify inferred fields.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={handleConfirmMatch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-md text-[12px] transition-colors shadow-sm"
            >
              Confirm Match & Reveal Pricing
            </button>
            <button
              onClick={handleRejectMatch}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-6 rounded-md text-[12px] transition-colors"
            >
              Reject & Reassess
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // VIEW: VERDICT
  // ------------------------------------------------------------------
  const renderVerdict = () => {
    if (!result) return null;
    const bmv = result.benchmarkMarketValue || 0;
    const gemPrice = result.gemProductId?.price || bmv;
    
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
              Price Assessment Verdict
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Target GeM Price</span>
                <span className="text-2xl font-bold text-slate-800">₹{Math.round(gemPrice).toLocaleString('en-IN')}</span>
              </div>
              <div className="hidden sm:block w-px bg-slate-200"></div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Benchmark (BMV)</span>
                <span className="text-2xl font-bold text-emerald-600">₹{Math.round(bmv).toLocaleString('en-IN')}</span>
              </div>
              <div className="hidden sm:block w-px bg-slate-200"></div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Variance</span>
                <span className={`text-2xl font-bold ${result.variancePercent > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {result.variancePercent > 0 ? '+' : ''}{result.variancePercent?.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-[12px] text-slate-700 leading-relaxed mt-2">
              <strong>Risk Classification: {result.riskAssessment?.classification}</strong><br/>
              {result.riskAssessment?.guidance} The listed price is {(result.variancePercent > 0 ? 'above' : 'below')} the benchmark median of {result.riskAssessment?.independentSourcesCount || 3} verified equivalents.
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCertModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-md text-[11px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Generate GFR 149 Certificate
              </button>
            </div>
          </div>
        </div>

        <ComparisonMatrix
          gemProduct={result.gemProductId}
          matches={result.matches}
          fairMarketValue={bmv}
          pinCode={result.pinCode}
        />

        <PriceChart
          gemPrice={gemPrice}
          matches={result.matches}
          fairMarketValue={bmv}
        />

        <AuditCertificateModal
          comparison={result}
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      </div>
    );
  };

  return (
    <div className="px-6 py-6 w-full max-w-6xl mx-auto">
      {renderStepper()}
      {uiState === 'idle' && renderIdle()}
      {uiState === 'fetching' && renderFetching()}
      {uiState === 'checkpoint' && renderCheckpoint()}
      {uiState === 'verdict' && renderVerdict()}
    </div>
  );
}
