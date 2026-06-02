export default function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-100 via-sky-50 to-blue-50">
      <p className="mb-5 text-xs font-semibold tracking-widest text-sky-600 uppercase">
        SecureBank · KYC Portal
      </p>
      <div className="w-full max-w-[540px] bg-white rounded-2xl border border-sky-200 shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-blue-600" />
        <div className="p-8">{children}</div>
      </div>
      <p className="mt-6 text-xs text-slate-400">© 2024 SecureBank · Powered by AWS Rekognition</p>
    </div>
  );
}
