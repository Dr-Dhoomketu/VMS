import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 });
      if (modalRef.current) gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.96, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(10,31,68,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        ref={modalRef}
        className="vp-modal relative w-full my-auto"
        style={{ maxWidth: '420px', padding: '20px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-[#0A1F44] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#6B7FA3] hover:text-[#0A1F44] hover:border-[#0A1F44] transition-all flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="h-px bg-[#E2E8F0] mb-4"/>
        {children}
      </div>
    </div>
  );
}
