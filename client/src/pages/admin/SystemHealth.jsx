import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingState } from '../../components/States';

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ragStatus, setRagStatus] = useState(null);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const [healthRes, ragRes] = await Promise.all([
        api.get('/admin/system-health'),
        api.get('/rag/status'),
      ]);
      setHealth(healthRes.data.data);
      setRagStatus(ragRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Checking system health..." />;

  const statusBg = (status) => {
    if (['HEALTHY', 'CONNECTED', 'CONFIGURED', 'INDEXED'].includes(status)) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (['UNAVAILABLE', 'DISCONNECTED', 'NOT_CONFIGURED'].includes(status)) return 'bg-red-50 border-red-200 text-red-700';
    if (['DEGRADED', 'NOT_INDEXED'].includes(status)) return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-amber-50 border-amber-200 text-amber-700';
  };

  const statusLabel = (key, status) => {
    const labels = {
      HEALTHY: 'Healthy',
      CONNECTED: 'Connected',
      CONFIGURED: 'Configured',
      INDEXED: 'Indexed',
      DEGRADED: 'Degraded',
      NOT_CONFIGURED: 'Not Configured',
      NOT_INDEXED: 'Not Indexed',
      DISCONNECTED: 'Disconnected',
      UNAVAILABLE: 'Unavailable',
      UNKNOWN: 'Checking…',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / infrastructure</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">System Health Monitor</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time service status and infrastructure monitoring · Refreshes every 30 seconds</p>
        </div>
      </div>

      {health && (
        <>
          <section aria-label="Service health" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,39,56,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-base font-semibold text-[#173f5f]">Service health</h2><p className="text-xs text-slate-500">Current connection and indexing state</p></div>
            <span className="rounded-full bg-[#eaf4ee] px-3 py-1 text-xs font-semibold text-[#287247]">Auto refresh</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {Object.entries(health.services).map(([key, svc]) => (
              <div key={key} className={`rounded-xl border p-4 ${statusBg(svc.status)}`} aria-label={`${key} status: ${statusLabel(key, svc.status)}`}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${['HEALTHY', 'CONNECTED', 'CONFIGURED', 'INDEXED'].includes(svc.status) ? 'bg-emerald-500' : ['UNAVAILABLE', 'DISCONNECTED', 'NOT_CONFIGURED'].includes(svc.status) ? 'bg-red-500' : 'bg-amber-500'}`} aria-hidden="true" />
                  <div className="text-xs font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                </div>
                <div className="text-lg font-bold">{statusLabel(key, svc.status)}</div>
                <div className="mt-1 text-xs leading-relaxed opacity-75">{svc.message}</div>
              </div>
            ))}
          </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,39,56,0.06)]">
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-base font-semibold text-[#173f5f]">Backend Stats</h3>
              <div className="space-y-3 text-xs text-slate-500">
                <div className="flex justify-between"><span>Uptime</span><span className="font-medium text-slate-700">{Math.floor(health.services.backend?.uptime || 0)}s</span></div>
                <div className="flex justify-between"><span>Memory (used)</span><span className="font-medium text-slate-700">{Math.round((health.services.backend?.memory?.heapUsed || 0) / 1024 / 1024)}MB</span></div>
                <div className="flex justify-between"><span>Platform</span><span className="font-medium text-slate-700">{health.system?.platform}</span></div>
                <div className="flex justify-between"><span>CPUs</span><span className="font-medium text-slate-700">{health.system?.cpus}</span></div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,39,56,0.06)]">
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-base font-semibold text-[#173f5f]">Knowledge Base</h3>
              <div className="space-y-3 text-xs text-slate-500">
                <div className="flex justify-between"><span>Total Documents</span><span className="font-medium text-slate-700">{health.stats?.totalDocs}</span></div>
                <div className="flex justify-between"><span>Verified Events</span><span className="font-medium text-slate-700">{health.stats?.totalEvents}</span></div>
                <div className="flex justify-between"><span>RAG Chunks</span><span className="font-medium text-slate-700">{ragStatus?.totalChunks || 0}</span></div>
                <div className="flex justify-between"><span>Verified Chunks</span><span className="font-medium text-slate-700">{ragStatus?.verifiedChunks || 0}</span></div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,39,56,0.06)]">
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-base font-semibold text-[#173f5f]">AI Service</h3>
              <div className="space-y-3 text-xs text-slate-500">
                {(() => {
                  const aiSt = health.services.aiService?.status;
                  const gemSt = health.services.gemini?.status;
                  const faissSt = health.services.faiss?.status;
                  const svcLabels = { HEALTHY: 'Healthy', CONNECTED: 'Connected', CONFIGURED: 'Configured', INDEXED: 'Indexed', DEGRADED: 'Degraded', NOT_CONFIGURED: 'Not Configured', NOT_INDEXED: 'Not Indexed', DISCONNECTED: 'Disconnected', UNAVAILABLE: 'Unavailable', UNKNOWN: 'Checking…' };
                  const aiColor = aiSt === 'HEALTHY' ? 'text-emerald-600' : aiSt === 'DEGRADED' ? 'text-amber-600' : 'text-red-600';
                  const gemColor = gemSt === 'CONFIGURED' ? 'text-emerald-600' : 'text-amber-600';
                  const faissColor = faissSt === 'INDEXED' ? 'text-emerald-600' : 'text-amber-600';
                  return (
                    <>
                      <div className="flex justify-between"><span>Status</span><span className={`font-medium ${aiColor}`}>{svcLabels[aiSt] || aiSt}</span></div>
                      <div className="flex justify-between"><span>Gemini</span><span className={`font-medium ${gemColor}`}>{svcLabels[gemSt] || gemSt}</span></div>
                      <div className="flex justify-between"><span>FAISS</span><span className={`font-medium ${faissColor}`}>{svcLabels[faissSt] || faissSt}</span></div>
                      <div className="flex justify-between"><span>Last Indexed</span><span className="font-medium text-slate-700">{ragStatus?.lastIndexed ? new Date(ragStatus.lastIndexed).toLocaleDateString() : 'Never'}</span></div>
                    </>
                  );
                })()}
              </div>
            </section>
            </div>

          <div className="text-xs text-slate-400 text-right">Last updated: {new Date(health.timestamp).toLocaleTimeString()}</div>
        </>
      )}
    </div>
  );
};

export default SystemHealth;
