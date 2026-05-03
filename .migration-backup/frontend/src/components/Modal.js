'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.95, xPercent: -50, yPercent: -50, y: 16 },
        { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(10, 31, 68, 0.35)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>

      <div ref={modalRef} className="vp-modal fixed top-1/2 left-1/2 w-full max-w-lg mx-4 p-8 max-h-[85vh] overflow-y-auto"
        style={{ transform: 'translate(-50%, -50%)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-[#0A1F44] tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#6B7FA3] hover:text-[#0A1F44] hover:border-[#0A1F44] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="h-px bg-[#E2E8F0] mb-6"/>
        {children}
      </div>
    </div>
  );
}
