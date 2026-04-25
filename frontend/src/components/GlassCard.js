'use client';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function GlassCard({ children, className = '', hoverEffect = true }) {
  const cardRef = useRef(null);
  const scannerRef = useRef(null);
  const contentRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useGSAP(() => {
    // Initial entrance
    gsap.from(cardRef.current, {
      y: 50,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
    });

    // Scanner beam one-time entrance
    gsap.fromTo(scannerRef.current, 
      { top: "-10%", opacity: 0 },
      { top: "110%", opacity: 0.5, duration: 1.5, ease: "power2.inOut" }
    );
  }, { scope: cardRef });

  const handleMouseMove = (e) => {
    if (!hoverEffect || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    // 3D Tilt
    const rotateX = ((y / rect.height) - 0.5) * -10;
    const rotateY = ((x / rect.width) - 0.5) * 10;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)"
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => hoverEffect && setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl glass-panel p-8 transition-all duration-500 transform-gpu ${hoverEffect ? 'hover:border-white/20 theme-coffee:hover:border-gray-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] theme-coffee:hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]' : ''} ${className}`}
    >
      {/* Shimmer Sweep */}
      {hoverEffect && isHovering && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-[100%] animate-shimmer" />
        </div>
      )}

      {/* Edge Beam Animation */}
      {hoverEffect && isHovering && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 theme-coffee:via-yellow-600/30 to-transparent animate-beam-x" />
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/40 theme-coffee:via-yellow-600/30 to-transparent animate-beam-y" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/40 theme-coffee:via-gray-400/30 to-transparent animate-beam-x-rev" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-500/40 theme-coffee:via-gray-400/30 to-transparent animate-beam-y-rev" />
        </div>
      )}

      {/* Scanner Beam (Enhanced) */}
      <div 
        ref={scannerRef} 
        className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent z-20 pointer-events-none opacity-0 shadow-[0_0_20px_rgba(59,130,246,1)] theme-coffee:via-yellow-600 theme-coffee:shadow-[0_0_20px_rgba(202,138,4,1)]" 
      />

      {/* Premium Spotlight (Enhanced) */}
      {hoverEffect && (
        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.08), transparent 60%)`
          }}
        />
      )}
      
      <div ref={contentRef} className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          from { transform: translateX(-100%) skewX(-20deg); }
          to { transform: translateX(200%) skewX(-20deg); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
}
