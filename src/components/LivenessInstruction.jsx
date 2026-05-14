import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

function LivenessInstruction({ instruction, successText, isDetected }) {
  return (
    <motion.div
      key={instruction}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-4 w-full max-w-sm rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-center"
    >
      <p className="text-sm font-medium text-sky-700">{instruction}</p>
      {isDetected ? (
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <FaCheckCircle className="h-3.5 w-3.5" />
          {successText}
        </div>
      ) : null}
    </motion.div>
  );
}

export default LivenessInstruction;
