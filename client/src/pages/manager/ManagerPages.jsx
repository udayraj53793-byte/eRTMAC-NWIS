// Manager supporting pages — full production UI with real data

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RiskBadge from '../../components/RiskBadge';
import MetricCard from '../../components/MetricCard';
import { LoadingState, EmptyState } from '../../components/States';
import AIChat from '../../components/AIChat';
import WellMap from '../../components/WellMap';
import {
  AlertTriangle, Activity, TrendingUp, Layers, Users,
  Clock, CheckCircle, RefreshCw, Filter, MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';

const RISK_COLORS = { LOW: '#287247', MEDIUM: '#c79b24', HIGH: '#d87634', CRITICAL: '#a8443a' };
const SEV_COLORS = { LOW: '#287247', MEDIUM: '#c79b24', HIGH: '#d87634', CRITICAL: '#a8443a' };
const CHART_COLORS = ['#173f5f', '#287247', '#c79b24', '#d87634', '#a8443a', '#7a8d9a', '#526574'];

/* ─── Manager Wells ─────────────────────────────────────────────────── */
export const ManagerWells = () => {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterField, setFilterField] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/wells').then(r => setWells(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading wells..." />;

  const fields = [...new Set(wells.map(w => w.field))];
  const filtered = wells.filter(w => {
    if (filterStatus && w.status !== filterStatus) return false;
    if (filterRisk && w.riskLevel !== filterRisk) return false;
    if (filterField && w.field !== filterField) return false;
    return true;
  });

  const statusCounts = wells.reduce((acc, w) => { acc[w.status] = (acc[w.status] || 0) + 1; return acc; }, {});
  const riskCounts = wells.reduce((acc, w) => { acc[w.riskLevel] = (acc[w.riskLevel] || 0) + 1; return acc; }, {});

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Operations / asset register</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">All Wells</h1>
          <p className="mt-1 text-sm text-slate-500">{wells.length} wells in portfolio · Filter assets by status, risk and field</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Drilling', count: statusCounts['DRILLING'] || 0, color: 'bg-blue-100 text-blue-700' },
          { label: 'Completed', count: statusCounts['COMPLETED'] || 0, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'High Risk', count: (riskCounts['HIGH'] || 0) + (riskCounts['CRITICAL'] || 0), color: 'bg-orange-100 text-orange-700' },
          { label: 'Suspended', count: statusCounts['SUSPENDED'] || 0, color: 'bg-amber-100 text-amber-700' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 border-l-4 border-l-[#c79b24] bg-white p-4 shadow-sm">
            <div className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.count}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label htmlFor="well-filter-status" className="mb-1 block text-xs font-semibold text-[#526574]">Status</label>
          <select id="well-filter-status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
            <option value="">All</option>
            {['DRILLING', 'COMPLETED', 'PRODUCING', 'SUSPENDED', 'ABANDONED', 'TESTING'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="well-filter-risk" className="mb-1 block text-xs font-semibold text-[#526574]">Risk</label>
          <select id="well-filter-risk" value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
            <option value="">All</option>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="well-filter-field" className="mb-1 block text-xs font-semibold text-[#526574]">Field</label>
          <select id="well-filter-field" value={filterField} onChange={e => setFilterField(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
            <option value="">All Fields</option>
            {fields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="text-sm text-slate-400 ml-auto">{filtered.length} result(s)</div>
      </div>

      {/* Map + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)] lg:col-span-3" aria-label="Well location map">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-[#173f5f]">Portfolio map</p>
            <p className="text-xs text-slate-500">Geographic context for the filtered well set</p>
          </div>
          <WellMap
            activeWell={wells.find(w => w.status === 'DRILLING')}
            nearbyWells={filtered}
            height="360px"
          />
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)] lg:col-span-2" aria-label="Filtered wells">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-[#173f5f]">Well register</p>
            <p className="text-xs text-slate-500">{filtered.length} matching assets</p>
          </div>
          <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead><tr className="bg-[#edf2f4] text-[#526574]">
              <th className="text-left px-3 py-3 font-medium">Well</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-left px-3 py-3 font-medium">Depth</th>
              <th className="text-left px-3 py-3 font-medium">Risk</th>
            </tr></thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w._id} tabIndex={0} role="button" aria-label={`View risk overview for ${w.wellName}`} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/manager/risk'); }} className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-[#f7f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c79b24]" onClick={() => navigate('/manager/risk')}>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{w.wellName}</td>
                  <td className="px-3 py-2.5"><span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded-full">{w.status}</span></td>
                  <td className="px-3 py-2.5 text-slate-600">{w.currentDepth?.toLocaleString()}m</td>
                  <td className="px-3 py-2.5"><RiskBadge level={w.riskLevel} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No wells match filters.</div>}
        </section>
      </div>
    </div>
  );
};

/* ─── Manager Risk Overview ─────────────────────────────────────────── */
export const ManagerRisk = () => {
  const [alerts, setAlerts] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('OPEN');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/risks'),
      api.get('/analytics/risks'),
      api.get('/wells'),
    ]).then(([ar, rr, wr]) => {
      setAlerts(ar.data.data);
      setRiskData(rr.data.data);
      setWells(wr.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading risk overview..." />;

  const filtered = alerts.filter(a => {
    if (filterLevel && a.riskLevel !== filterLevel) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const byLevel = riskData?.byLevel?.map(r => ({ name: r._id, value: r.count })) || [];
  const byStatus = riskData?.byStatus?.map(r => ({ name: r._id, count: r.count })) || [];
  const highRiskWells = wells.filter(w => ['HIGH', 'CRITICAL'].includes(w.riskLevel));

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Operations / risk watch</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Risk Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Enterprise risk monitoring — prototype historical-risk scoring model</p>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', val: alerts.length, icon: AlertTriangle, color: 'orange' },
          { label: 'Open', val: alerts.filter(a => a.status === 'OPEN').length, icon: Activity, color: 'red' },
          { label: 'Acknowledged', val: alerts.filter(a => a.status === 'ACKNOWLEDGED').length, icon: CheckCircle, color: 'green' },
          { label: 'High Risk Wells', val: highRiskWells.length, icon: MapPin, color: 'orange' },
        ].map(m => <MetricCard key={m.label} title={m.label} value={m.val} icon={m.icon} color={m.color} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Risk by level pie */}
        {byLevel.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Alerts by Risk Level</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byLevel} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {byLevel.map((e, i) => <Cell key={i} fill={RISK_COLORS[e.name] || CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Alert status bar */}
        {byStatus.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Alert Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#173f5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        {[['filterLevel', 'Risk Level', ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']],
          ['filterStatus', 'Status', ['', 'OPEN', 'ACKNOWLEDGED']]].map(([key, label, opts]) => (
          <div key={key}>
            <label htmlFor={key} className="mb-1 block text-xs font-semibold text-[#526574]">{label}</label>
            <select
              id={key}
              value={key === 'filterLevel' ? filterLevel : filterStatus}
              onChange={e => key === 'filterLevel' ? setFilterLevel(e.target.value) : setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]"
            >
              {opts.map(o => <option key={o} value={o}>{o || `All ${label}s`}</option>)}
            </select>
          </div>
        ))}
        <div className="text-sm text-slate-400 self-end">{filtered.length} alert(s)</div>
      </div>

      {/* Alerts table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Risk alerts">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div><p className="text-base font-semibold text-[#173f5f]">Risk alert register</p><p className="text-xs text-slate-500">Current alerts and supporting well context</p></div>
          <span className="rounded-full bg-[#fff6db] px-3 py-1 text-xs font-semibold text-[#80620d]">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead><tr className="bg-[#edf2f4] text-[#526574]">
            <th className="text-left px-4 py-3 font-medium">Active Well</th>
            <th className="text-left px-4 py-3 font-medium">Offset Well</th>
            <th className="text-left px-4 py-3 font-medium">Event Type</th>
            <th className="text-left px-4 py-3 font-medium">Risk</th>
            <th className="text-left px-4 py-3 font-medium">Score</th>
            <th className="text-left px-4 py-3 font-medium">Depth Δ</th>
            <th className="text-left px-4 py-3 font-medium">Distance</th>
            <th className="text-left px-4 py-3 font-medium">Formation</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a._id} className="border-t border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{a.activeWellName || a.activeWellId?.wellName}</td>
                <td className="px-4 py-3 text-slate-600">{a.offsetWellName || a.offsetWellId?.wellName}</td>
                <td className="px-4 py-3 text-slate-600">{a.eventType?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3"><RiskBadge level={a.riskLevel} size="xs" /></td>
                <td className="px-4 py-3 font-bold text-blue-700">{a.riskScore}</td>
                <td className="px-4 py-3 text-slate-600">{a.depthDifference}m</td>
                <td className="px-4 py-3 text-slate-600">{a.distance} km</td>
                <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${a.formationSimilarity === 'HIGH' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{a.formationSimilarity}</span></td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${a.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No alerts match current filters.</div>}
      </section>
    </div>
  );
};

/* ─── Manager Incidents ─────────────────────────────────────────────── */
export const ManagerIncidents = () => {
  const [events, setEvents] = useState([]);
  const [eventData, setEventData] = useState(null);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterSev, setFilterSev] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/events?verificationStatus=APPROVED&limit=100'),
      api.get('/analytics/events'),
      api.get('/analytics/formations'),
    ]).then(([er, evr, fr]) => {
      setEvents(er.data.data);
      setEventData(evr.data.data);
      setFormData(fr.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading incident analytics..." />;

  const eventTypes = [...new Set(events.map(e => e.eventType))];
  const filtered = events.filter(e => {
    if (filterType && e.eventType !== filterType) return false;
    if (filterSev && e.severity !== filterSev) return false;
    return true;
  });

  const byTypeData = eventData?.byType?.map(e => ({
    name: e._id?.replace(/_/g, ' ')?.substring(0, 14) || 'Unknown',
    count: e.count,
    npt: parseFloat(e.totalNPT?.toFixed(1) || 0),
  })) || [];

  const bySeverityData = eventData?.bySeverity?.map(e => ({ name: e._id, value: e.count })) || [];

  const formChartData = formData.slice(0, 6).map(f => ({
    name: f._id?.substring(0, 15) || 'Unknown',
    events: f.totalEvents,
  }));

  const totalNPT = events.reduce((s, e) => s + (e.nptHours || 0), 0);

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Operations / verified events</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Incident & NPT Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">{events.length} verified incidents · Total NPT: {totalNPT.toFixed(1)} hrs</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', val: events.length },
          { label: 'Total NPT (hrs)', val: totalNPT.toFixed(1) },
          { label: 'Critical', val: events.filter(e => e.severity === 'CRITICAL').length },
          { label: 'High', val: events.filter(e => e.severity === 'HIGH').length },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="text-xs text-slate-400 mb-1">{m.label}</div>
            <div className="text-2xl font-bold text-slate-800">{m.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Event type bar */}
        {byTypeData.length > 0 && (
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Events & NPT by Type</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byTypeData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="count" fill="#173f5f" name="Count" radius={[4, 4, 0, 0]} />
                <Bar dataKey="npt" fill="#c79b24" name="NPT (hrs)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Severity pie */}
        {bySeverityData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">By Severity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bySeverityData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {bySeverityData.map((e, i) => <Cell key={i} fill={SEV_COLORS[e.name] || CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Formation chart */}
      {formChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Events by Formation</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={formChartData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="events" fill="#287247" name="Events" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filter + table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div>
          <label htmlFor="incident-filter-type" className="mb-1 block text-xs font-semibold text-[#526574]">Event Type</label>
          <select id="incident-filter-type" value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
            <option value="">All Types</option>
            {eventTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="incident-filter-severity" className="mb-1 block text-xs font-semibold text-[#526574]">Severity</label>
          <select id="incident-filter-severity" value={filterSev} onChange={e => setFilterSev(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
            <option value="">All</option>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Verified incidents">
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="text-base font-semibold text-[#173f5f]">Verified incident register</p>
          <p className="text-xs text-slate-500">{filtered.length} records match the selected filters</p>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead><tr className="bg-[#edf2f4] text-[#526574]">
            <th className="text-left px-4 py-3 font-medium">Well</th>
            <th className="text-left px-4 py-3 font-medium">Event</th>
            <th className="text-left px-4 py-3 font-medium">Depth</th>
            <th className="text-left px-4 py-3 font-medium">Formation</th>
            <th className="text-left px-4 py-3 font-medium">Severity</th>
            <th className="text-left px-4 py-3 font-medium">NPT (hrs)</th>
            <th className="text-left px-4 py-3 font-medium">Mitigation</th>
          </tr></thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e._id} className="border-t border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{e.wellId?.wellName || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{e.eventType?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-slate-600">{e.depth}m</td>
                <td className="px-4 py-3 text-slate-500">{e.formation || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded font-medium text-xs`} style={{ background: SEV_COLORS[e.severity] + '20', color: SEV_COLORS[e.severity] }}>
                    {e.severity}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">{e.nptHours || 0}</td>
                <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{e.mitigation?.substring(0, 60) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No incidents match filters.</div>}
      </section>
    </div>
  );
};

/* ─── Manager AI Briefing ───────────────────────────────────────────── */
export const ManagerAIBriefing = () => {
  const [briefing, setBriefing] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  useEffect(() => {
    api.post('/ai/operations-summary').then(r => setBriefing(r.data.data)).catch(() => {}).finally(() => setLoadingBriefing(false));
  }, []);

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Operations / decision support</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">AI Operations Briefing</h1>
          <p className="mt-1 text-sm text-slate-500">Source-grounded operational intelligence summary</p>
        </div>
      </div>

      {/* Auto-generated briefing card */}
      <div className="rounded-2xl border border-[#cbdde7] bg-gradient-to-br from-white via-[#f2f7fa] to-[#e7f0f5] p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-sm font-semibold text-blue-800">Automated Operations Summary</span>
          {briefing && !briefing.isAIGenerated && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Deterministic fallback</span>}
        </div>
        {loadingBriefing ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <RefreshCw size={14} className="animate-spin" /> Generating briefing...
          </div>
        ) : briefing ? (
          <>
            <p className="text-sm text-slate-700 leading-relaxed">{briefing.summary}</p>
            {briefing.metrics && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Active Wells', val: briefing.metrics.activeWells },
                  { label: 'Open Alerts', val: briefing.metrics.openAlerts },
                  { label: 'High Risk', val: briefing.metrics.highRiskAlerts },
                  { label: 'Recent Events', val: briefing.metrics.recentEvents },
                ].map(m => (
                  <div key={m.label} className="bg-white/70 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-slate-800">{m.val}</div>
                    <div className="text-xs text-slate-400">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 italic mt-3">{briefing.disclaimer}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Briefing unavailable. Using chat interface below.</p>
        )}
      </div>

      {/* Safety notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
        <strong>Decision Support:</strong> This AI briefing is generated from the verified knowledge base. All statements are based on available operational data. Critical decisions require direct engineering review.
      </div>

      {/* Interactive chat */}
      <div style={{ height: 'calc(100vh - 520px)', minHeight: '350px' }}>
        <AIChat />
      </div>
    </div>
  );
};

/* ─── Manager Team Activity ─────────────────────────────────────────── */
export const ManagerTeam = () => {
  const [ackAlerts, setAckAlerts] = useState([]);
  const [openAlerts, setOpenAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/risks?status=ACKNOWLEDGED'),
      api.get('/risks?status=OPEN'),
    ]).then(([ar, or]) => {
      setAckAlerts(ar.data.data);
      setOpenAlerts(or.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading team activity..." />;

  const avgAckMinutes = ackAlerts.length > 0
    ? (ackAlerts.reduce((s, a) => {
        const diff = new Date(a.acknowledgedAt) - new Date(a.createdAt);
        return s + (isNaN(diff) ? 0 : diff);
      }, 0) / ackAlerts.length / 60000).toFixed(0)
    : 'N/A';

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Operations / team response</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Team & Alert Monitoring</h1>
          <p className="mt-1 text-sm text-slate-500">Alert acknowledgement tracking and team response</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open Alerts', val: openAlerts.length, color: 'text-orange-600' },
          { label: 'Acknowledged', val: ackAlerts.length, color: 'text-emerald-600' },
          { label: 'Avg Ack Time', val: avgAckMinutes === 'N/A' ? 'N/A' : `${avgAckMinutes}m`, color: 'text-blue-600' },
          { label: 'Ack Rate', val: ackAlerts.length + openAlerts.length > 0 ? `${((ackAlerts.length / (ackAlerts.length + openAlerts.length)) * 100).toFixed(0)}%` : '0%', color: 'text-slate-700' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="text-xs text-slate-400 mb-1">{m.label}</div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Open alerts needing attention */}
      {openAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-orange-800">{openAlerts.length} Alert(s) Require Acknowledgement</h3>
          </div>
          <div className="space-y-2">
            {openAlerts.slice(0, 5).map(a => (
              <div key={a._id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-medium text-slate-700">{a.activeWellName}</span>
                  <span className="text-xs text-slate-400 ml-2">· {a.eventType?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge level={a.riskLevel} size="xs" />
                  <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acknowledged alerts log */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Acknowledged alert log">
        <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-700">Acknowledged Alert Log ({ackAlerts.length})</h3>
        </div>
        <div className="overflow-x-auto"><table className="min-w-full text-xs">
          <thead><tr className="bg-[#edf2f4] text-[#526574]">
            <th className="text-left px-4 py-3 font-medium">Alert</th>
            <th className="text-left px-4 py-3 font-medium">Well</th>
            <th className="text-left px-4 py-3 font-medium">Risk</th>
            <th className="text-left px-4 py-3 font-medium">Acknowledged By</th>
            <th className="text-left px-4 py-3 font-medium">Acknowledged At</th>
            <th className="text-left px-4 py-3 font-medium">Note</th>
          </tr></thead>
          <tbody>
            {ackAlerts.map(a => (
              <tr key={a._id} className="border-t border-slate-100 transition-colors hover:bg-[#f7f8f5]">
                <td className="px-4 py-3 text-slate-700">{a.eventType?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{a.activeWellName || a.activeWellId?.wellName}</td>
                <td className="px-4 py-3"><RiskBadge level={a.riskLevel} size="xs" /></td>
                <td className="px-4 py-3 text-slate-600">{a.acknowledgedBy?.name || '—'}</td>
                <td className="px-4 py-3 text-slate-400">{a.acknowledgedAt ? new Date(a.acknowledgedAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{a.acknowledgedNote || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {ackAlerts.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No acknowledged alerts yet.</div>}
      </section>
    </div>
  );
};
