import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, badge }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-700', value: 'text-blue-800' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', value: 'text-orange-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', value: 'text-slate-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <article className="metric-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary-500" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</div>
          <div className={`mt-3 text-3xl font-bold leading-none tracking-tight ${c.value}`}>{value}</div>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
          {Icon && <Icon className={`h-5 w-5 ${c.icon}`} aria-hidden="true" />}
        </div>
      </div>
      <div className="mt-4 flex min-h-5 items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {subtitle
          ? <div className="text-xs text-slate-500">{subtitle}</div>
          : <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Current period</span>}
        {badge && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">{badge}</span>}
        {trend && (
          <div className={`text-xs font-semibold ${trend > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </article>
  );
};

export default MetricCard;
