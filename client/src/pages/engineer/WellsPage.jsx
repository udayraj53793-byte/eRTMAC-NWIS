import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import WellCard from '../../components/WellCard';
import RiskBadge from '../../components/RiskBadge';
import { LoadingState, EmptyState } from '../../components/States';
import { RefreshCw, Radio, Layers } from 'lucide-react';

const WellsPage = () => {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('DRILLING');
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadWells(); }, [filter]);

  const loadWells = async () => {
    setLoading(true);
    try {
      const query = filter ? `?status=${filter}` : '';
      const res = await api.get(`/wells${query}`);
      setWells(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="engineer-page engineer-page--wells space-y-6">
      <header className="flex flex-col gap-4 border-b-2 border-amber-400 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-4 border-blue-900 pl-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Field operations / asset register</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">Active Wells</h1>
          <p className="mt-1 text-sm text-slate-500">Select a well to inspect its live status, location and subsurface profile.</p>
        </div>
        <button aria-label="Refresh wells" onClick={loadWells} className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center text-blue-900 hover:bg-amber-50">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Status filter */}
      <section aria-label="Filter wells by status" className="flex gap-2 flex-wrap rounded-xl border border-slate-200 bg-white p-3">
        {['', 'DRILLING', 'COMPLETED', 'PRODUCING', 'SUSPENDED', 'ABANDONED', 'TESTING'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={`text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-lg border transition-colors ${filter === s ? 'bg-blue-950 text-white border-blue-950' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'}`}>
            {s || 'All'}
          </button>
        ))}
      </section>

      {loading ? <LoadingState message="Loading wells..." /> : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section aria-label="Well results" className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {wells.length === 0 && <div className="col-span-2"><EmptyState title="No wells found" message="Try a different status filter." /></div>}
            {wells.map(well => (
              <WellCard key={well._id} well={well} onClick={setSelected} />
            ))}
          </section>

          {/* Well detail panel */}
          <aside aria-label="Selected well details" className="lg:col-span-4">
            {selected ? (
              <div className="bg-white rounded-xl border-t-4 border-amber-400 border-x border-b border-slate-200 shadow-sm p-5 sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-slate-800">{selected.wellName}</h2>
                    <p className="text-sm text-slate-500">{selected.field}</p>
                  </div>
                  <RiskBadge level={selected.riskLevel || 'LOW'} size="xs" />
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    ['Status', selected.status],
                    ['Current Depth', `${selected.currentDepth?.toLocaleString()}m`],
                    ['Target Depth', `${selected.targetDepth?.toLocaleString()}m`],
                    ['Formation', selected.currentFormation || 'N/A'],
                    ['Operator', selected.operator],
                    ['Latitude', selected.latitude?.toFixed(5)],
                    ['Longitude', selected.longitude?.toFixed(5)],
                    ['Spud Date', selected.spudDate ? new Date(selected.spudDate).toLocaleDateString() : 'N/A'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">{k}</span>
                      <span className="font-medium text-slate-700 text-right">{v}</span>
                    </div>
                  ))}
                </div>
                {selected.formations?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Formations ({selected.formations.length})
                    </p>
                    <div className="space-y-1.5">
                      {selected.formations.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-700">{f.name}</span>
                          <span className="text-slate-400">{f.topDepth}–{f.bottomDepth}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.description && (
                  <p className="mt-3 text-xs text-slate-500 italic border-t border-slate-50 pt-3">{selected.description}</p>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <Radio className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Select a well</p>
                <p className="text-xs text-slate-400 mt-1">Click any well card to view details</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default WellsPage;
