import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // phone appears
      setTimeout(() => setPhase(2), 2500), // buzz/notification
      setTimeout(() => setPhase(3), 8500), // exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/office_exterior.png`}
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F44] to-transparent opacity-80" />

      <div className="relative z-10 w-full max-w-6xl px-12 flex items-center">
        <div className="w-1/2">
          <motion.h1 
            className="text-[5vw] font-bold leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Arrive<br/>Seamlessly.
          </motion.h1>
          <motion.p 
            className="text-[1.8vw] text-blue-200 mt-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Your invite is waiting in your inbox.
          </motion.p>
        </div>

        <div className="w-1/2 flex justify-center perspective-[1000px]">
          <motion.div 
            className="w-[20vw] h-[40vw] bg-white rounded-3xl p-4 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, rotateY: 30, x: 100 }}
            animate={phase >= 1 ? { opacity: 1, rotateY: -10, x: 0 } : { opacity: 0, rotateY: 30, x: 100 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
          >
            <div className="w-full h-full bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col justify-center items-center">
              <motion.div 
                className="w-full bg-[#0A1F44] text-white p-4 rounded-xl shadow-lg absolute top-12 left-0 right-0 mx-4"
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4A7FD4] flex items-center justify-center text-xs font-bold">VP</div>
                  <div>
                    <div className="font-bold text-sm">VISITORPASS</div>
                    <div className="text-xs text-blue-200">Your access code is here</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
