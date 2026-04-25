'use client';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const iconRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'coffee') {
      document.documentElement.classList.add('theme-coffee');
    } else {
      document.documentElement.classList.remove('theme-coffee');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'coffee' : 'dark';
    const curtain = document.getElementById('theme-curtain');

    // Set curtain color based on destination theme
    if (curtain) {
      curtain.style.backgroundColor = newTheme === 'coffee' ? '#fdf6e3' : '#000000';
    }

    const tl = gsap.timeline();

    // 1. Spin and scale the icon
    tl.to(iconRef.current, {
      rotate: theme === 'dark' ? 180 : 0,
      scale: 0.5,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    });

    // 2. Sweep the curtain
    tl.to(curtain, {
      x: "0%",
      duration: 0.6,
      ease: "expo.inOut",
      onComplete: () => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'coffee') {
          document.documentElement.classList.add('theme-coffee');
        } else {
          document.documentElement.classList.remove('theme-coffee');
        }
      }
    }, "-=0.2");

    // 3. Clear the curtain and pop the new icon
    tl.to(curtain, {
      x: "100%",
      duration: 0.6,
      ease: "expo.inOut"
    });

    tl.fromTo(iconRef.current,
      { scale: 0.5, opacity: 0, rotate: theme === 'dark' ? -180 : 0 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.4"
    );

    // Reset curtain position for next time
    tl.set(curtain, { x: "-100%" });
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-8 z-[100] w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-all shadow-lg active:scale-90 theme-coffee:bg-black/5 theme-coffee:border-black/10"
    >
      <div ref={iconRef}>
        {theme === 'dark' ? (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-[#5c4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        )}
      </div>
    </button>
  );
}
