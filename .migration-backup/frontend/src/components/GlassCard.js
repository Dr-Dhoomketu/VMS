'use client';
import { useRef } from 'react';

export default function GlassCard({ children, className = '', hoverEffect = true }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!hoverEffect || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    cardRef.current.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
  };

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className={`vp-card p-6 transition-transform duration-300 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
}
