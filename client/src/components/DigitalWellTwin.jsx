import React from 'react';
import RiskBadge from './RiskBadge';
import { AlertTriangle, Info } from 'lucide-react';

const DigitalWellTwin = ({ well, events = [], currentDepth }) => {
  if (!well) return <div className="text-slate-400 text-sm p-4">Select a well to view the digital twin.</div>;

  const formations = well.formations || [];
  const targetDepth = well.targetDepth || 3500;
  const activeDepth = currentDepth || well.currentDepth || 0;

  const getDepthPercent = (depth) => Math.min((depth / targetDepth) * 100, 100);

  const formationColors = [
    '#edf2ef', '#e2ebe4', '#e8e8df', '#e2e9ed',
    '#f8edcf', '#e7ece8', '#dce7e2', '#e5e9ec',
  ];

  const severityColors = {
    LOW: { bg: '#e8f4ea', border: '#368d4b', text: '#225c32' },
    MEDIUM: { bg: '#fff4d3', border: '#dfa914', text: '#79520f' },
    HIGH: { bg: '#fff0df', border: '#c17714', text: '#89521b' },
    CRITICAL: { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' },
  };

  return (
    <section className="digital-twin-panel overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-700">Asset visualization</p>
          <h3 className="mt-1 text-base font-bold text-slate-800">{well.wellName} <span className="font-medium text-slate-500">/ Digital twin</span></h3>
          <p className="mt-0.5 text-xs text-slate-500">Verified formations, active depth, and historical events</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Current depth</div>
            <div className="mt-0.5 text-sm font-bold text-primary-800">{activeDepth.toLocaleString()} m</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Target depth</div>
            <div className="mt-0.5 text-sm font-bold text-slate-700">{targetDepth.toLocaleString()} m</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
        {/* Well Column */}
        <div className="relative min-w-0 rounded-xl bg-slate-50 p-3" style={{ minHeight: '500px' }}>
          {/* Depth scale */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-2">
            {[0, 25, 50, 75, 100].map(pct => (
              <span key={pct} className="text-xs text-slate-400" style={{ lineHeight: 1 }}>
                {Math.round(pct * targetDepth / 100)}m
              </span>
            ))}
          </div>

          {/* Well Borehole */}
          <div className="well-column ml-14 relative overflow-hidden rounded-xl border border-slate-200 shadow-inner" style={{ height: '500px', width: 'min(160px, calc(100% - 4rem))' }}>
            {/* Formations */}
            {formations.map((f, idx) => {
              const top = getDepthPercent(f.topDepth);
              const height = getDepthPercent(f.bottomDepth) - top;
              return (
                <div
                  key={f.name}
                  style={{
                    position: 'absolute',
                    top: `${top}%`,
                    height: `${height}%`,
                    left: 0,
                    right: 0,
                    background: formationColors[idx % formationColors.length],
                    borderBottom: '1px solid #cdd8d1',
                  }}
                  title={`${f.name}: ${f.topDepth}m — ${f.bottomDepth}m`}
                >
                  <div style={{ padding: '4px 6px', fontSize: 9, color: '#354d46', fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </div>
                </div>
              );
            })}

            {/* Casing indicator */}
            <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: `${getDepthPercent(Math.min(activeDepth * 0.6, targetDepth * 0.5))}%`, border: '2px solid #60798a', borderBottom: 'none', background: 'transparent', zIndex: 5 }} title="Casing string" />

            {/* Events */}
            {events.map((event, idx) => {
              const colors = severityColors[event.severity] || severityColors.MEDIUM;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: `${getDepthPercent(event.depth)}%`,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                  }}
                  title={`${event.eventType?.replace(/_/g, ' ')} at ${event.depth}m`}
                >
                  <div style={{
                    height: 2,
                    background: colors.border,
                    margin: '0 10%',
                  }} />
                  <div style={{
                    position: 'absolute',
                    right: '-105px',
                    top: '-8px',
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 9,
                    color: colors.text,
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}>
                    ⚠ {event.eventType?.replace(/_/g, ' ')} {event.depth}m
                  </div>
                </div>
              );
            })}

            {/* Current Depth Indicator */}
            <div
              style={{
                position: 'absolute',
                top: `${getDepthPercent(activeDepth)}%`,
                left: 0,
                right: 0,
                zIndex: 20,
              }}
            >
              <div style={{ height: 3, background: '#bc870b', margin: 0 }} />
              <div style={{
                position: 'absolute',
                left: '-105px',
                top: '-8px',
                background: '#eff6ff',
                border: '2px solid #bc870b',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 9,
                color: '#79520f',
                whiteSpace: 'nowrap',
                fontWeight: 700,
              }}>
                ▶ Current: {activeDepth}m
              </div>
            </div>

            {/* Target Depth */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 15 }}>
              <div style={{ height: 2, background: '#1d3d5a', margin: 0 }} />
            </div>
          </div>
        </div>

        {/* Event Legend */}
        {events.length > 0 && (
          <div className="space-y-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Historical events</p>
            {events.slice(0, 6).map((event, idx) => {
              const colors = severityColors[event.severity] || severityColors.MEDIUM;
              return (
                <div key={idx} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '6px 8px' }}>
                  <div className="text-xs font-semibold" style={{ color: colors.text }}>
                    {event.eventType?.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-slate-500">{event.depth}m · {event.formation || 'N/A'}</div>
                  {event.mitigation && (
                    <div className="text-xs text-slate-400 mt-1 truncate" title={event.mitigation}>
                      {event.mitigation.substring(0, 60)}...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        <Info className="w-3 h-3" />
        Visualization uses actual well formation and event data from the knowledge base.
      </div>
    </section>
  );
};

export default DigitalWellTwin;
