import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { LoadingState, EmptyState } from '../../components/States';
import { CheckCircle, XCircle, Edit2, Save, AlertTriangle } from 'lucide-react';

const ExtractionReview = () => {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    const reportId = searchParams.get('reportId');
    if (reportId && reports.length > 0) {
      const found = reports.find(r => r._id === reportId);
      if (found) setSelectedReport(found);
    }
  }, [reports, searchParams]);

  const loadReports = async () => {
    setLoading(true);
    api.get('/reports?extractionStatus=COMPLETED').then(r => {
      const pending = r.data.data.filter(rep => rep.extractedData?.some(d => d.verificationStatus === 'PENDING'));
      setReports(pending);
      if (pending.length > 0 && !selectedReport) setSelectedReport(pending[0]);
    }).finally(() => setLoading(false));
  };

  const handleApprove = async (reportId, itemId) => {
    setSaving(p => ({ ...p, [itemId]: true }));
    try {
      await api.post(`/reports/${reportId}/approve-item`, { itemId, editedData: editingItem === itemId ? editForm : undefined });
      setEditingItem(null);
      // Reload report
      const res = await api.get(`/reports/${reportId}`);
      const updatedReport = res.data.data;
      setReports(prev => prev.map(r => r._id === reportId ? updatedReport : r));
      setSelectedReport(updatedReport);
    } catch (e) {
      alert('Approval failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(p => ({ ...p, [itemId]: false }));
    }
  };

  const handleReject = async (reportId, itemId) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    setSaving(p => ({ ...p, [itemId]: true }));
    try {
      await api.post(`/reports/${reportId}/reject-item`, { itemId, reason });
      const res = await api.get(`/reports/${reportId}`);
      const updatedReport = res.data.data;
      setReports(prev => prev.map(r => r._id === reportId ? updatedReport : r));
      setSelectedReport(updatedReport);
    } catch (e) {
      alert('Rejection failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(p => ({ ...p, [itemId]: false }));
    }
  };

  const startEdit = (item) => {
    setEditingItem(item._id);
    setEditForm({
      eventType: item.eventType,
      depth: item.depth,
      formation: item.formation,
      severity: item.severity,
      description: item.description,
      mitigation: item.mitigation,
    });
  };

  if (loading) return <LoadingState message="Loading extraction queue..." />;

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / human verification</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">AI Extraction Verification Studio</h1>
          <p className="mt-1 text-sm text-slate-500">Human-in-the-loop verification of AI-extracted drilling events</p>
        </div>
      </div>

      <div role="note" className="flex gap-3 rounded-2xl border border-[#e7cf84] bg-[#fff8df] px-4 py-4 text-sm leading-relaxed text-[#695216]">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#a47d13]" aria-hidden="true" />
        <div className="text-xs">
        <strong>⚠ Critical Process:</strong> AI extraction results must be verified by an authorized administrator before entering the trusted knowledge base. Review each extracted item against the source document. Edit if needed. Approve only verified facts. Reject incorrect extractions.
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(16rem,0.85fr)_minmax(0,2.15fr)]">
        {/* Report list */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Reports pending review">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div><h2 className="text-sm font-semibold text-[#173f5f]">Review queue</h2><p className="text-xs text-slate-500">Select a report to inspect</p></div>
            <span className="rounded-full bg-[#fff4d2] px-2.5 py-1 text-xs font-bold text-[#80620d]">{reports.length}</span>
          </div>
          <div className="space-y-2">
            {reports.map(r => (
              <button
                type="button"
                key={r._id}
                onClick={() => setSelectedReport(r)}
                aria-pressed={selectedReport?._id === r._id}
                className={`w-full rounded-xl border p-3 text-left text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] ${selectedReport?._id === r._id ? 'border-[#173f5f] bg-[#edf4f7] shadow-sm' : 'border-slate-200 hover:border-[#c79b24] hover:bg-[#fcfbf6]'}`}
              >
                <span className="block truncate font-semibold text-[#173f5f]">{r.title}</span>
                <span className="mt-1 block text-slate-500">{r.wellName} · {r.extractedData?.filter(d => d.verificationStatus === 'PENDING').length} pending</span>
              </button>
            ))}
            {reports.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No reports pending review.</p>}
          </div>
        </section>

        {/* Extraction items */}
        <div className="min-w-0">
          {!selectedReport ? (
            <EmptyState title="Select a report" message="Choose a report from the left to review its extracted events." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 border-l-4 border-l-[#c79b24] bg-white p-4 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6b12]">Source report</p>
                <h3 className="text-base font-semibold text-[#173f5f]">{selectedReport.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{selectedReport.wellName} · {selectedReport.pageCount} pages · {selectedReport.extractedData?.length} events extracted</p>
              </div>

              {selectedReport.extractedData?.map((item, idx) => {
                const isEditing = editingItem === item._id.toString();
                const statusColor = {
                  PENDING: 'bg-amber-50 border-amber-200',
                  APPROVED: 'bg-emerald-50 border-emerald-200',
                  REJECTED: 'bg-red-50 border-red-200',
                }[item.verificationStatus] || 'bg-white border-slate-200';

                return (
                  <div key={item._id} className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${statusColor}`}>
                    <div className="mb-4 flex flex-col gap-3 border-b border-black/5 pb-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-sm">{item.eventType?.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">Page {item.sourcePage || 'N/A'}</span>
                          {item.confidence && <span className="text-xs text-blue-600">AI confidence: {(item.confidence * 100).toFixed(0)}%</span>}
                        </div>
                      </div>
                      {item.verificationStatus === 'PENDING' && (
                        <div className="flex gap-2">
                          {!isEditing && (
                            <button type="button" onClick={() => startEdit(item)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#526574] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleApprove(selectedReport._id, item._id)}
                            disabled={saving[item._id]}
                            className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#287247] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#205d3a] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] focus-visible:ring-offset-2"
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(selectedReport._id, item._id)}
                            disabled={saving[item._id]}
                            className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#a8443a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#87372f] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] focus-visible:ring-offset-2"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      )}
                      {item.verificationStatus !== 'PENDING' && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {item.verificationStatus}
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Event Type', key: 'eventType', type: 'select', options: ['MUD_LOSS', 'KICK', 'STUCK_PIPE', 'HIGH_TORQUE', 'OVERPRESSURE', 'FISHING', 'LOST_CIRCULATION', 'NPT', 'OTHER'] },
                          { label: 'Depth (m)', key: 'depth', type: 'number' },
                          { label: 'Formation', key: 'formation', type: 'text' },
                          { label: 'Severity', key: 'severity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                        ].map(f => (
                          <div key={f.key}>
                            <label htmlFor={`extraction-${item._id}-${f.key}`} className="mb-1 block text-xs font-semibold text-[#526574]">{f.label}</label>
                            {f.type === 'select' ? (
                              <select id={`extraction-${item._id}-${f.key}`} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
                                {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                              </select>
                            ) : (
                              <input id={`extraction-${item._id}-${f.key}`} type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]" />
                            )}
                          </div>
                        ))}
                        <div className="col-span-2">
                          <label htmlFor={`extraction-${item._id}-description`} className="mb-1 block text-xs font-semibold text-[#526574]">Description</label>
                          <textarea id={`extraction-${item._id}-description`} value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                            rows={2} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]" />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor={`extraction-${item._id}-mitigation`} className="mb-1 block text-xs font-semibold text-[#526574]">Mitigation</label>
                          <textarea id={`extraction-${item._id}-mitigation`} value={editForm.mitigation || ''} onChange={e => setEditForm(p => ({ ...p, mitigation: e.target.value }))}
                            rows={2} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]" />
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <button type="button" onClick={() => setEditingItem(null)} className="min-h-9 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">Cancel</button>
                          <button type="button" onClick={() => handleApprove(selectedReport._id, item._id)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#287247] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#205d3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] focus-visible:ring-offset-2">
                            <Save className="w-3 h-3" /> Save & Approve
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Depth', value: `${item.depth || 'N/A'}m` },
                          { label: 'Formation', value: item.formation || 'Not extracted' },
                          { label: 'Severity', value: item.severity },
                          { label: 'Source Page', value: item.sourcePage || 'N/A' },
                        ].map(f => (
                          <div key={f.label} className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-400 mb-0.5">{f.label}</div>
                            <div className="font-medium text-slate-700">{f.value}</div>
                          </div>
                        ))}
                        <div className="col-span-2 sm:col-span-4 bg-white/60 rounded-lg p-2">
                          <div className="text-slate-400 mb-0.5">Description</div>
                          <div className="text-slate-700">{item.description}</div>
                        </div>
                        {item.mitigation && (
                          <div className="col-span-2 sm:col-span-4 bg-white/60 rounded-lg p-2">
                            <div className="text-slate-400 mb-0.5">Mitigation</div>
                            <div className="text-slate-700">{item.mitigation}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {item.verificationStatus !== 'PENDING' && item.verifiedBy && (
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        {item.verificationStatus === 'APPROVED' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                        {item.verificationStatus} by {typeof item.verifiedBy === 'object' ? item.verifiedBy.name : 'Admin'}
                        {item.verifiedAt ? ` · ${new Date(item.verifiedAt).toLocaleDateString()}` : ''}
                        {item.adminNotes && ` · Note: ${item.adminNotes}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtractionReview;
