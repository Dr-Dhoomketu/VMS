import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0A1F44]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Geometric Accents */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full border border-blue-500/20"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 1 }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full border border-blue-400/20"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 1 }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 text-center">
        <motion.div
          className="flex items-center justify-center gap-4 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-[5vw] font-black tracking-tight text-white">VISITORPASS</h1>
        </motion.div>

        <motion.p 
          className="text-[2vw] text-blue-200 tracking-wide font-light"
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={phase >= 1 ? { opacity: 1, letterSpacing: "0.05em" } : { opacity: 0, letterSpacing: "0.1em" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Smart Entry. Zero Friction.
        </motion.p>
      </div>
    </motion.div>
  );
}
