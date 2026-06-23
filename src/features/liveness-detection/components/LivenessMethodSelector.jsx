import React from 'react';
import { motion } from 'framer-motion';
import { Video, Camera, ShieldCheck } from 'lucide-react';

export default function LivenessMethodSelector({ onSelect, onBack }) {
  const methods = [
    {
      id: 'aws',
      title: 'Auto-Verification (AWS)',
      description: 'Fully automated liveness detection using AI instructions.',
      icon: <Camera className="text-sky-500" size={24} />,
      badge: 'Fastest'
    },
    {
      id: 'livekit',
      title: 'Video Stream (LiveKit)',
      description: 'Stream your video to a secure room for verification.',
      icon: <Video className="text-purple-500" size={24} />,
      badge: 'New'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col gap-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-800">Select Verification Method</h2>
        <p className="text-sm text-slate-500">Choose how you would like to complete your identity check.</p>
      </div>

      <div className="grid gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-sky-500 hover:bg-sky-50 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow">
              {method.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">{method.title}</h3>
                {method.badge && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                    {method.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{method.description}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        Back to instructions
      </button>
    </motion.div>
  );
}
