import React from 'react';

function VerificationButtons({ onRestart, onBack, onRecording }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={onRestart}
        className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
      >
        Restart Verification
      </button>
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onRecording}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        <span className="text-base leading-none">●</span>
        Recording
      </button>
    </div>
  );
}

export default VerificationButtons;
