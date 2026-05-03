import { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

function GreekSkyline() {
  return (
    <svg viewBox="0 0 1440 320" fill="none" className="w-full h-auto" preserveAspectRatio="xMidYMax meet">
      <line x1="0" y1="300" x2="1440" y2="300" stroke="#2F5DAA" strokeWidth="2"/>
      <line x1="0" y1="308" x2="1440" y2="308" stroke="#2F5DAA" strokeWidth="0.5" opacity="0.4"/>
      <rect x="560" y="120" width="320" height="180" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      <rect x="540" y="110" width="360" height="14" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      <rect x="520" y="100" width="400" height="12" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      <polyline points="520,100 720,50 920,100" stroke="#2F5DAA" strokeWidth="1.5" fill="none"/>
      {[580,620,660,700,740,780,820,860].map((x,i) => (
        <g key={i}>
          <rect x={x} y="124" width="14" height="172" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
          <ellipse cx={x+7} cy="124" rx="8" ry="3" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
          <ellipse cx={x+7} cy="296" rx="8" ry="3" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
        </g>
      ))}
      <rect x="200" y="170" width="200" height="130" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <rect x="185" y="162" width="230" height="10" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <polyline points="185,162 300,120 415,162" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      {[215,245,275,305,335,365].map((x,i) => <rect key={i} x={x} y="172" width="10" height="126" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>)}
      <rect x="1040" y="160" width="220" height="140" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <rect x="1025" y="152" width="250" height="10" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      <polyline points="1025,152 1150,108 1275,152" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
      {[1055,1085,1115,1145,1175,1205,1235].map((x,i) => <rect key={i} x={x} y="162" width="10" height="136" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>)}
      <rect x="60" y="210" width="100" height="90" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      <polyline points="50,204 110,175 170,204" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      {[72,96,120,144].map((x,i) => <rect key={i} x={x} y="212" width="8" height="86" stroke="#2F5DAA" strokeWidth="0.7" fill="none"/>)}
      <rect x="1280" y="200" width="120" height="100" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
      <polyline points="1268,193 1340,162 1412,193" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
      {[1292,1318,1344,1370].map((x,i) => <rect key={i} x={x} y="202" width="8" height="96" stroke="#2F5DAA" strokeWidth="0.7" fill="none"/>)}
      {[[100,30],[300,20],[500,40],[900,25],[1100,35],[1350,20],[1420,45]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="2" fill="#2F5DAA" opacity="0.5"/>)}
    </svg>
  );
}

function SecurityCharacter({ mousePos }: { mousePos: { x: number; y: number } }) {
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
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
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    targetRef.current = { x: (mousePos.x - 0.5) * 16, y: (mousePos.y - 0.5) * 10 };
  }, [mousePos]);

  const clampedPupil = (baseX: number, baseY: number, r = 5) => {
    const mag = Math.sqrt(pupil.x ** 2 + pupil.y ** 2);
    const scale = mag > r ? r / mag : 1;
    return { cx: baseX + pupil.x * scale, cy: baseY + pupil.y * scale };
  };

  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" style={{ opacity: 0.5 }}>
      <defs>
        <clipPath id="robotEyeL"><path d="M130 220 C150 205, 180 215, 185 225 C170 235, 145 235, 130 220 Z"/></clipPath>
        <clipPath id="robotEyeR"><path d="M270 220 C250 205, 220 215, 215 225 C230 235, 255 235, 270 220 Z"/></clipPath>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g stroke="#2F5DAA" strokeWidth="0.5" opacity="0.9">
        <polyline points="200,450 140,410 100,320 80,240 100,140 140,80 200,50 260,80 300,140 320,240 300,320 260,410 200,450"/>
        <polyline points="140,80 200,100 260,80"/>
        <polyline points="100,140 140,150 200,140 260,150 300,140"/>
        <line x1="200" y1="50" x2="200" y2="100"/><line x1="140" y1="80" x2="140" y2="150"/><line x1="260" y1="80" x2="260" y2="150"/>
        <line x1="200" y1="100" x2="140" y2="150"/><line x1="200" y1="100" x2="260" y2="150"/><line x1="200" y1="100" x2="200" y2="140"/>
        <line x1="100" y1="140" x2="140" y2="80"/><line x1="300" y1="140" x2="260" y2="80"/>
        <polyline points="80,240 120,240 130,220 185,225 200,200 215,225 270,220 280,240 320,240"/>
        <line x1="100" y1="140" x2="120" y2="240"/><line x1="140" y1="150" x2="130" y2="220"/>
        <line x1="200" y1="140" x2="185" y2="225"/><line x1="200" y1="140" x2="200" y2="200"/><line x1="200" y1="140" x2="215" y2="225"/>
        <line x1="260" y1="150" x2="270" y2="220"/><line x1="300" y1="140" x2="280" y2="240"/>
        <polyline points="100,320 130,280 160,260 200,280 240,260 270,280 300,320"/>
        <line x1="120" y1="240" x2="130" y2="280"/><line x1="130" y1="220" x2="160" y2="260"/>
        <line x1="185" y1="225" x2="160" y2="260"/><line x1="185" y1="225" x2="200" y2="280"/>
        <line x1="200" y1="200" x2="200" y2="280"/><line x1="215" y1="225" x2="200" y2="280"/>
        <line x1="215" y1="225" x2="240" y2="260"/><line x1="270" y1="220" x2="240" y2="260"/><line x1="280" y1="240" x2="270" y2="280"/>
        <polyline points="200,200 185,280 200,320 215,280 200,200"/>
        <line x1="160" y1="260" x2="185" y2="280"/><line x1="240" y1="260" x2="215" y2="280"/>
        <polyline points="140,410 160,360 200,370 240,360 260,410"/>
        <line x1="130" y1="280" x2="160" y2="360"/><line x1="160" y1="260" x2="160" y2="360"/>
        <line x1="185" y1="280" x2="160" y2="360"/><line x1="185" y1="280" x2="200" y2="370"/>
        <line x1="200" y1="320" x2="200" y2="370"/><line x1="215" y1="280" x2="200" y2="370"/>
        <line x1="215" y1="280" x2="240" y2="360"/><line x1="240" y1="260" x2="240" y2="360"/><line x1="270" y1="280" x2="240" y2="360"/>
        <polyline points="160,360 200,390 240,360"/>
        <line x1="200" y1="370" x2="200" y2="390"/><line x1="140" y1="410" x2="200" y2="390"/><line x1="260" y1="410" x2="200" y2="390"/><line x1="200" y1="450" x2="200" y2="390"/>
        <polyline points="140,410 140,500"/><polyline points="260,410 260,500"/>
        <polyline points="200,450 180,500"/><polyline points="200,450 220,500"/>
        <line x1="140" y1="450" x2="180" y2="500"/><line x1="260" y1="450" x2="220" y2="500"/>
        <polyline points="140,500 50,520"/><polyline points="260,500 350,520"/>
      </g>
      <g fill="#2F5DAA" opacity="1.0">
        {[[200,50],[140,80],[260,80],[100,140],[300,140],[200,100],[140,150],[260,150],[200,140],[80,240],[320,240],[120,240],[280,240],[130,220],[270,220],[185,225],[215,225],[200,200],[100,320],[300,320],[130,280],[270,280],[160,260],[240,260],[200,280],[185,280],[215,280],[200,320],[140,410],[260,410],[160,360],[240,360],[200,370],[200,390],[200,450]].map((pt,i) => (
          <circle key={i} cx={pt[0]} cy={pt[1]} r="1.5"/>
        ))}
      </g>
      <path d="M130 220 C150 205, 180 215, 185 225 C170 235, 145 235, 130 220 Z" stroke="#2F5DAA" strokeWidth="1.2" fill="none" opacity="0.8"/>
      <path d="M270 220 C250 205, 220 215, 215 225 C230 235, 255 235, 270 220 Z" stroke="#2F5DAA" strokeWidth="1.2" fill="none" opacity="0.8"/>
      <path d="M130 220 C150 205, 180 215, 185 225 C170 235, 145 235, 130 220 Z" fill="#2F5DAA" opacity="0.05"/>
      <path d="M270 220 C250 205, 220 215, 215 225 C230 235, 255 235, 270 220 Z" fill="#2F5DAA" opacity="0.05"/>
      <g clipPath="url(#robotEyeL)">
        <circle cx={clampedPupil(160,221).cx} cy={clampedPupil(160,221).cy} r="7" fill="#2F5DAA" filter="url(#glow)" opacity="0.8"/>
        <circle cx={clampedPupil(160,221).cx} cy={clampedPupil(160,221).cy} r="3" fill="#EEF3FB"/>
      </g>
      <g clipPath="url(#robotEyeR)">
        <circle cx={clampedPupil(240,221).cx} cy={clampedPupil(240,221).cy} r="7" fill="#2F5DAA" filter="url(#glow)" opacity="0.8"/>
        <circle cx={clampedPupil(240,221).cx} cy={clampedPupil(240,221).cy} r="3" fill="#EEF3FB"/>
      </g>
    </svg>
  );
}

