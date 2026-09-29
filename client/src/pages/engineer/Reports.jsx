import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingState } from '../../components/States';
import { FileText, Download } from 'lucide-react';

const EngineerReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports?verificationStatus=FULLY_APPROVED&verificationStatus=PARTIALLY_APPROVED').then(res => {
      setReports(res.data.data);
    }).catch(() => {
      api.get('/reports').then(res => setReports(res.data.data));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading reports..." />;

  return (
    <div className="engineer-page engineer-page--reports space-y-6">
      <header className="flex flex-col gap-3 border-b-2 border-amber-400 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-4 border-blue-900 pl-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Document control / approved sources</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">Drilling Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Verified field reports and the knowledge extracted from each source.</p>
        </div>
        <div className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white">{reports.length} <span className="font-normal text-blue-100">reports</span></div>
      </header>

      <section aria-label="Available drilling reports" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {reports.map(report => (
          <article key={report._id} className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-amber-400 shadow-sm p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-950 flex items-center justify-center">
                <FileText aria-hidden="true" className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{report.title}</h3>
                  <p className="text-xs text-slate-400">{report.wellName || report.wellId?.wellName} · {report.reportType?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                report.verificationStatus === 'FULLY_APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                report.verificationStatus === 'PARTIALLY_APPROVED' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>{report.verificationStatus?.replace(/_/g, ' ')}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-slate-50 rounded-lg p-2 text-xs">
                <div className="text-slate-400">Pages</div>
                <div className="font-medium text-slate-700">{report.pageCount || 'N/A'}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-xs">
                <div className="text-slate-400">Extracted Events</div>
                <div className="font-medium text-slate-700">{report.extractedData?.length || 0}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-xs">
                <div className="text-slate-400">Approved</div>
                <div className="font-medium text-emerald-700">{report.extractedData?.filter(d => d.verificationStatus === 'APPROVED').length || 0}</div>
              </div>
            </div>

            {report.isDemo && (
              <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠ Representative Demonstration Data — Not Real Oil India Operational Data
              </div>
            )}
          </article>
        ))}
        {reports.length === 0 && (
          <div className="xl:col-span-2 rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">No reports available. Ask Admin to upload reports.</div>
        )}
      </section>
    </div>
  );
};

export default EngineerReports;
