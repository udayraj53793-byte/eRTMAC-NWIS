import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingState } from '../../components/States';
import { Search } from 'lucide-react';

const Knowledge = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.post('/rag/search', { query, topK: 10 });
      setResults(res.data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="engineer-page engineer-page--knowledge space-y-6">
      <header className="border-b-2 border-amber-400 pb-5">
        <div className="border-l-4 border-blue-900 pl-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Technical library / semantic retrieval</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">Knowledge Base Search</h1>
          <p className="mt-1 text-sm text-slate-500">Search verified historical drilling knowledge with contextual evidence.</p>
        </div>
      </header>
      <section aria-label="Search drilling knowledge" className="rounded-xl border border-slate-200 border-l-4 border-l-amber-400 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Search verified drilling knowledge"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder='e.g., "mud loss in Formation-X" or "stuck pipe mitigation"'
          className="min-w-0 flex-1 px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <button aria-label="Search knowledge base" onClick={search} disabled={loading} className="justify-center px-6 py-3 bg-blue-950 text-white rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 flex items-center gap-2">
          <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      </section>

      {loading && <LoadingState message="Searching knowledge base..." />}

      {results.length > 0 && (
        <section aria-label="Knowledge search results" className="space-y-3">
          <p className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{results.length} results found</p>
          {results.map((r, i) => (
            <article key={i} className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-900 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs font-semibold text-blue-700">{r.wellName || r.well || 'Unknown Well'}</div>
                {r.relevance && <span className="text-xs text-slate-400">Relevance: {(r.relevance * 100).toFixed(0)}%</span>}
              </div>
              <p className="text-sm text-slate-700 mb-2">{r.text?.substring(0, 300)}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                {r.depth && <span>Depth: {r.depth}m</span>}
                {(r.formation || r.metadata?.formation) && <span>Formation: {r.formation || r.metadata.formation}</span>}
                {(r.eventType || r.metadata?.event_type) && <span>Event: {(r.eventType || r.metadata.event_type)?.replace(/_/g, ' ')}</span>}
                {(r.page || r.page_number) && <span>Page: {r.page || r.page_number}</span>}
                {r.is_verified && <span className="text-emerald-600 font-medium">✓ Verified</span>}
                {r.fallback && <span className="text-amber-600">(Database fallback)</span>}
              </div>
            </article>
          ))}
        </section>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No results found. Try different search terms or check if documents have been indexed.
        </div>
      )}
    </div>
  );
};

export default Knowledge;
