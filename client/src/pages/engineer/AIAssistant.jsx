import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import AIChat from '../../components/AIChat';
import { LoadingState } from '../../components/States';

const AIAssistant = () => {
  const [wells, setWells] = useState([]);
  const [selectedWellId, setSelectedWellId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const wellIdParam = searchParams.get('wellId') || '';

  useEffect(() => {
    api.get('/wells?status=DRILLING').then(res => {
      setWells(res.data.data);
      setSelectedWellId(wellIdParam || res.data.data[0]?._id || '');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading AI Copilot..." />;

  return (
    <div className="engineer-page engineer-page--ai space-y-5">
      <header className="flex flex-col gap-3 border-b-2 border-amber-400 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-4 border-blue-900 pl-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Decision support / evidence assistant</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">AI Drilling Copilot</h1>
          <p className="mt-1 text-sm text-slate-500">Evidence-grounded drilling knowledge assistant, powered by verified records.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">Evidence-grounded</span>
      </header>

      <div role="note" className="bg-amber-50 border-l-4 border-amber-500 border-y border-r border-amber-200 rounded-lg px-4 py-3 text-xs leading-relaxed text-amber-900">
        <strong>Decision Support Tool:</strong> This AI uses verified historical drilling data from the knowledge base. All responses require engineering review. Do not rely on AI answers for autonomous drilling decisions.
      </div>

      {/* Well selector */}
      {wells.length > 0 && (
        <section aria-label="AI context well" className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-3">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Context Well</label>
          <select
            aria-label="Choose a context well for the AI assistant"
            value={selectedWellId}
            onChange={e => setSelectedWellId(e.target.value)}
            className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No specific well</option>
            {wells.map(w => <option key={w._id} value={w._id}>{w.wellName}</option>)}
          </select>
        </section>
      )}

      <section aria-label="AI drilling conversation" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ height: 'calc(100vh - 300px)', minHeight: '420px' }}>
        <AIChat wellId={selectedWellId} initialQuery={initialQuery} />
      </section>
    </div>
  );
};

export default AIAssistant;
