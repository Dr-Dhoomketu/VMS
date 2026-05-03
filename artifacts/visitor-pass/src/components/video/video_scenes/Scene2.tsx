import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500), // Scan
      setTimeout(() => setPhase(2), 3000), // Glow
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0A1F44]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.05] }}
        transition={{ duration: 12, ease: "linear" }}
      >
        <img src={`${import.meta.env.BASE_URL}images/qr_scanner.png`} className="w-[50vw] object-contain opacity-60" />
      </motion.div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <motion.div 
          className="w-[30vw] h-[30vw] bg-white rounded-3xl p-8 flex items-center justify-center shadow-2xl relative"
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Fake QR Code */}
          <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-2">
            {[...Array(16)].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-[#0A1F44] rounded-sm" 
                initial={{ scale: 0 }}
                animate={{ scale: Math.random() > 0.3 ? 1 : 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
          </div>

          {/* Scanner Line */}
          {phase >= 1 && (
            <motion.div 
              className="absolute left-0 right-0 h-1 bg-[#4A7FD4] shadow-[0_0_20px_#4A7FD4]"
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            />
          )}

          {/* Success Glow */}
          <motion.div 
            className="absolute inset-0 border-8 border-green-500 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.5)]"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        <motion.h2 
          className="mt-12 text-[3vw] font-bold text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Access Granted
        </motion.h2>
      </div>
    </motion.div>
  );
}
