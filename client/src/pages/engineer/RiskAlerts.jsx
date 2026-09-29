import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import RiskBadge from '../../components/RiskBadge';
import AlertCard from '../../components/AlertCard';
import { LoadingState, EmptyState } from '../../components/States';
import { AlertTriangle, RefreshCw, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RiskAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [wells, setWells] = useState([]);
  const [selectedWell, setSelectedWell] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterLevel, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsRes, wellsRes] = await Promise.all([
        api.get(`/risks?${filterLevel ? `riskLevel=${filterLevel}&` : ''}${filterStatus ? `status=${filterStatus}` : ''}`),
        api.get('/wells?status=DRILLING'),
      ]);
      setAlerts(alertsRes.data.data);
      setWells(wellsRes.data.data);
      if (!selectedWell && wellsRes.data.data.length > 0) setSelectedWell(wellsRes.data.data[0]._id);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedWell) return;
    setCalculating(true);
    try {
      const res = await api.post('/risks/calculate', { activeWellId: selectedWell, radius: 20 });
      alert(`${res.data.data?.length || 0} new risk alerts generated.`);
      loadData();
    } catch (e) {
      alert('Risk calculation failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setCalculating(false);
    }
  };

  const handleAcknowledge = async (alert) => {
    const note = window.prompt('Acknowledgement note (optional):') || '';
    try {
      await api.post(`/risks/${alert._id}/acknowledge`, { note });
      loadData();
    } catch {}
  };

  if (loading) return <LoadingState message="Loading risk alerts..." />;

  return (
    <div className="engineer-page engineer-page--risk space-y-6">
      <header className="flex flex-col gap-3 border-b-2 border-amber-400 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-4 border-blue-900 pl-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Operations assurance / watchlist</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">Risk Radar</h1>
          <p className="mt-1 text-sm text-slate-500">Historical risk indicators based on offset well intelligence.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-2 text-sm text-white"><AlertTriangle className="h-4 w-4 text-amber-400" /> {alerts.length} <span className="text-blue-100">indicators</span></div>
      </header>

      <div role="note" className="bg-amber-50 border-l-4 border-amber-500 border-y border-r border-amber-200 rounded-lg px-4 py-3 text-xs leading-relaxed text-amber-900">
        <strong>Important:</strong> These are prototype historical-risk indicators based on verified offset well data. They represent historical patterns, not predictions. All indicators require engineering review.
      </div>

      {/* Controls */}
      <section aria-label="Risk alert controls" className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-900 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Well (for calculation)</label>
          <select aria-label="Well for risk calculation" value={selectedWell} onChange={e => setSelectedWell(e.target.value)} className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none">
            {wells.map(w => <option key={w._id} value={w._id}>{w.wellName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Risk Level</label>
          <select aria-label="Filter alerts by risk level" value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none">
            <option value="">All Levels</option>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select aria-label="Filter alerts by status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none">
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
          </select>
        </div>
        <button
          aria-label="Calculate historical risk indicators"
          onClick={handleCalculate}
          disabled={calculating || !selectedWell}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-950 text-white text-sm rounded-lg hover:bg-blue-900 disabled:opacity-50"
        >
          <Calculator className="w-4 h-4" />
          {calculating ? 'Calculating...' : 'Calculate Risks'}
        </button>
        <button aria-label="Refresh risk alerts" onClick={loadData} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-amber-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </section>

      {/* Alerts grid */}
      {alerts.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="w-10 h-10" />}
          title="No risk alerts found"
          message="Run risk calculation to generate historical risk indicators for active wells."
        />
      ) : (
        <section aria-label="Risk alert results">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{alerts.length} alert(s) found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(alert => (
              <AlertCard
                key={alert._id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
                onAskAI={(a) => navigate(`/engineer/ai-assistant?query=${encodeURIComponent(a.reason)}&wellId=${a.activeWellId?._id || a.activeWellId}`)}
                onViewSource={() => navigate('/engineer/reports')}
                onCompare={() => navigate('/engineer/offset-intelligence')}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RiskAlerts;
