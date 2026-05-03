'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Greek Architectural Skyline SVG ──────────────────────────────────────────
function GreekSkyline() {
  return (
    <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto" preserveAspectRatio="xMidYMax meet">
      {/* Ground line */}
      <line x1="0" y1="300" x2="1440" y2="300" stroke="#2F5DAA" strokeWidth="2"/>
      {/* Reflection line */}
      <line x1="0" y1="308" x2="1440" y2="308" stroke="#2F5DAA" strokeWidth="0.5" opacity="0.4"/>

      {/* Parthenon - center */}
      <rect x="560" y="120" width="320" height="180" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      <rect x="540" y="110" width="360" height="14" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      <rect x="520" y="100" width="400" height="12" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      {/* Pediment */}
      <polyline points="520,100 720,50 920,100" stroke="#2F5DAA" strokeWidth="1.5" fill="none"/>
      {/* Columns */}
      {[580,620,660,700,740,780,820,860].map((x,i) => (
        <g key={i}>
          <rect x={x} y="124" width="14" height="172" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
          <ellipse cx={x+7} cy="124" rx="8" ry="3" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
          <ellipse cx={x+7} cy="296" rx="8" ry="3" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
        </g>
      ))}

      {/* Left temple */}
      <rect x="200" y="170" width="200" height="130" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <rect x="185" y="162" width="230" height="10" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <polyline points="185,162 300,120 415,162" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      {[215,245,275,305,335,365].map((x,i) => (
        <rect key={i} x={x} y="172" width="10" height="126" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      ))}

      {/* Right temple */}
      <rect x="1040" y="160" width="220" height="140" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <rect x="1025" y="152" width="250" height="10" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <polyline points="1025,152 1150,108 1275,152" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      {[1055,1085,1115,1145,1175,1205,1235].map((x,i) => (
        <rect key={i} x={x} y="162" width="10" height="136" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      ))}

      {/* Small building left */}
      <rect x="60" y="210" width="100" height="90" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      <rect x="50" y="204" width="120" height="8" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      <polyline points="50,204 110,175 170,204" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      {[72,96,120,144].map((x,i) => (
        <rect key={i} x={x} y="212" width="8" height="86" stroke="#2F5DAA" strokeWidth="0.7" fill="none"/>
      ))}

      {/* Small building right */}
      <rect x="1280" y="200" width="120" height="100" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      <rect x="1268" y="193" width="144" height="9" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      <polyline points="1268,193 1340,162 1412,193" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      {[1292,1318,1344,1370].map((x,i) => (
        <rect key={i} x={x} y="202" width="8" height="96" stroke="#2F5DAA" strokeWidth="0.7" fill="none"/>
      ))}

      {/* Stars */}
      {[[100,30],[300,20],[500,40],[900,25],[1100,35],[1350,20],[1420,45]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#2F5DAA" opacity="0.5"/>
      ))}

      {/* Reflection (mirrored, faded) */}
      <g opacity="0.15" transform="scale(1,-1) translate(0,-620)">
        <rect x="560" y="120" width="320" height="180" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
        <polyline points="520,100 720,50 920,100" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
        {[580,620,660,700,740,780,820,860].map((x,i) => (
          <rect key={i} x={x} y="124" width="14" height="172" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
        ))}
      </g>
    </svg>
  );
}

