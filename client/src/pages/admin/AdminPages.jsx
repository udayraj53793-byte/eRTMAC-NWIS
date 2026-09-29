// Admin supporting pages

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingState } from '../../components/States';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  useEffect(() => {
    api.get(`/admin/audit-logs?limit=100${action ? `&action=${action}` : ''}`).then(r => setLogs(r.data.data)).finally(() => setLoading(false));
  }, [action]);

  const actions = ['LOGIN', 'USER_CREATED', 'ROLE_CHANGED', 'WELL_CREATED', 'REPORT_UPLOADED', 'DATA_APPROVED', 'DATA_REJECTED', 'KNOWLEDGE_INDEXED', 'RISK_ACKNOWLEDGED'];

  if (loading) return <LoadingState />;

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / accountability</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Audit Logs</h1>
            <p className="mt-1 text-sm text-slate-500">{logs.length} log entries</p>
          </div>
          <label className="text-xs font-semibold text-[#526574]">
            Filter by action
            <select aria-label="Filter audit logs by action" value={action} onChange={e => setAction(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
              <option value="">All Actions</option>
              {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
        </div>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Audit event records">
        <div className="border-b border-slate-100 px-4 py-4"><h2 className="text-base font-semibold text-[#173f5f]">Activity record</h2><p className="text-xs text-slate-500">Recent account and data actions</p></div>
        <div className="overflow-x-auto"><table className="min-w-full text-xs">
          <thead><tr className="bg-[#edf2f4] text-[#526574]">
            <th className="text-left px-4 py-3 font-medium">Timestamp</th>
            <th className="text-left px-4 py-3 font-medium">User</th>
            <th className="text-left px-4 py-3 font-medium">Role</th>
            <th className="text-left px-4 py-3 font-medium">Action</th>
            <th className="text-left px-4 py-3 font-medium">Entity</th>
            <th className="text-left px-4 py-3 font-medium">Details</th>
          </tr></thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} className="border-t border-slate-100 transition-colors hover:bg-[#f7f8f5]">
                <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2.5 font-medium text-slate-700">{log.userId?.name || log.userName || '—'}</td>
                <td className="px-4 py-2.5"><span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded">{log.userRole || '—'}</span></td>
                <td className="px-4 py-2.5"><span className="font-medium text-slate-700">{log.action?.replace(/_/g, ' ')}</span></td>
                <td className="px-4 py-2.5 text-slate-500">{log.entityType || '—'}</td>
                <td className="px-4 py-2.5 text-slate-400 max-w-xs truncate">{log.details ? JSON.stringify(log.details).substring(0, 80) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {logs.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No audit logs yet.</div>}
      </section>
    </div>
  );
};

export const DataQuality = () => {
  const [quality, setQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/data-quality').then(r => setQuality(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const severityColor = { HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-amber-100 text-amber-700', INFO: 'bg-blue-100 text-blue-700' };

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / data stewardship</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Data Quality Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Detect and resolve data integrity issues</p>
        </div>
      </div>
      <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-7 text-center shadow-sm sm:flex-row sm:gap-5 ${quality?.qualityScore >= 80 ? 'bg-emerald-50 border-emerald-200' : quality?.qualityScore >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
        <div className="text-5xl font-bold tracking-tight text-[#173f5f]">{quality?.qualityScore}%</div>
        <div className="sm:text-left"><div className="text-base font-semibold text-[#173f5f]">Overall Data Quality Score</div><div className="text-sm text-slate-500">Current integrity assessment across the knowledge base</div></div>
      </div>
      <section className="space-y-3" aria-label="Data quality findings">
        <h2 className="text-base font-semibold text-[#173f5f]">Integrity findings</h2>
        {quality?.issues?.length === 0 && <div className="text-center py-8 text-emerald-600 font-medium text-sm">✓ No data quality issues detected.</div>}
        {quality?.issues?.map((issue, i) => (
          <div key={i} className={`flex items-start gap-4 rounded-2xl border p-4 shadow-sm ${severityColor[issue.severity] || 'bg-slate-50 border-slate-200'}`}>
            <div className="min-w-12 rounded-xl bg-white/70 px-3 py-2 text-center text-2xl font-bold">{issue.count}</div>
            <div>
              <div className="font-semibold text-sm">{issue.type?.replace(/_/g, ' ')}</div>
              <div className="text-xs mt-0.5 opacity-80">{issue.message}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export const KnowledgeBase = () => {
  const [ragStatus, setRagStatus] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/rag/status').then(r => setRagStatus(r.data.data)),
      api.get('/reports?extractionStatus=COMPLETED').then(r => setDocs(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleIndex = async (docId) => {
    setIndexing(p => ({ ...p, [docId]: true }));
    try {
      await api.post('/rag/index', { documentId: docId });
      api.get('/rag/status').then(r => setRagStatus(r.data.data));
      api.get('/reports?extractionStatus=COMPLETED').then(r => setDocs(r.data.data));
    } catch (e) {
      alert('Indexing failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setIndexing(p => ({ ...p, [docId]: false }));
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / retrieval index</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Verified RAG Knowledge Base</h1>
          <p className="mt-1 text-sm text-slate-500">Index approved documents for semantic search</p>
        </div>
      </div>
      {ragStatus && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Chunks', value: ragStatus.totalChunks },
            { label: 'Verified Chunks', value: ragStatus.verifiedChunks },
            { label: 'AI Service', value: ragStatus.aiServiceAvailable ? 'Available' : 'Unavailable', color: ragStatus.aiServiceAvailable ? 'text-emerald-600' : 'text-red-600' },
            { label: 'Last Indexed', value: ragStatus.lastIndexed ? new Date(ragStatus.lastIndexed).toLocaleDateString() : 'Never' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="text-xs text-slate-400 mb-1">{m.label}</div>
              <div className={`text-xl font-bold ${m.color || 'text-slate-800'}`}>{m.value}</div>
            </div>
          ))}
        </div>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Documents available for indexing">
        <div className="border-b border-slate-100 px-4 py-4"><h2 className="text-base font-semibold text-[#173f5f]">Verified document index</h2><p className="text-xs text-slate-500">Only approved reports can be added to retrieval.</p></div>
        <div className="overflow-x-auto"><table className="min-w-full text-xs">
          <thead><tr className="bg-[#edf2f4] text-[#526574]">
            <th className="text-left px-4 py-3 font-medium">Document</th>
            <th className="text-left px-4 py-3 font-medium">Well</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Indexed</th>
            <th className="text-left px-4 py-3 font-medium">Action</th>
          </tr></thead>
          <tbody>
            {docs.map(d => (
              <tr key={d._id} className="border-t border-slate-100 transition-colors hover:bg-[#f7f8f5]">
                <td className="px-4 py-3 font-medium text-slate-700">{d.title}</td>
                <td className="px-4 py-3 text-slate-500">{d.wellName || '—'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full font-medium ${d.verificationStatus === 'FULLY_APPROVED' || d.verificationStatus === 'PARTIALLY_APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.verificationStatus?.replace(/_/g, ' ')}</span></td>
                <td className="px-4 py-3">{d.indexedInRAG ? <span className="text-emerald-600 font-medium">✓ Indexed</span> : <span className="text-slate-400">Not indexed</span>}</td>
                <td className="px-4 py-3">
                  {!d.indexedInRAG && (d.verificationStatus === 'FULLY_APPROVED' || d.verificationStatus === 'PARTIALLY_APPROVED') && (
                    <button onClick={() => handleIndex(d._id)} disabled={indexing[d._id]}
                      className="min-h-9 rounded-lg bg-[#173f5f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#102f47] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
                      {indexing[d._id] ? 'Indexing...' : 'Index Now'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {docs.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-500">No completed documents are available for indexing.</div>}
      </section>
    </div>
  );
};

export const AdminWells = () => {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/wells').then(r => setWells(r.data.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingState />;
  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / asset inventory</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Well Data Management</h1>
          <p className="mt-1 text-sm text-slate-500">{wells.length} wells in the database</p>
        </div>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Well data">
        <div className="border-b border-slate-100 px-4 py-4"><h2 className="text-base font-semibold text-[#173f5f]">Well inventory</h2><p className="text-xs text-slate-500">Location, drilling progress and geological context</p></div>
        <div className="overflow-x-auto"><table className="min-w-full text-xs">
          <thead><tr className="bg-[#edf2f4] text-[#526574]">
            <th className="text-left px-4 py-3 font-medium">Well</th>
            <th className="text-left px-4 py-3 font-medium">Field</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Lat</th>
            <th className="text-left px-4 py-3 font-medium">Lon</th>
            <th className="text-left px-4 py-3 font-medium">Depth</th>
            <th className="text-left px-4 py-3 font-medium">Target</th>
            <th className="text-left px-4 py-3 font-medium">Formations</th>
          </tr></thead>
          <tbody>
            {wells.map(w => (
              <tr key={w._id} className="border-t border-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{w.wellName}</td>
                <td className="px-4 py-3">{w.field}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 rounded-full">{w.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{w.latitude?.toFixed(4)}</td>
                <td className="px-4 py-3 text-slate-500">{w.longitude?.toFixed(4)}</td>
                <td className="px-4 py-3">{w.currentDepth}m</td>
                <td className="px-4 py-3">{w.targetDepth}m</td>
                <td className="px-4 py-3">{w.formations?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
};
