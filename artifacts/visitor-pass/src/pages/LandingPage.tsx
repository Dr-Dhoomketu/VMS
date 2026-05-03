import { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full opacity-80 mix-blend-multiply">
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

function GreekStatue() {
  return (
    <svg viewBox="0 0 200 500" fill="none" className="w-full h-full opacity-90 drop-shadow-xl" stroke="#2F5DAA" strokeWidth="0.8">
      <g strokeWidth="1" fill="rgba(255,255,255,0.7)">
        <rect x="60" y="420" width="80" height="20"/><rect x="50" y="440" width="100" height="20"/>
        <rect x="40" y="460" width="120" height="40"/>
        <line x1="60" y1="430" x2="140" y2="430" strokeWidth="0.5"/><line x1="50" y1="450" x2="150" y2="450" strokeWidth="0.5"/>
        {[50,70,90,110,130,150].map(x => <line key={x} x1={x} y1="460" x2={x} y2="500" strokeWidth="0.3" opacity="0.5"/>)}
      </g>
      <g fill="rgba(255,255,255,0.5)">
        <path d="M100,70 C120,70 130,90 125,120 C120,150 105,170 105,200 C105,230 115,300 115,420 Z"/>
        <path d="M100,70 C80,70 70,90 75,120 C80,150 95,170 95,200 C95,230 85,300 85,420 Z"/>
        <path d="M85,420 L115,420"/>
        <path d="M75,120 C90,160 120,180 125,200 C130,240 100,300 115,420 Z"/>
        <path d="M80,130 C95,170 115,190 120,210 C125,250 95,310 110,420 Z"/>
        <path d="M85,140 C100,180 110,200 115,220 C120,260 90,320 105,420 Z"/>
        <path d="M70,150 C110,180 130,160 140,150"/>
        <path d="M125,120 C110,140 90,150 75,150"/>
        <path d="M120,130 C105,150 85,160 70,160"/>
        <ellipse cx="100" cy="45" rx="14" ry="18"/>
        <path d="M86,45 C86,30 114,30 114,45"/>
        <path d="M100,45 L100,55"/>
        <line x1="93" y1="40" x2="98" y2="40"/><line x1="102" y1="40" x2="107" y2="40"/>
        <path d="M75,120 C60,150 65,190 85,210 Z"/>
        <path d="M125,120 C140,150 135,190 115,210 Z"/>
      </g>
      <path d="M95,200 C80,250 90,350 80,420" strokeWidth="0.5" opacity="0.6"/>
      <path d="M105,200 C120,250 110,350 120,420" strokeWidth="0.5" opacity="0.6"/>
    </svg>
  );
}

const STEPS = [
  { id:1, label:'Register', desc:'Fill in your details and capture a photo at the kiosk or online.',
    icon:<svg viewBox="0 0 48 48" fill="none" className="w-full h-full"><circle cx="24" cy="16" r="8" stroke="#2F5DAA" strokeWidth="1.8"/><path d="M8 40 C8 31 15 26 24 26 C33 26 40 31 40 40" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/><line x1="32" y1="16" x2="40" y2="16" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/><line x1="36" y1="12" x2="36" y2="20" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id:2, label:'Submit Request', desc:'Your visit request is sent to the host employee for approval.',
    icon:<svg viewBox="0 0 48 48" fill="none" className="w-full h-full"><rect x="8" y="10" width="32" height="28" rx="4" stroke="#2F5DAA" strokeWidth="1.8"/><line x1="14" y1="19" x2="34" y2="19" stroke="#2F5DAA" strokeWidth="1.5"/><line x1="14" y1="25" x2="34" y2="25" stroke="#2F5DAA" strokeWidth="1.5"/><line x1="14" y1="31" x2="26" y2="31" stroke="#2F5DAA" strokeWidth="1.5"/><path d="M30 6 L30 14" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round"/><path d="M26 10 L30 6 L34 10" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:3, label:'Email Sent', desc:'A confirmation email with your visit details lands in your inbox.',
    icon:<svg viewBox="0 0 48 48" fill="none" className="w-full h-full"><rect x="6" y="12" width="36" height="26" rx="4" stroke="#2F5DAA" strokeWidth="1.8"/><path d="M6 16 L24 28 L42 16" stroke="#2F5DAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="36" cy="14" r="6" fill="#2F5DAA"/><path d="M33 14 L35.5 16.5 L39 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:4, label:'Show QR Code', desc:'Present your unique QR code at the entrance for instant scan.',
    icon:<svg viewBox="0 0 48 48" fill="none" className="w-full h-full"><rect x="8" y="8" width="14" height="14" rx="2" stroke="#2F5DAA" strokeWidth="1.8"/><rect x="11" y="11" width="8" height="8" rx="1" fill="#2F5DAA" opacity="0.25"/><rect x="26" y="8" width="14" height="14" rx="2" stroke="#2F5DAA" strokeWidth="1.8"/><rect x="29" y="11" width="8" height="8" rx="1" fill="#2F5DAA" opacity="0.25"/><rect x="8" y="26" width="14" height="14" rx="2" stroke="#2F5DAA" strokeWidth="1.8"/><rect x="11" y="29" width="8" height="8" rx="1" fill="#2F5DAA" opacity="0.25"/><rect x="26" y="26" width="5" height="5" rx="1" fill="#2F5DAA"/><rect x="33" y="26" width="5" height="5" rx="1" fill="#2F5DAA"/><rect x="26" y="33" width="5" height="5" rx="1" fill="#2F5DAA"/><rect x="33" y="33" width="5" height="5" rx="1" fill="#2F5DAA"/></svg> },
  { id:5, label:'Access Granted', desc:'Gate opens, badge prints, and your host is notified of your arrival.',
    icon:<svg viewBox="0 0 48 48" fill="none" className="w-full h-full"><circle cx="24" cy="24" r="16" stroke="#2F5DAA" strokeWidth="1.8"/><path d="M16 24 L21 29 L32 18" stroke="#2F5DAA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const path = pathRef.current; if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        path.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.4,0,0.2,1)';
        path.style.strokeDashoffset = '0';
        STEPS.forEach((_, i) => setTimeout(() => setActiveStep(i), 400 + i * 480));
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 px-8 md:px-16 overflow-hidden bg-white">
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none"/>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="vp-caption mb-2">How It Works</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0A1F44]">From Arrival to Access</h2>
          <p className="text-[#6B7FA3] mt-2 text-sm max-w-sm mx-auto">Five steps. Under 60 seconds.</p>
        </div>
        <div className="relative w-full" style={{ paddingBottom:'28%' }}>
          <svg viewBox="0 0 680 220" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            <path ref={pathRef} d="M 40 80 C 90 80 100 150 170 150 C 240 150 250 80 340 80 C 430 80 440 150 510 150 C 580 150 590 80 640 80" stroke="#2F5DAA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35"/>
            {STEPS.map((step, i) => {
              const cx = [40,170,340,510,640][i];
              const cy = [80,150,80,150,80][i];
              const labelY = cy < 100 ? cy - 52 : cy + 38;
              const active = activeStep >= i;
              return (
                <g key={step.id} style={{ opacity:active?1:0, transform:active?'translateY(0)':'translateY(12px)', transition:'opacity 0.5s ease, transform 0.5s ease' }}>
                  <circle cx={cx} cy={cy} r="28" fill={i===4?'#0A1F44':'white'} stroke="#2F5DAA" strokeWidth="1.5"/>
                  <foreignObject x={cx-18} y={cy-18} width="36" height="36">
                    <div style={{ width:36, height:36, padding:4 }}>
                      {i===4
                        ? <svg viewBox="0 0 48 48" fill="none" style={{ width:'100%', height:'100%' }}><circle cx="24" cy="24" r="16" stroke="white" strokeWidth="1.8"/><path d="M16 24 L21 29 L32 18" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : step.icon}
                    </div>
                  </foreignObject>
                  <circle cx={cx+20} cy={cy-20} r="9" fill="#2F5DAA"/>
                  <text x={cx+20} y={cy-16} textAnchor="middle" fontSize="8" fontWeight="800" fill="white" fontFamily="sans-serif">{step.id}</text>
                  <text x={cx} y={labelY} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0A1F44" fontFamily="sans-serif" letterSpacing="0.3">{step.label}</text>
                  <circle cx={cx} cy={cy} r="4" fill="#2F5DAA" opacity="0.5"/>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ opacity:activeStep>=i?1:0.3, transform:activeStep>=i?'translateY(0)':'translateY(8px)', transition:`all 0.5s ease ${i*0.1}s` }}
              className="text-center">
              <p className="text-[#6B7FA3] text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useGSAP(() => {
    gsap.from('.hero-title', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.08 });
    gsap.from('.hero-sub', { y: 30, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out' });
    gsap.from('.hero-btns', { y: 20, opacity: 0, duration: 0.8, delay: 0.9, ease: 'power3.out' });
    gsap.from('.hero-char', { x: 60, opacity: 0, duration: 1.2, delay: 0.3, ease: 'power3.out' });
    gsap.from('.hero-stat', { y: 20, opacity: 0, duration: 0.6, delay: 1.1, stagger: 0.12, ease: 'power2.out' });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-[#0A1F44] overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 vp-nav px-8 md:px-16 py-5 flex items-center justify-between">
        <img src="/vts-logo.png" alt="VISITORPASS" className="h-9 w-auto object-contain" style={{ width:'auto' }}/>
        <div className="hidden md:flex items-center gap-8">
          {['Check In','Appointment','Returning'].map((label, i) => {
            const paths = ['/check-in','/appointment','/returning'];
            return <Link key={label} href={paths[i]} className="text-[11px] font-bold uppercase tracking-widest text-[#6B7FA3] hover:text-[#0A1F44] transition-colors">{label}</Link>;
          })}
        </div>
        <Link href="/login" className="btn-vp-primary text-[10px] py-3 px-6">Employee Portal →</Link>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 pb-0 overflow-hidden column-bg">
        <div className="absolute bottom-0 left-0 right-0 z-0 opacity-[0.07]"><GreekSkyline/></div>
        <div className="absolute inset-0 z-0" style={{ background:'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(47,93,170,0.04) 0%, transparent 70%)' }}/>

        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="vp-caption mb-6 hero-sub">Enterprise Security · Est. 2024</div>
            <h1 className="text-[clamp(3.5rem,9vw,8rem)] font-black tracking-tighter leading-none uppercase mb-8">
              <span className="block hero-title">VISITOR</span>
              <span className="block hero-title shimmer-text">PASS</span>
              <span className="block hero-title">SYSTEM</span>
            </h1>
            <p className="text-[#6B7FA3] text-base leading-relaxed max-w-md mb-10 hero-sub">
              A premium, secure visitor management platform built for modern enterprises. From check-in to clearance — instantaneous.
            </p>
            <div className="flex flex-wrap gap-4 hero-btns">
              <Link href="/check-in" className="btn-vp-primary py-4 px-10 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Visitor Check‑In
              </Link>
              <Link href="/appointment" className="btn-vp-secondary py-4 px-10 text-sm">Book Appointment</Link>
            </div>
            <div className="flex gap-8 mt-12">
              {[['< 60s','Average Check-In'],['100%','Digital & Paperless'],['QR','Secure Gate Pass']].map(([val,label]) => (
                <div key={label} className="hero-stat">
                  <div className="text-xl font-black text-[#0A1F44] tracking-tight">{val}</div>
                  <div className="text-[9px] text-[#6B7FA3] uppercase tracking-widest font-bold mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hero-char flex items-center justify-center">
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute inset-0 rounded-full opacity-[0.04]" style={{ background:'radial-gradient(circle, #2F5DAA 0%, transparent 70%)' }}/>
              <SecurityCharacter mousePos={mousePos}/>
              <div className="absolute top-8 -right-4 float-badge">
                <div className="vp-card px-4 py-3 flex items-center gap-3 shadow-xl">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                  <span className="text-[10px] font-bold text-[#0A1F44] uppercase tracking-widest whitespace-nowrap">System Active</span>
                </div>
              </div>
              <div className="absolute bottom-16 -left-4 float-anim" style={{ animationDelay:'1s' }}>
                <div className="vp-card px-4 py-3 shadow-xl">
                  <div className="text-[9px] text-[#6B7FA3] uppercase tracking-widest font-bold">Latest Access</div>
                  <div className="text-sm font-black text-[#0A1F44] mt-1">J. Doe — Approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="py-20 px-8 md:px-16 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="vp-caption mb-2">Quick Access</div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Choose Your Path</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { href:'/check-in', title:'New Visitor', sub:'Check In Now', desc:'Register and check in as a first-time visitor. Capture photo, fill details, await approval.', icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', cta:'Begin Check-In →' },
              { href:'/appointment', title:'Schedule Visit', sub:'Pre-Book', desc:'Plan ahead by scheduling your visit in advance. Receive a QR code before you arrive.', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', cta:'Book Appointment →' },
              { href:'/returning', title:'Returning Visitor', sub:'Fast Track', desc:'Already visited before? Look up your record by phone number and skip re-registration.', icon:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', cta:'Quick Check-In →' },
            ].map(({ href, title, sub, desc, icon, cta }) => (
              <Link key={href} href={href} className="vp-card-feature block group">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF3FB] flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#2F5DAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={icon}/></svg>
                </div>
                <div className="vp-caption mb-2">{sub}</div>
                <h3 className="text-xl font-black text-[#0A1F44] tracking-tight mb-3">{title}</h3>
                <p className="text-[#6B7FA3] text-sm leading-relaxed mb-6">{desc}</p>
                <div className="flex items-center gap-2 text-[#2F5DAA] text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">{cta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <HowItWorks/>

      {/* STATUE SECTION */}
      <section className="relative py-24 px-8 md:px-16 bg-[#0A1F44] overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <GreekSkyline/>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-6">Why VISITORPASS?</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-6">Built for the<br/>Modern Enterprise</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-10">From startup to enterprise, our visitor management system scales with your security needs — offering real-time approvals, QR gate passes, and full audit trails.</p>
            <div className="grid grid-cols-2 gap-4">
              {[['Real-Time','Live notifications & approvals'],['Secure','JWT + encrypted gate passes'],['Analytics','Full visit audit trails'],['Smart QR','Scannable digital pass system']].map(([t,d]) => (
                <div key={t} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-white font-black text-sm mb-1">{t}</div>
                  <div className="text-white/40 text-[10px] leading-snug">{d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-80 md:h-96 flex items-end justify-center">
            <GreekStatue/>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E2E8F0] px-8 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <img src="/vts-logo.png" alt="VISITORPASS" className="h-8 w-auto object-contain opacity-60" style={{ width:'auto' }}/>
        <div className="flex gap-8">
          <Link href="/check-in" className="text-[10px] uppercase tracking-widest text-[#6B7FA3] hover:text-[#0A1F44] font-bold transition-colors">Check In</Link>
          <Link href="/appointment" className="text-[10px] uppercase tracking-widest text-[#6B7FA3] hover:text-[#0A1F44] font-bold transition-colors">Appointment</Link>
          <Link href="/returning" className="text-[10px] uppercase tracking-widest text-[#6B7FA3] hover:text-[#0A1F44] font-bold transition-colors">Returning</Link>
          <Link href="/login" className="text-[10px] uppercase tracking-widest text-[#6B7FA3] hover:text-[#0A1F44] font-bold transition-colors">Login</Link>
        </div>
        <p className="text-[10px] text-[#6B7FA3] uppercase tracking-widest">&copy; {new Date().getFullYear()} VISITORPASS — All Rights Reserved</p>
      </footer>
    </div>
  );
}
