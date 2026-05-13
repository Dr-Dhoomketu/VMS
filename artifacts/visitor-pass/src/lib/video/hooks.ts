import { useState, useEffect } from 'react';

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneKeys = Object.keys(durations);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const playScene = (index: number) => {
      setCurrentScene(index);
      const duration = durations[sceneKeys[index]];
      timeout = setTimeout(() => {
        playScene((index + 1) % sceneKeys.length);
      }, duration);
    };

    playScene(0);

    return () => clearTimeout(timeout);
  }, [durations]);

  return { currentScene };
}
