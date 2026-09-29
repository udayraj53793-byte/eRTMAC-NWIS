import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MetricCard from '../../components/MetricCard';
import { LoadingState } from '../../components/States';
import { Users, FileText, Database, Activity, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/admin/system-health'),
    ]).then(([ovRes, healthRes]) => {
      setOverview(ovRes.data.data);
      setHealth(healthRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading admin dashboard..." />;

  const { metrics } = overview || {};

  const quickLinks = [
    { label: 'User Management', path: '/admin/users', icon: Users, tile: 'bg-[#e8f0f5] text-[#173f5f]', desc: 'Manage engineers & managers' },
    { label: 'Upload Documents', path: '/admin/reports', icon: FileText, tile: 'bg-[#fff4d2] text-[#8a6b12]', desc: 'Ingest drilling reports' },
    { label: 'AI Extraction', path: '/admin/extraction-review', icon: Shield, tile: 'bg-[#e8f0f5] text-[#173f5f]', desc: 'Review AI-extracted data' },
    { label: 'Verify Knowledge', path: '/admin/data-verification', icon: CheckCircle, tile: 'bg-[#eaf4ee] text-[#287247]', desc: 'Approve/reject extractions' },
    { label: 'Data Quality', path: '/admin/data-quality', icon: AlertTriangle, tile: 'bg-[#fff4d2] text-[#8a6b12]', desc: 'Monitor data integrity' },
    { label: 'System Health', path: '/admin/system-health', icon: Activity, tile: 'bg-[#e8f0f5] text-[#173f5f]', desc: 'Monitor all services' },
  ];

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / control plane</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Trusted Knowledge & Security Center</h1>
          <p className="mt-1 text-sm text-slate-500">System administration and knowledge verification</p>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={metrics.totalUsers} icon={Users} color="blue" />
          <MetricCard title="Total Wells" value={metrics.totalWells} icon={Database} color="slate" />
          <MetricCard title="Verified Events" value={metrics.totalEvents} icon={CheckCircle} color="green" />
          <MetricCard title="Pending Reviews" value={metrics.pendingReviews} icon={AlertTriangle} color={metrics.pendingReviews > 0 ? 'amber' : 'green'} />
        </div>
      )}

      {/* System health */}
      {health && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,39,56,0.06)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div><p className="text-base font-semibold text-[#173f5f]">System status</p><p className="text-xs text-slate-500">Service availability at a glance</p></div>
            <span className="rounded-full bg-[#eaf4ee] px-3 py-1 text-xs font-semibold text-[#287247]">Live checks</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(health.services).map(([key, svc]) => {
              const ok = ['HEALTHY', 'CONNECTED', 'CONFIGURED', 'INDEXED'].includes(svc.status);
              const warn = ['DEGRADED', 'NOT_INDEXED'].includes(svc.status);
              const svcLabels = { HEALTHY: 'Healthy', CONNECTED: 'Connected', CONFIGURED: 'Configured', INDEXED: 'Indexed', DEGRADED: 'Degraded', NOT_CONFIGURED: 'Not Configured', NOT_INDEXED: 'Not Indexed', DISCONNECTED: 'Disconnected', UNAVAILABLE: 'Unavailable', UNKNOWN: 'Checking…' };
              return (
                <div key={key} className={`rounded-xl p-3 border ${ok ? 'bg-emerald-50 border-emerald-200' : warn ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="text-xs font-semibold text-slate-600 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className={`text-xs font-bold ${ok ? 'text-emerald-700' : warn ? 'text-amber-700' : 'text-red-600'}`}>
                    {svcLabels[svc.status] || svc.status}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section aria-label="Administration shortcuts">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6b12]">Workspace</p><h2 className="text-lg font-semibold text-[#173f5f]">Administration shortcuts</h2></div>
        <span className="hidden text-xs text-slate-500 sm:block">Choose a workspace to continue</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map(item => (
          <Link key={item.path} to={item.path} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#c79b24] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.tile}`}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#173f5f]">{item.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</div>
            </div>
            <span className="ml-auto self-center text-lg text-[#c79b24] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
