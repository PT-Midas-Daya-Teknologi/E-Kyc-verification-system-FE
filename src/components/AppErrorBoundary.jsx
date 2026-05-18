import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdOutlineShield } from 'react-icons/md';

function FallbackRenderer({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="max-w-lg rounded-3xl border border-red-400/40 bg-red-950/30 p-8 shadow-card backdrop-blur">
        <div className="mb-4 inline-flex rounded-2xl bg-red-500/15 p-3 text-red-200 ring-1 ring-red-400/40">
          <MdOutlineShield className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="text-2xl font-semibold text-white">Something went wrong</h2>
        <p className="mt-3 text-sm leading-relaxed text-red-100/90">
          The verification UI hit an unexpected error. You can retry safely — camera access may need to be refreshed.
        </p>
        <pre className="mt-4 max-h-36 overflow-auto rounded-xl bg-black/40 p-3 text-xs text-red-100/80 ring-1 ring-white/10">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition hover:bg-slate-100"
        >
          Reload verification
        </button>
      </div>
    </div>
  );
}

export function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary FallbackComponent={FallbackRenderer}>{children}</ErrorBoundary>
  );
}

export default AppErrorBoundary;
