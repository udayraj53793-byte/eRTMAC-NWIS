import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { LoadingState } from '../../components/States';
import { Upload, FileText, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [wells, setWells] = useState([]);
  const [uploadForm, setUploadForm] = useState({ wellId: '', title: '', reportType: 'DAILY_DRILLING_REPORT' });
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([loadReports(), api.get('/wells').then(r => setWells(r.data.data))]);
  }, []);

  const loadReports = async () => {
    setLoading(true);
    api.get('/reports').then(r => setReports(r.data.data)).finally(() => setLoading(false));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return alert('Please select a PDF file.');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('wellId', uploadForm.wellId);
    fd.append('title', uploadForm.title || file.name.replace('.pdf', ''));
    fd.append('reportType', uploadForm.reportType);

    setUploading(true);
    try {
      await api.post('/reports/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fileRef.current.value = '';
      setUploadForm({ wellId: '', title: '', reportType: 'DAILY_DRILLING_REPORT' });
      loadReports();
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async (reportId) => {
    setProcessing(p => ({ ...p, [reportId]: true }));
    try {
      await api.post(`/reports/${reportId}/process`);
      loadReports();
    } catch (e) {
      alert('Processing failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setProcessing(p => ({ ...p, [reportId]: false }));
    }
  };

  if (loading) return <LoadingState />;

  const statusColors = {
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    PARTIALLY_APPROVED: 'bg-blue-100 text-blue-700',
    FULLY_APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="pl-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / document pipeline</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">Document Management</h1>
          <p className="mt-1 text-sm text-slate-500">Upload and process drilling reports for AI extraction</p>
        </div>
      </div>

      {/* Upload form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,39,56,0.06)] sm:p-6">
        <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff4d2] text-[#8a6b12]"><Upload className="h-5 w-5" aria-hidden="true" /></span>
          <div><h2 className="text-base font-semibold text-[#173f5f]">Upload a source report</h2><p className="text-xs text-slate-500">Add the PDF and associate it with the relevant well.</p></div>
        </div>
        <form onSubmit={handleUpload} className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="report-file" className="mb-1 block text-xs font-semibold text-[#526574]">PDF File *</label>
            <input id="report-file" ref={fileRef} type="file" accept=".pdf" required className="w-full text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-[#fff4d2] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#80620d] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]" />
          </div>
          <div>
            <label htmlFor="report-well" className="mb-1 block text-xs font-semibold text-[#526574]">Associated Well</label>
            <select id="report-well" value={uploadForm.wellId} onChange={e => setUploadForm(p => ({ ...p, wellId: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
              <option value="">Select well...</option>
              {wells.map(w => <option key={w._id} value={w._id}>{w.wellName}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="report-type" className="mb-1 block text-xs font-semibold text-[#526574]">Report Type</label>
            <select id="report-type" value={uploadForm.reportType} onChange={e => setUploadForm(p => ({ ...p, reportType: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
              {['DAILY_DRILLING_REPORT', 'WELL_COMPLETION_REPORT', 'MUD_LOG', 'GEOLOGICAL_REPORT', 'INCIDENT_REPORT', 'OTHER'].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={uploading} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173f5f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#102f47] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] focus-visible:ring-offset-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </form>
      </section>

      {/* Reports table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="Uploaded reports">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-base font-semibold text-[#173f5f]">Report library</h2><p className="text-xs text-slate-500">Track extraction progress and move reports into verification</p></div>
          <span className="rounded-full bg-[#edf2f4] px-3 py-1 text-xs font-semibold text-[#526574]">{reports.length} reports</span>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead><tr className="bg-[#edf2f4] text-[#526574]">
            <th className="text-left px-4 py-3 font-medium">Title</th>
            <th className="text-left px-4 py-3 font-medium">Well</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-left px-4 py-3 font-medium">Extraction</th>
            <th className="text-left px-4 py-3 font-medium">Verification</th>
            <th className="text-left px-4 py-3 font-medium">Events</th>
            <th className="text-left px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {reports.map(r => (
              <tr key={r._id} className="border-t border-slate-100 transition-colors hover:bg-[#f7f8f5]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-slate-700 truncate max-w-xs">{r.title}</span>
                  </div>
                  {r.isDemo && <span className="text-xs text-amber-600 ml-5">Demo data</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.wellName || r.wellId?.wellName || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{r.reportType?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${
                    r.extractionStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    r.extractionStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                    r.extractionStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{r.extractionStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${statusColors[r.verificationStatus] || 'bg-slate-100'}`}>
                    {r.verificationStatus?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.extractedData?.length || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {r.extractionStatus === 'PENDING' && (
                      <button onClick={() => handleProcess(r._id)} disabled={processing[r._id]}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {processing[r._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        {processing[r._id] ? '...' : 'Process'}
                      </button>
                    )}
                    {r.extractionStatus === 'COMPLETED' && r.verificationStatus === 'PENDING_REVIEW' && (
                      <a href={`/admin/extraction-review?reportId=${r._id}`} className="text-xs text-blue-600 hover:underline">Review</a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {reports.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-500">No reports uploaded yet.</div>}
      </section>
    </div>
  );
};

export default AdminReports;
