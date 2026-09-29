import React from 'react';
import RiskBadge from './RiskBadge';
import { MapPin, Layers, Activity, ArrowUpRight } from 'lucide-react';

const WellCard = ({ well, onClick, distance, compact = false }) => {
  const statusColors = {
    DRILLING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    SUSPENDED: 'bg-amber-100 text-amber-700',
    ABANDONED: 'bg-slate-100 text-slate-600',
    PRODUCING: 'bg-teal-100 text-teal-700',
    TESTING: 'bg-purple-100 text-purple-700',
  };

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={event => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick(well);
        }
      }}
      className="well-record group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      onClick={() => onClick?.(well)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Well asset</p>
            <h3 className="mt-0.5 truncate text-base font-bold text-slate-800">{well.wellName}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">{well.field}</p>
          </div>
        </div>
        <RiskBadge level={well.riskLevel || 'LOW'} size="xs" />
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Activity className="h-3 w-3" aria-hidden="true" /> Current depth
            </div>
            <p className="mt-1 text-sm font-bold text-slate-800">{well.currentDepth?.toLocaleString() || '—'}<span className="ml-1 text-xs font-medium text-slate-400">m</span></p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Layers className="h-3 w-3" aria-hidden="true" /> Formation
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-slate-700">{well.currentFormation || 'Unknown'}</p>
          </div>
          {distance !== undefined && (
            <div className="col-span-2 flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50/50 px-3 py-2 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-primary-700" aria-hidden="true" />
              <span>Offset distance</span>
              <span className="ml-auto font-bold text-primary-700">{distance.toFixed(2)} km</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[well.status] || 'bg-slate-100 text-slate-600'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {well.status?.toLowerCase()}
        </span>
        <span className="flex items-center gap-2 text-[11px] text-slate-400">
          {well.eventCount !== undefined && <span>{well.eventCount} verified events</span>}
          {onClick && <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />}
        </span>
      </div>
    </article>
  );
};

export default WellCard;