// ── Geometric Robot Face — blueprint style ──────────────────────────────────────
function SecurityCharacter({ mousePos }) {
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  // Smooth lerp loop for eye tracking
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      setPupil(prev => {
        const nx = lerp(prev.x, targetRef.current.x, 0.08);
        const ny = lerp(prev.y, targetRef.current.y, 0.08);
        if (Math.abs(nx - prev.x) < 0.001 && Math.abs(ny - prev.y) < 0.001) return prev;
        return { x: nx, y: ny };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Update target when mousePos changes
  useEffect(() => {
    if (!mousePos) return;
    targetRef.current = {
      x: (mousePos.x - 0.5) * 16,
      y: (mousePos.y - 0.5) * 10,
    };
  }, [mousePos]);

  // Constrain pupil inside eye shape
  const clampedPupil = (baseX, baseY, r = 5) => {
    const mag = Math.sqrt(pupil.x ** 2 + pupil.y ** 2);
    const scale = mag > r ? r / mag : 1;
    return { cx: baseX + pupil.x * scale, cy: baseY + pupil.y * scale };
  };

  return (
    <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-80 mix-blend-multiply">
      <defs>
        <clipPath id="robotEyeL">
          <path d="M130 220 C150 205, 180 215, 185 225 C170 235, 145 235, 130 220 Z" />
        </clipPath>
        <clipPath id="robotEyeR">
          <path d="M270 220 C250 205, 220 215, 215 225 C230 235, 255 235, 270 220 Z" />
        </clipPath>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Wireframe nodes and connecting lines for the face */}
      <g stroke="#2F5DAA" strokeWidth="0.5" opacity="0.9">
        {/* Outline / Jaw */}
        <polyline points="200,450 140,410 100,320 80,240 100,140 140,80 200,50 260,80 300,140 320,240 300,320 260,410 200,450" />
        
        {/* Forehead */}
        <polyline points="140,80 200,100 260,80" />
        <polyline points="100,140 140,150 200,140 260,150 300,140" />
        <line x1="200" y1="50" x2="200" y2="100" />
        <line x1="140" y1="80" x2="140" y2="150" />
        <line x1="260" y1="80" x2="260" y2="150" />
        <line x1="200" y1="100" x2="140" y2="150" />
        <line x1="200" y1="100" x2="260" y2="150" />
        <line x1="200" y1="100" x2="200" y2="140" />
        <line x1="100" y1="140" x2="140" y2="80" />
        <line x1="300" y1="140" x2="260" y2="80" />
        
        {/* Cheeks & Eyes context */}
        <polyline points="80,240 120,240 130,220 185,225 200,200 215,225 270,220 280,240 320,240" />
        <line x1="100" y1="140" x2="120" y2="240" />
        <line x1="140" y1="150" x2="130" y2="220" />
        <line x1="200" y1="140" x2="185" y2="225" />
        <line x1="200" y1="140" x2="200" y2="200" />
        <line x1="200" y1="140" x2="215" y2="225" />
        <line x1="260" y1="150" x2="270" y2="220" />
        <line x1="300" y1="140" x2="280" y2="240" />
        
        <polyline points="100,320 130,280 160,260 200,280 240,260 270,280 300,320" />
        <line x1="120" y1="240" x2="130" y2="280" />
        <line x1="130" y1="220" x2="160" y2="260" />
        <line x1="185" y1="225" x2="160" y2="260" />
        <line x1="185" y1="225" x2="200" y2="280" />
        <line x1="200" y1="200" x2="200" y2="280" />
        <line x1="215" y1="225" x2="200" y2="280" />
        <line x1="215" y1="225" x2="240" y2="260" />
        <line x1="270" y1="220" x2="240" y2="260" />
        <line x1="280" y1="240" x2="270" y2="280" />

        {/* Nose */}
        <polyline points="200,200 185,280 200,320 215,280 200,200" />
        <line x1="160" y1="260" x2="185" y2="280" />
        <line x1="240" y1="260" x2="215" y2="280" />
        
        {/* Mouth/Jaw */}
        <polyline points="140,410 160,360 200,370 240,360 260,410" />
        <line x1="130" y1="280" x2="160" y2="360" />
        <line x1="160" y1="260" x2="160" y2="360" />
        <line x1="185" y1="280" x2="160" y2="360" />
        <line x1="185" y1="280" x2="200" y2="370" />
        <line x1="200" y1="320" x2="200" y2="370" />
        <line x1="215" y1="280" x2="200" y2="370" />
        <line x1="215" y1="280" x2="240" y2="360" />
        <line x1="240" y1="260" x2="240" y2="360" />
        <line x1="270" y1="280" x2="240" y2="360" />
        
        <polyline points="160,360 200,390 240,360" />
        <line x1="200" y1="370" x2="200" y2="390" />
        <line x1="140" y1="410" x2="200" y2="390" />
        <line x1="260" y1="410" x2="200" y2="390" />
        <line x1="200" y1="450" x2="200" y2="390" />
        
        {/* Neck */}
        <polyline points="140,410 140,500" />
        <polyline points="260,410 260,500" />
        <polyline points="200,450 180,500" />
        <polyline points="200,450 220,500" />
        <line x1="140" y1="450" x2="180" y2="500" />
        <line x1="260" y1="450" x2="220" y2="500" />
        
        {/* Shoulders */}
        <polyline points="140,500 50,520" />
        <polyline points="260,500 350,520" />
      </g>

      {/* Nodes (Points) */}
      <g fill="#2F5DAA" opacity="1.0">
        {[
          [200,50],[140,80],[260,80],[100,140],[300,140],[200,100],
          [140,150],[260,150],[200,140],[80,240],[320,240],[120,240],
          [280,240],[130,220],[270,220],[185,225],[215,225],[200,200],
          [100,320],[300,320],[130,280],[270,280],[160,260],[240,260],
          [200,280],[185,280],[215,280],[200,320],[140,410],[260,410],
          [160,360],[240,360],[200,370],[200,390],[200,450]
        ].map((pt, i) => (
          <circle key={i} cx={pt[0]} cy={pt[1]} r="1.5" />
        ))}
      </g>

      {/* Eyes Container */}
      <path d="M130 220 C150 205, 180 215, 185 225 C170 235, 145 235, 130 220 Z" stroke="#2F5DAA" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d="M270 220 C250 205, 220 215, 215 225 C230 235, 255 235, 270 220 Z" stroke="#2F5DAA" strokeWidth="1.2" fill="none" opacity="0.8" />
      
      {/* Light glow on eyes */}
      <path d="M130 220 C150 205, 180 215, 185 225 C170 235, 145 235, 130 220 Z" fill="#2F5DAA" opacity="0.05" />
      <path d="M270 220 C250 205, 220 215, 215 225 C230 235, 255 235, 270 220 Z" fill="#2F5DAA" opacity="0.05" />

      {/* Glowing Iris + Pupil */}
      <g clipPath="url(#robotEyeL)">
        <circle cx={clampedPupil(160, 221).cx} cy={clampedPupil(160, 221).cy} r="7" fill="#2F5DAA" filter="url(#glow)" opacity="0.8" />
        <circle cx={clampedPupil(160, 221).cx} cy={clampedPupil(160, 221).cy} r="3" fill="#EEF3FB" />
      </g>
      <g clipPath="url(#robotEyeR)">
        <circle cx={clampedPupil(240, 221).cx} cy={clampedPupil(240, 221).cy} r="7" fill="#2F5DAA" filter="url(#glow)" opacity="0.8" />
        <circle cx={clampedPupil(240, 221).cx} cy={clampedPupil(240, 221).cy} r="3" fill="#EEF3FB" />
      </g>
      
    </svg>
  );
}

// ── Geometric Robot Face — blueprint style ──────────────────────────────────────

// ── Greek Statue — blueprint style ──────────────────────────────────────
function GreekStatue() {
  return (
    <svg viewBox="0 0 200 500" fill="none" className="w-full h-full opacity-90 drop-shadow-xl" stroke="#2F5DAA" strokeWidth="0.8">
       {/* Pedestal */}
      <g strokeWidth="1" fill="rgba(255,255,255,0.7)">
        <rect x="60" y="420" width="80" height="20" />
        <rect x="50" y="440" width="100" height="20" />
        <rect x="40" y="460" width="120" height="40" />
        <line x1="60" y1="430" x2="140" y2="430" strokeWidth="0.5"/>
        <line x1="50" y1="450" x2="150" y2="450" strokeWidth="0.5"/>
        {[50, 70, 90, 110, 130, 150].map(x => <line key={x} x1={x} y1="460" x2={x} y2="500" strokeWidth="0.3" opacity="0.5"/>)}
      </g>
      
      <g fill="rgba(255,255,255,0.5)">
        {/* Body - Contrapposto stance */}
        <path d="M100,70 C120,70 130,90 125,120 C120,150 105,170 105,200 C105,230 115,300 115,420 Z" />
        <path d="M100,70 C80,70 70,90 75,120 C80,150 95,170 95,200 C95,230 85,300 85,420 Z" />
        <path d="M85,420 L115,420" />
        
        {/* Toga Drapes */}
        <path d="M75,120 C90,160 120,180 125,200 C130,240 100,300 115,420 Z" />
        <path d="M80,130 C95,170 115,190 120,210 C125,250 95,310 110,420 Z" />
        <path d="M85,140 C100,180 110,200 115,220 C120,260 90,320 105,420 Z" />
        <path d="M70,150 C110,180 130,160 140,150" />
        
        {/* Cross body folds */}
        <path d="M125,120 C110,140 90,150 75,150" />
        <path d="M120,130 C105,150 85,160 70,160" />
        
        {/* Head */}
        <ellipse cx="100" cy="45" rx="14" ry="18" />
        <path d="M86,45 C86,30 114,30 114,45" />
        <path d="M100,45 L100,55" />
        <line x1="93" y1="40" x2="98" y2="40" />
        <line x1="102" y1="40" x2="107" y2="40" />
        
        {/* Arms */}
        <path d="M75,120 C60,150 65,190 85,210 Z" />
        <path d="M125,120 C140,150 135,190 115,210 Z" />
      </g>
      
      {/* Details */}
      <path d="M95,200 C80,250 90,350 80,420" strokeWidth="0.5" opacity="0.6"/>
      <path d="M105,200 C120,250 110,350 120,420" strokeWidth="0.5" opacity="0.6"/>
    </svg>
  );
}

// ── How It Works — animated process diagram ───────────────────────────────────
const STEPS = [
  {
    id: 1,
    label: 'Register',
    desc: 'Fill in your details and capture a photo at the kiosk or online.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <circle cx="24" cy="16" r="8" stroke="#2F5DAA" strokeWidth="1.8"/>
        <path d="M8 40 C8 31 15 26 24 26 C33 26 40 31 40 40" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="32" y1="16" x2="40" y2="16" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="36" y1="12" x2="36" y2="20" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 2,
    label: 'Submit Request',
    desc: 'Your visit request is sent to the host employee for approval.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="8" y="10" width="32" height="28" rx="4" stroke="#2F5DAA" strokeWidth="1.8"/>
        <line x1="14" y1="19" x2="34" y2="19" stroke="#2F5DAA" strokeWidth="1.5"/>
        <line x1="14" y1="25" x2="34" y2="25" stroke="#2F5DAA" strokeWidth="1.5"/>
        <line x1="14" y1="31" x2="26" y2="31" stroke="#2F5DAA" strokeWidth="1.5"/>
        <path d="M30 6 L30 14" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M26 10 L30 6 L34 10" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 3,
    label: 'Email Sent',
    desc: 'A confirmation email with your visit details lands in your inbox.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="6" y="12" width="36" height="26" rx="4" stroke="#2F5DAA" strokeWidth="1.8"/>
        <path d="M6 16 L24 28 L42 16" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="36" cy="14" r="6" fill="#2F5DAA"/>
        <path d="M33 14 L35.5 16.5 L39 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 4,
    label: 'Show QR Code',
    desc: 'Present your unique QR code at the entrance for instant scan.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="8" y="8" width="14" height="14" rx="2" stroke="#2F5DAA" strokeWidth="1.8"/>
        <rect x="11" y="11" width="8" height="8" rx="1" fill="#2F5DAA" opacity="0.25"/>
        <rect x="26" y="8" width="14" height="14" rx="2" stroke="#2F5DAA" strokeWidth="1.8"/>
        <rect x="29" y="11" width="8" height="8" rx="1" fill="#2F5DAA" opacity="0.25"/>
        <rect x="8" y="26" width="14" height="14" rx="2" stroke="#2F5DAA" strokeWidth="1.8"/>
        <rect x="11" y="29" width="8" height="8" rx="1" fill="#2F5DAA" opacity="0.25"/>
        <rect x="26" y="26" width="5" height="5" rx="1" fill="#2F5DAA"/>
        <rect x="33" y="26" width="5" height="5" rx="1" fill="#2F5DAA"/>
        <rect x="26" y="33" width="5" height="5" rx="1" fill="#2F5DAA"/>
        <rect x="33" y="33" width="5" height="5" rx="1" fill="#2F5DAA"/>
      </svg>
    ),
  },
  {
    id: 5,
    label: 'Access Granted',
    desc: 'Gate opens, badge prints, and your host is notified of your arrival.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <circle cx="24" cy="24" r="16" stroke="#2F5DAA" strokeWidth="1.8"/>
        <path d="M16 24 L21 29 L32 18" stroke="#2F5DAA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

// Winding path points for the connector
const PATH = "M 60 80 C 120 80 140 160 200 160 C 260 160 280 80 340 80 C 400 80 420 160 480 160 C 540 160 560 80 620 80 C 680 80 700 160 760 160 C 820 160 840 80 900 80";
// X positions of each step icon center (matching path waypoints)
const STEP_X = [60, 200, 340, 480, 620, 760, 900];
// We have 5 steps, place them at indices 0,1,2,3,4 → x = 60,200,340,480,620 (but path goes to 900 for spacing)
const ICON_X = [60, 200, 340, 480, 620];
const ICON_Y = [80, 160, 80, 160, 80];

function HowItWorks() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    // Set up dash for draw-on animation
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate path draw
          path.style.transition = `stroke-dashoffset 2.4s cubic-bezier(0.4,0,0.2,1)`;
          path.style.strokeDashoffset = '0';
          // Reveal steps sequentially
          STEPS.forEach((_, i) => {
            setTimeout(() => setActiveStep(i), 400 + i * 480);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 px-8 md:px-16 overflow-hidden bg-white">
      {/* Dot grid bg */}
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none"/>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="vp-caption mb-2">How It Works</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0A1F44]">From Arrival to Access</h2>
          <p className="text-[#6B7FA3] mt-2 text-sm max-w-sm mx-auto">Five steps. Under 60 seconds.</p>
        </div>

        {/* SVG diagram */}
        <div className="relative w-full" style={{ paddingBottom: '28%' }}>
          <svg
            viewBox="0 0 680 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Winding connector path */}
            <path
              ref={pathRef}
              d="M 40 80 C 90 80 100 150 170 150 C 240 150 250 80 340 80 C 430 80 440 150 510 150 C 580 150 590 80 640 80"
              stroke="#2F5DAA"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />

            {/* Step icons + labels */}
            {STEPS.map((step, i) => {
              const cx = [40, 170, 340, 510, 640][i];
              const cy = [80, 150, 80, 150, 80][i];
              const labelY = cy < 100 ? cy - 52 : cy + 38;
              const descY  = cy < 100 ? cy - 36 : cy + 54;
              const active = activeStep >= i;

              return (
                <g key={step.id}
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                  }}>
                  {/* Step number bubble */}
                  <circle cx={cx} cy={cy} r="28"
                    fill={i === 4 ? '#0A1F44' : 'white'}
                    stroke="#2F5DAA" strokeWidth="1.5"/>
                  {/* Icon inside circle */}
                  <foreignObject x={cx - 18} y={cy - 18} width="36" height="36">
                    <div style={{ width: 36, height: 36, padding: 4 }}>
                      {/* Clone icon with correct color for last step */}
                      {i === 4
                        ? <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
                            <circle cx="24" cy="24" r="16" stroke="white" strokeWidth="1.8"/>
                            <path d="M16 24 L21 29 L32 18" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        : step.icon
                      }
                    </div>
                  </foreignObject>
                  {/* Step number */}
                  <circle cx={cx + 20} cy={cy - 20} r="9"
                    fill="#2F5DAA"/>
                  <text x={cx + 20} y={cy - 16}
                    textAnchor="middle" fontSize="8" fontWeight="800" fill="white" fontFamily="sans-serif">
                    {step.id}
                  </text>
                  {/* Label */}
                  <text x={cx} y={labelY}
                    textAnchor="middle" fontSize="9.5" fontWeight="800"
                    fill="#0A1F44" fontFamily="sans-serif" letterSpacing="0.3">
                    {step.label}
                  </text>
                  {/* Connector dot on path */}
                  <circle cx={cx} cy={cy} r="4" fill="#2F5DAA" opacity="0.5"/>
                </g>
              );
            })}

            {/* Traveling dot — animates along path after all steps shown */}
            {activeStep >= 4 && (
              <circle r="5" fill="#2F5DAA" opacity="0.8">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path="M 40 80 C 90 80 100 150 170 150 C 240 150 250 80 340 80 C 430 80 440 150 510 150 C 580 150 590 80 640 80"
                />
              </circle>
            )}
          </svg>
        </div>

        {/* Step descriptions below */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          {STEPS.map((step, i) => (
            <div key={step.id}
              className="text-center"
              style={{
                opacity: activeStep >= i ? 1 : 0,
                transform: activeStep >= i ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
              }}>
              <p className="text-[10px] text-[#6B7FA3] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [loaded, setLoaded] = useState(false);

  // Track mouse for statue eyes
  useEffect(() => {
    const handler = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline({ onComplete: () => setLoaded(true) });

    // Loader wipe
    tl.to('.vp-loader', { height: 0, duration: 1.2, ease: 'expo.inOut', delay: 0.3 });

    // Nav fade in
    tl.from('.vp-nav-item', { y: -16, opacity: 0, stagger: 0.08, ease: 'power3.out', duration: 0.6 }, '-=0.4');

    // Hero text
    tl.from('.vp-hero-word', {
      y: 60, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'back.out(1.4)'
    }, '-=0.3');

    tl.from('.vp-hero-sub', { opacity: 0, y: 20, duration: 0.7, ease: 'power2.out' }, '-=0.5');
    tl.from('.vp-hero-cta', { opacity: 0, y: 16, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, '-=0.4');
    tl.from('.vp-statue', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' }, '-=0.8');

    // Parallax on skyline
    gsap.to('.vp-skyline-bg', {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="relative min-h-screen bg-white text-[#0A1F44] overflow-hidden">

      {/* Loader */}
      <div className="vp-loader fixed inset-0 z-[200] bg-[#0A1F44] flex items-center justify-center origin-top">
        <div className="text-white font-black text-sm tracking-[0.5em] uppercase opacity-60">VISITORPASS</div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="vp-nav fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-16 py-5">
        <div className="vp-nav-item flex items-center gap-3">
          <Image src="/vts-logo.png" alt="VISITORPASS" width={140} height={40} priority
            className="h-9 w-auto object-contain" style={{ width: 'auto' }}/>
        </div>
        <div className="vp-nav-item flex items-center gap-6">
          <span className="hidden md:block text-xs font-semibold text-[#6B7FA3] tracking-wide">Enterprise Visitor Management</span>
          <Link href="/login">
            <button className="btn-vp-primary text-xs px-6 py-3">
              Employee Portal <span className="ml-1">→</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative flex flex-col overflow-hidden" style={{minHeight:'calc(100vh - 0px)'}}>

        {/* Greek skyline — subtle, bottom, full width */}
        <div className="vp-skyline-bg absolute bottom-0 left-0 right-0 pointer-events-none" style={{opacity:0.06}}>
          <GreekSkyline />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none"/>

        {/* Robot face — large, right side, visible wireframe */}
        <div className="absolute pointer-events-none"
          style={{top:'50%', right:'-4%', transform:'translateY(-48%)', width:'72vw', maxWidth:900, height:'90vh', opacity:0.42}}>
          <SecurityCharacter mousePos={mousePos} />
        </div>

        {/* Greek statue — far right, bottom */}
        <div className="absolute bottom-[140px] right-[1%] pointer-events-none" style={{opacity:0.28, width:140, height:340}}>
          <GreekStatue />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center w-full max-w-7xl mx-auto px-8 md:px-16 pt-10 pb-6">
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="vp-caption vp-hero-word" style={{letterSpacing:'0.18em', color:'#2F5DAA', fontSize:'0.7rem', fontWeight:700}}>
              VISITOR MANAGEMENT SYSTEM
            </div>

            <h1 className="font-black leading-none tracking-tight text-[#0A1F44]" style={{fontSize:'clamp(3.5rem,7vw,6.5rem)', lineHeight:0.88}}>
              {'VISITOR'.split('').map((c,i)=>(
                <span key={i} className="vp-hero-word inline-block">{c}</span>
              ))}
              <br/>
              <span className="vp-hero-word inline-block text-[#2F5DAA]">PASS</span>
            </h1>

            <p className="vp-hero-sub text-[#6B7FA3] leading-relaxed" style={{fontSize:'0.95rem'}}>
              The next generation of visitor management.<br/>
              <span className="font-semibold text-[#0A1F44]">Intelligent. Secure. Enterprise-grade.</span>
            </p>

            <div className="flex flex-wrap gap-3 vp-hero-cta">
              <Link href="/check-in">
                <button className="btn-vp-primary px-7 py-3 text-xs font-bold tracking-wider uppercase">
                  New Visitor →
                </button>
              </Link>
              <Link href="/appointment">
                <button className="px-7 py-3 text-xs font-bold tracking-wider uppercase text-[#0A1F44] border-2 border-[#0A1F44] rounded-full hover:border-[#2F5DAA] hover:text-[#2F5DAA] transition-all">
                  Pre-Book Visit →
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── THREE ENTRY CARDS — pinned to bottom of hero ── */}
        <div className="relative z-10 w-full border-t border-[#E2E8F0] bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">

            <Link href="/check-in">
              <div className="group flex items-start gap-4 py-6 pr-8 hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#EEF3FB] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#2F5DAA] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="4" stroke="#2F5DAA" strokeWidth="1.5" className="group-hover:stroke-white"/>
                    <path d="M4 21C4 17 7.6 14 12 14C16.4 14 20 17 20 21" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="16" y1="7" x2="20" y2="7" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="18" y1="5" x2="18" y2="9" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-[#2F5DAA] uppercase tracking-wider mb-1">New Visitor</div>
                  <p className="text-xs text-[#6B7FA3] leading-relaxed">Initiate a secure check-in sequence and register your arrival using our advanced verification.</p>
                </div>
                <span className="text-[#2F5DAA] text-lg self-end pb-0.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>

            <Link href="/returning">
              <div className="group flex items-start gap-4 py-6 px-8 hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#EEF3FB] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#2F5DAA] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 9L20 12L15 15" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-[#2F5DAA] uppercase tracking-wider mb-1">Returning</div>
                  <p className="text-xs text-[#6B7FA3] leading-relaxed">Fast-track entry using your registered biometric or mobile identity token.</p>
                </div>
                <span className="text-[#2F5DAA] text-lg self-end pb-0.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>

            <Link href="/appointment">
              <div className="group flex items-start gap-4 py-6 pl-8 hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#EEF3FB] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#2F5DAA] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="#2F5DAA" strokeWidth="1.5"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#2F5DAA" strokeWidth="1.2"/>
                    <line x1="8" y1="3" x2="8" y2="7" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="16" y1="3" x2="16" y2="7" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="7" y="13" width="3" height="3" rx="0.5" fill="#2F5DAA" opacity="0.6"/>
                    <rect x="13" y="13" width="3" height="3" rx="0.5" fill="#2F5DAA" opacity="0.6"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-[#2F5DAA] uppercase tracking-wider mb-1">Pre-Book</div>
                  <p className="text-xs text-[#6B7FA3] leading-relaxed">Schedule your visit in advance for a seamless and frictionless arrival experience.</p>
                </div>
                <span className="text-[#2F5DAA] text-lg self-end pb-0.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <HowItWorks />

      {/* ── FOOTER ── */}
      <footer className="py-10 px-8 md:px-16 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image src="/vts-logo.png" alt="VISITORPASS" width={100} height={30}
              className="h-7 w-auto object-contain" style={{ width: 'auto' }}/>
            <span className="text-xs text-[#6B7FA3]">Enterprise Visitor Management</span>
          </div>
          <p className="text-xs text-[#6B7FA3]">© 2025 VISITORPASS. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
