import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DigitalWellTwin from '../../components/DigitalWellTwin';
import { LoadingState } from '../../components/States';

const DigitalTwin = () => {
  const [wells, setWells] = useState([]);
  const [selectedWell, setSelectedWell] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wells').then(res => {
      setWells(res.data.data);
      if (res.data.data.length > 0) loadWell(res.data.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const loadWell = async (well) => {
    setSelectedWell(well);
    try {
      const [wellRes, eventsRes] = await Promise.all([
        api.get(`/wells/${well._id}`),
        api.get(`/events?wellId=${well._id}&verificationStatus=APPROVED`),
      ]);
      setSelectedWell(wellRes.data.data);
      setEvents(eventsRes.data.data);
    } catch {}
  };

  if (loading) return <LoadingState message="Loading digital twin..." />;

  return (
    <div className="engineer-page engineer-page--digital-twin space-y-5">
      <header className="flex flex-col gap-4 border-b-2 border-amber-400 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-4 border-blue-900 pl-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Subsurface / well visualization</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">Digital Well Twin</h1>
          <p className="mt-1 text-sm text-slate-500">Interactive stratigraphic visualization using verified well data.</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Verified data view</span>
      </header>

      <section aria-label="Well selection" className="flex flex-col gap-3 rounded-xl border border-slate-200 border-l-4 border-l-amber-400 bg-white p-4 sm:flex-row sm:items-center">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Select Well</label>
        <select
          aria-label="Select well for digital twin"
          onChange={e => loadWell(wells.find(w => w._id === e.target.value))}
          className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {wells.map(w => <option key={w._id} value={w._id}>{w.wellName} — {w.field}</option>)}
        </select>
      </section>

      <section aria-label="Stratigraphic well visualization" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <DigitalWellTwin well={selectedWell} events={events} currentDepth={selectedWell?.currentDepth} />
      </section>

      {events.length > 0 && (
        <section aria-label="Verified historical events" className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-blue-900 shadow-sm p-5">
          <div className="mb-4 flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Event log</p><h2 className="text-base font-bold text-blue-950">Verified Historical Events</h2></div>
            <span className="text-xs font-semibold text-slate-500">{events.length} verified records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="text-left px-3 py-2 font-medium rounded-l-lg">Event Type</th>
                  <th className="text-left px-3 py-2 font-medium">Depth</th>
                  <th className="text-left px-3 py-2 font-medium">Formation</th>
                  <th className="text-left px-3 py-2 font-medium">Severity</th>
                  <th className="text-left px-3 py-2 font-medium">Description</th>
                  <th className="text-left px-3 py-2 font-medium rounded-r-lg">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev._id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">{ev.eventType?.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2 text-slate-600">{ev.depth}m</td>
                    <td className="px-3 py-2 text-slate-600">{ev.formation || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        ev.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        ev.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        ev.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{ev.severity}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{ev.description?.substring(0, 80)}...</td>
                    <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{ev.mitigation?.substring(0, 60)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default DigitalTwin;
