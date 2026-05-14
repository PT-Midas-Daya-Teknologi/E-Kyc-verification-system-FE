import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center"
    >
      <FaCheckCircle className="h-14 w-14 text-emerald-500" />
      <p className="text-lg font-semibold text-emerald-700">Verification Successful</p>
    </motion.div>
  );
}

export default SuccessScreen;
