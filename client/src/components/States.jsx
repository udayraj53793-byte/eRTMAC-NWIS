import React from 'react';

export const LoadingState = ({ message = 'Loading...' }) => (
  <div role="status" aria-live="polite" className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
      <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600" />
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-600">{message}</p>
    <span className="mt-1 text-xs text-slate-400">Please wait while the workspace updates</span>
  </div>
);

export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div role="alert" className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 py-14 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
      <span className="text-lg font-bold text-red-600">!</span>
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-700">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ icon, title = 'No data found', message, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
    {icon && <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">{icon}</div>}
    <p className="text-sm font-bold text-slate-700">{title}</p>
    {message && <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">{message}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const SkeletonCard = () => (
  <div aria-hidden="true" className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
    <div className="mb-4 h-3 w-1/3 rounded bg-slate-100" />
    <div className="mb-3 h-8 w-1/2 rounded bg-slate-100" />
    <div className="h-3 w-3/4 rounded bg-slate-100" />
  </div>
);
