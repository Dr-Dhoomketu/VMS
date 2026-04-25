'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Fade in overlay
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });

      // Animate modal with explicit percentage centering to prevent GSAP from overriding Tailwind's transform
      gsap.fromTo(modalRef.current,
        {
          opacity: 0,
          scale: 0.9,
          xPercent: -50,
          yPercent: -50,
          y: 20 // Slight offset for the entry animation
        },
        {
          opacity: 1,
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          y: 0,
          duration: 0.5,
          ease: 'power3.out'
        }
      );
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl theme-coffee:bg-white/80"
      />

      {/* Modal Container - Using explicit absolute positioning */}
      <div
        ref={modalRef}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        className="fixed w-full max-w-lg holographic-glass border border-white/10 rounded-[40px] p-10 shadow-2xl theme-coffee:bg-white theme-coffee:border-black/5 flex flex-col items-center text-center max-h-[90vh] overflow-hidden"
      >
        <div className="w-full flex justify-between items-center mb-8">
          <div className="w-10"></div> {/* Symmetry Spacer */}
          <h2 className="text-2xl font-black tracking-tighter uppercase text-white theme-coffee:text-black">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors theme-coffee:hover:bg-black/5 text-gray-400 hover:text-white theme-coffee:hover:text-black"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="w-full text-left overflow-y-auto px-2 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
