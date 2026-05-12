import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';

const SCENE_DURATIONS = {
  arrive: 10000,
  scan: 12000,
  enter: 13000,
  logo: 10000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A1F44] text-white font-sans">
      {/* Persistent Background */}
      <div className="absolute inset-0">
        <motion.div className="absolute w-[80vw] h-[80vw] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2F5DAA, transparent)' }}
          animate={{ x: ['-20%', '50%', '-10%'], y: ['-10%', '40%', '20%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[60vw] h-[60vw] rounded-full opacity-20 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #4A7FD4, transparent)' }}
          animate={{ x: ['20%', '-30%', '10%'], y: ['20%', '-20%', '10%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <AnimatePresence initial={false} mode="wait">
        {currentScene === 0 && <Scene1 key="arrive" />}
        {currentScene === 1 && <Scene2 key="scan" />}
        {currentScene === 2 && <Scene3 key="enter" />}
        {currentScene === 3 && <Scene4 key="logo" />}
      </AnimatePresence>
    </div>
  );
}