const QUICK_LINKS = [
  {
    href: '/check-in',
    label: 'NEW VISITOR',
    desc: 'Initiate a secure check-in sequence and register your arrival using our advanced verification.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    href: '/returning',
    label: 'RETURNING',
    desc: 'Fast-track entry using your registered biometric or mobile identity token.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
  },
  {
    href: '/appointment',
    label: 'PRE-BOOK',
    desc: 'Schedule your visit in advance for a seamless and frictionless arrival experience.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useGSAP(() => {
    gsap.from('.hero-title', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 });
    gsap.from('.hero-char', { x: 40, opacity: 0, duration: 0.8, delay: 0.15, ease: 'power3.out' });
    gsap.from('.quick-card', { y: 20, opacity: 0, duration: 0.5, delay: 0.3, stagger: 0.07, ease: 'power2.out' });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', color: '#0A1F44' }}>

      {/* NAV */}
      <nav style={{ flexShrink: 0 }} className="z-50 bg-white/90 backdrop-blur-sm border-b border-[#E2E8F0]/60 px-8 md:px-16 py-4 flex items-center justify-between">
        <img src="/vts-logo.png" alt="VTS INFOSOFT" className="h-8 w-auto object-contain"/>
        <span className="hidden md:block text-[11px] font-semibold tracking-widest text-[#6B7FA3] uppercase">Enterprise Visitor Management</span>
        <Link href="/login" className="bg-[#0A1F44] text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-sm hover:bg-[#1a3a6e] transition-colors flex items-center gap-2">
          Employee Portal
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </nav>

      {/* HERO — fills remaining space */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#fff' }}>
        {/* Large title top-left */}
        <div className="absolute top-0 left-0 right-0 z-10 px-8 md:px-16 pt-8">
          <h1 className="text-[clamp(4.5rem,12vw,10.5rem)] font-black tracking-tighter leading-[0.88] uppercase select-none">
            <span className="block hero-title text-[#0A1F44]">VISITOR</span>
            <span className="block hero-title text-[#0A1F44]">PASS</span>
          </h1>
        </div>

        {/* Security character — right side */}
        <div className="absolute right-0 top-0 bottom-0 w-[58%] md:w-[52%] hero-char pointer-events-none">
          <SecurityCharacter mousePos={mousePos}/>
        </div>

        {/* Greek skyline */}
        <div className="absolute bottom-0 left-0 right-0 z-0 opacity-[0.10] pointer-events-none">
          <GreekSkyline/>
        </div>
      </div>

      {/* Quick access cards — always pinned at bottom */}
      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #E2E8F0', background: '#fff' }}>
        {QUICK_LINKS.map(({ href, label, desc, icon }) => (
          <Link
            key={href}
            href={href}
            className="quick-card group flex items-start gap-4 px-6 md:px-8 py-5 border-r last:border-r-0 border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="shrink-0 mt-0.5 text-[#2F5DAA]">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black tracking-[0.2em] text-[#0A1F44] mb-1">{label}</div>
              <p className="text-[#6B7FA3] text-[11px] leading-relaxed">{desc}</p>
            </div>
            <div className="shrink-0 mt-1 text-[#2F5DAA] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
