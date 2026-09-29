import React from 'react';
import RiskBadge from './RiskBadge';
import { AlertTriangle, FileText, CheckCircle, ArrowRight } from 'lucide-react';

const AlertCard = ({ alert, onAcknowledge, onAskAI, onViewSource, onCompare }) => {
  const isOpen = alert.status === 'OPEN';
  return (
    <article className={`risk-alert-card relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${isOpen ? 'border-orange-200' : 'border-slate-200'}`}>
      <div className={`absolute inset-y-0 left-0 w-1 ${isOpen ? 'bg-amber-500' : 'bg-emerald-500'}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isOpen ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{isOpen ? 'Open indicator' : 'Reviewed indicator'}</div>
            <h3 className="mt-1 text-sm font-bold text-slate-800">{alert.eventType?.replace(/_/g, ' ')} risk</h3>
          </div>
        </div>
        <RiskBadge level={alert.riskLevel} size="xs" />
      </div>

      <p className="my-4 text-sm leading-relaxed text-slate-600">{alert.reason}</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active well</p>
          <p className="mt-1 truncate text-xs font-bold text-slate-700">{alert.activeWellName || alert.activeWellId?.wellName}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Offset well</p>
          <p className="mt-1 truncate text-xs font-bold text-slate-700">{alert.offsetWellName || alert.offsetWellId?.wellName}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Depth difference</p>
          <p className="mt-1 text-xs font-bold text-slate-700">{alert.depthDifference} m</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Distance</p>
          <p className="mt-1 text-xs font-bold text-slate-700">{alert.distance} km</p>
        </div>
      </div>

      {alert.evidence?.length > 0 && (
        <div className="my-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-slate-600">
          <FileText className="w-3.5 h-3.5" />
          Evidence: {alert.evidence[0].documentTitle} · Page {alert.evidence[0].page}
        </div>
      )}

      {isOpen ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
            >
              <CheckCircle className="w-3 h-3" /> Acknowledge
            </button>
          )}
          {onAskAI && (
            <button
              onClick={() => onAskAI(alert)}
              className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Ask AI
            </button>
          )}
          {onViewSource && (
            <button
              onClick={() => onViewSource(alert)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              View Source
            </button>
          )}
          {onCompare && (
            <button
              onClick={() => onCompare(alert)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Compare Well <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-emerald-700">
          <CheckCircle className="w-3.5 h-3.5" />
          Acknowledged{alert.acknowledgedAt ? ` · ${new Date(alert.acknowledgedAt).toLocaleString()}` : ''}
        </div>
      )}
    </article>
  );
};

export default AlertCard;
