import { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GeoBackground from '@/components/GeoBackground';

gsap.registerPlugin(ScrollTrigger);

function QRScannerSVG() {
  return (
    <svg viewBox="0 0 520 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', maxWidth: '480px' }}>
      <defs>
        <radialGradient id="qrGlow" cx="50%" cy="46%" r="48%">
          <stop offset="0%" stopColor="#2F5DAA" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#2F5DAA" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="scanGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2F5DAA" stopOpacity="0"/>
          <stop offset="25%" stopColor="#2F5DAA" stopOpacity="0.7"/>
          <stop offset="50%" stopColor="#4A7FD4" stopOpacity="1"/>
          <stop offset="75%" stopColor="#2F5DAA" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#2F5DAA" stopOpacity="0"/>
        </linearGradient>
        <filter id="scanGlowF" x="-20%" y="-300%" width="140%" height="700%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <ellipse cx="258" cy="230" rx="210" ry="195" fill="url(#qrGlow)"/>

      <circle cx="258" cy="220" r="155" stroke="rgba(47,93,170,0.05)" strokeWidth="1">
        <animate attributeName="r" values="145;185;145" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="258" cy="220" r="155" stroke="rgba(47,93,170,0.05)" strokeWidth="1">
        <animate attributeName="r" values="145;185;145" dur="4s" begin="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="4s" begin="2s" repeatCount="indefinite"/>
      </circle>

      <rect x="68" y="55" width="348" height="330" rx="4" stroke="rgba(47,93,170,0.08)" strokeWidth="1" strokeDasharray="5 5"/>

      <path d="M 68 115 L 68 55 L 128 55" stroke="#0A1F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 356 55 L 416 55 L 416 115" stroke="#0A1F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 68 325 L 68 385 L 128 385" stroke="#0A1F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 356 385 L 416 385 L 416 325" stroke="#0A1F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>

      <circle cx="68"  cy="55"  r="5" fill="#2F5DAA" opacity="0.6"/>
      <circle cx="416" cy="55"  r="5" fill="#2F5DAA" opacity="0.6"/>
      <circle cx="68"  cy="385" r="5" fill="#2F5DAA" opacity="0.6"/>
      <circle cx="416" cy="385" r="5" fill="#2F5DAA" opacity="0.6"/>

      <rect x="88"  y="75"  width="74" height="74" stroke="#2F5DAA" strokeWidth="2.5" fill="rgba(47,93,170,0.04)" rx="2"/>
      <rect x="102" y="89"  width="46" height="46" fill="rgba(47,93,170,0.10)" rx="1"/>
      <rect x="116" y="103" width="18" height="18" fill="#2F5DAA" rx="1"/>

      <rect x="322" y="75"  width="74" height="74" stroke="#2F5DAA" strokeWidth="2.5" fill="rgba(47,93,170,0.04)" rx="2"/>
      <rect x="336" y="89"  width="46" height="46" fill="rgba(47,93,170,0.10)" rx="1"/>
      <rect x="350" y="103" width="18" height="18" fill="#2F5DAA" rx="1"/>

      <rect x="88"  y="295" width="74" height="74" stroke="#2F5DAA" strokeWidth="2.5" fill="rgba(47,93,170,0.04)" rx="2"/>
      <rect x="102" y="309" width="46" height="46" fill="rgba(47,93,170,0.10)" rx="1"/>
      <rect x="116" y="323" width="18" height="18" fill="#2F5DAA" rx="1"/>

      {([
        [176,75],[192,75],[208,75],[236,75],[264,75],[292,75],[308,75],
        [176,91],[208,91],[236,91],[292,91],
        [176,107],[192,107],[208,107],[222,107],[264,107],[292,107],[308,107],
        [176,123],[208,123],[250,123],[278,123],
        [176,139],[192,139],[208,139],[236,139],[264,139],[308,139],
        [176,155],[264,155],[278,155],[292,155],
        [176,171],[192,171],[222,171],[250,171],[308,171],
        [176,187],[208,187],[222,187],[250,187],[278,187],[308,187],
        [192,203],[236,203],[264,203],[308,203],
        [176,219],[208,219],[222,219],[264,219],[292,219],
        [192,235],[250,235],[278,235],[308,235],
        [176,251],[208,251],[236,251],[292,251],[308,251],
        [192,267],[222,267],[264,267],[278,267],
        [176,283],[208,283],[236,283],[250,283],[308,283],
      ] as [number,number][]).map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="10" height="10" rx="1"
          fill={i%3===0?'rgba(47,93,170,0.65)':i%3===1?'rgba(47,93,170,0.35)':'rgba(47,93,170,0.5)'}/>
      ))}

      {([
        [322,187],[338,187],[354,187],[382,187],
        [322,203],[354,203],[382,203],
        [338,219],[366,219],[382,219],
        [322,235],[354,235],[382,235],
        [322,251],[338,251],[366,251],
        [322,267],[354,267],[382,267],
        [338,283],[366,283],
      ] as [number,number][]).map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="10" height="10" rx="1"
          fill={i%2===0?'rgba(47,93,170,0.45)':'rgba(47,93,170,0.25)'}/>
      ))}

      <rect x="68" width="348" height="2.5" fill="url(#scanGrad)" filter="url(#scanGlowF)">
        <animate attributeName="y" values="55;385;55" dur="3s" repeatCount="indefinite" calcMode="linear"/>
        <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.05;0.45;0.95;1" dur="3s" repeatCount="indefinite"/>
      </rect>

      <text x="258" y="36" textAnchor="middle" fontSize="7.5" fontWeight="800" fontFamily="sans-serif" fill="rgba(47,93,170,0.4)" letterSpacing="0.35em">VISITOR MANAGEMENT SYSTEM</text>

      <g transform="translate(432,90)">
        <rect x="0" y="0" width="82" height="28" rx="14" fill="white" stroke="rgba(47,93,170,0.18)"/>
        <circle cx="14" cy="14" r="5" fill="rgba(47,93,170,0.12)"/>
        <circle cx="14" cy="14" r="2.5" fill="#2F5DAA">
          <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <text x="27" y="18.5" fontSize="7.5" fontWeight="800" fontFamily="sans-serif" fill="#0A1F44" letterSpacing="0.12em">SCANNING</text>
      </g>
      <line x1="416" y1="104" x2="432" y2="104" stroke="rgba(47,93,170,0.25)" strokeWidth="1" strokeDasharray="3 3"/>

      <g transform="translate(432,228)">
        <rect x="0" y="0" width="84" height="28" rx="14" fill="rgba(22,163,74,0.06)" stroke="rgba(22,163,74,0.28)"/>
        <circle cx="14" cy="14" r="5" fill="rgba(22,163,74,0.15)"/>
        <path d="M 11 14 L 13.5 16.5 L 18 11" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="27" y="18.5" fontSize="7.5" fontWeight="800" fontFamily="sans-serif" fill="#16a34a" letterSpacing="0.12em">VERIFIED</text>
      </g>
      <line x1="416" y1="242" x2="432" y2="242" stroke="rgba(47,93,170,0.25)" strokeWidth="1" strokeDasharray="3 3"/>

      <g transform="translate(-100,148)">
        <rect x="0" y="0" width="90" height="28" rx="14" fill="white" stroke="rgba(47,93,170,0.18)"/>
        <rect x="7" y="7" width="14" height="14" rx="3" fill="rgba(47,93,170,0.08)"/>
        <rect x="10" y="10" width="8" height="8" rx="1" fill="#2F5DAA" opacity="0.5"/>
        <text x="28" y="18.5" fontSize="7.5" fontWeight="800" fontFamily="sans-serif" fill="#0A1F44" letterSpacing="0.1em">GATE PASS</text>
      </g>
      <line x1="68" y1="162" x2="-10" y2="162" stroke="rgba(47,93,170,0.25)" strokeWidth="1" strokeDasharray="3 3"/>

      <g transform="translate(-100,298)">
        <rect x="0" y="0" width="90" height="28" rx="14" fill="rgba(47,93,170,0.06)" stroke="rgba(47,93,170,0.2)"/>
        <path d="M 12 17 L 12 13 A 3 3 0 0 1 18 13 L 18 17 Z M 9 17 L 21 17 L 21 22 L 9 22 Z" stroke="#2F5DAA" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
        <text x="28" y="18.5" fontSize="7.5" fontWeight="800" fontFamily="sans-serif" fill="#2F5DAA" letterSpacing="0.1em">GRANTED</text>
      </g>
      <line x1="68" y1="312" x2="-10" y2="312" stroke="rgba(47,93,170,0.25)" strokeWidth="1" strokeDasharray="3 3"/>

      <rect x="154" y="402" width="196" height="34" rx="17" fill="rgba(10,31,68,0.04)" stroke="rgba(47,93,170,0.12)"/>
      <text x="252" y="424" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="sans-serif" fill="#2F5DAA" letterSpacing="0.22em">SCAN TO CHECK IN</text>

      <circle cx="258" cy="460" r="3" fill="#2F5DAA" opacity="0.3"/>
      <circle cx="240" cy="460" r="2" fill="#2F5DAA" opacity="0.15"/>
      <circle cx="276" cy="460" r="2" fill="#2F5DAA" opacity="0.15"/>
    </svg>
  );
}

const steps = [
  { num: '01', title: 'Arrive & Scan', body: 'Walk up to the reception kiosk. Scan the QR code or enter your mobile number to begin check-in in seconds.' },
  { num: '02', title: 'Identity Verified', body: 'The system verifies your identity, captures a photo, and routes your visit request to your host for instant approval.' },
  { num: '03', title: 'Gate Pass Issued', body: 'Receive your digital gate pass instantly. Your host is notified and access is granted — seamlessly and securely.' },
];

export default function LandingPage() {
  const cardsRef  = useRef<HTMLDivElement>(null);
  const stepsRef  = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text-item', { y: 28, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
      gsap.from(scannerRef.current, { x: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.25 });
      gsap.from('.quick-card', {
        scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
      });
      gsap.from('.step-item', {
        scrollTrigger: { trigger: stepsRef.current, start: 'top 85%' },
        y: 25, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0A1F44', overflowX: 'hidden' }}>
      <GeoBackground />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '68px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(10,31,68,0.06)',
      }}>
        <img src="/vts-logo.png" alt="VISITORPASS" style={{ height: '34px', width: 'auto', objectFit: 'contain' }}/>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/check-in">
            <button className="btn-vp-secondary" style={{ padding: '9px 20px', fontSize: '0.65rem' }}>Check In</button>
          </Link>
          <Link href="/login">
            <button className="btn-vp-primary" style={{ padding: '10px 22px', fontSize: '0.65rem' }}>Employee Portal →</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 48px 60px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

          {/* Left text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hero-text-item" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 18px', borderRadius: '999px',
              background: 'rgba(47,93,170,0.06)', border: '1px solid rgba(47,93,170,0.14)',
              marginBottom: '28px',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2F5DAA', animation: 'pulseBlue 2s infinite' }}/>
              <span style={{ fontSize: '0.57rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F5DAA' }}>
                Enterprise Visitor Management
              </span>
            </div>

            <h1 className="hero-text-item" style={{
              fontSize: 'clamp(3rem, 6vw, 5.2rem)',
              fontWeight: 900, lineHeight: 0.93, letterSpacing: '-0.04em',
              textTransform: 'uppercase', color: '#0A1F44', marginBottom: '24px',
            }}>
              VISITOR<br/>
              <span style={{
                background: 'linear-gradient(135deg, #2F5DAA 0%, #4A7FD4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>PASS</span>
            </h1>

            <p className="hero-text-item" style={{
              fontSize: '0.95rem', color: '#6B7FA3', lineHeight: 1.78,
              maxWidth: '440px', marginBottom: '36px',
            }}>
              Secure, intelligent visitor management for modern enterprises. Instant check-in, digital gate passes, and real-time host notifications.
            </p>

            <div className="hero-text-item" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '44px' }}>
              <Link href="/check-in">
                <button className="btn-vp-primary" style={{ padding: '14px 30px', fontSize: '0.7rem' }}>New Visitor →</button>
              </Link>
              <Link href="/returning">
                <button className="btn-vp-secondary" style={{ padding: '14px 28px', fontSize: '0.7rem' }}>Returning Visitor</button>
              </Link>
              <Link href="/appointment">
                <button className="btn-vp-secondary" style={{ padding: '14px 28px', fontSize: '0.7rem' }}>Pre-Book</button>
              </Link>
            </div>

            <div className="hero-text-item" style={{ display: 'flex', gap: '36px' }}>
              {[
                { value: '99.9%',   label: 'Uptime' },
                { value: '<3s',     label: 'Check-in Time' },
                { value: '256-bit', label: 'Encryption' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#6B7FA3', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: QR Scanner */}
          <div ref={scannerRef} style={{ flex: '0 0 460px', display: 'flex', justifyContent: 'center' }} className="hero-scanner">
            <QRScannerSVG />
          </div>
        </div>
      </section>

      {/* QUICK ACCESS CARDS */}
      <section ref={cardsRef} style={{ padding: '0 48px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.57rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '10px' }}>Quick Access</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0A1F44' }}>How would you like to proceed?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              {
                href: '/check-in', label: 'First Time Visit', title: 'New Visitor Check-In',
                body: 'Register your details, capture a photo, and submit your visit request for host approval.',
                iconPath: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
              },
              {
                href: '/returning', label: 'Return Visit', title: 'Returning Visitor',
                body: "Already registered? Look up your record with your mobile number and check in instantly.",
                iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
              },
              {
                href: '/appointment', label: 'Pre-Scheduled', title: 'Book Appointment',
                body: 'Schedule your visit in advance. Your host receives a pre-approval request immediately.',
                iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              },
            ].map(({ href, label, title, body, iconPath }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="quick-card lux-card" style={{ padding: '36px', cursor: 'pointer', height: '100%' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '14px',
                    background: 'rgba(47,93,170,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#2F5DAA', marginBottom: '20px',
                  }}>
                    <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={iconPath}/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '10px' }}>{label}</div>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0A1F44', letterSpacing: '-0.02em', marginBottom: '12px' }}>{title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#6B7FA3', lineHeight: 1.72 }}>{body}</p>
                  <div style={{ marginTop: '24px', fontSize: '0.68rem', fontWeight: 700, color: '#2F5DAA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Get Started
                    <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={stepsRef} style={{ padding: '80px 48px', background: '#F4F7FC', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(47,93,170,0.05) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}/>
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ fontSize: '0.57rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '10px' }}>The Process</p>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0A1F44' }}>Three steps to access</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {steps.map((s, i) => (
              <div key={i} className="step-item lux-card" style={{ padding: '36px' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'rgba(47,93,170,0.1)', lineHeight: 1, marginBottom: '20px' }}>{s.num}</div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0A1F44', marginBottom: '12px', letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6B7FA3', lineHeight: 1.75 }}>{s.body}</p>
                <div style={{ marginTop: '24px', width: '30px', height: '2px', background: 'linear-gradient(90deg, #2F5DAA, transparent)', borderRadius: '2px' }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(10,31,68,0.06)', padding: '28px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        background: '#ffffff', position: 'relative', zIndex: 1,
      }}>
        <img src="/vts-logo.png" alt="VISITORPASS" style={{ height: '26px', width: 'auto', objectFit: 'contain' }}/>
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          {['New Visitor', 'Returning', 'Appointment', 'Login'].map((t, i) => (
            <Link key={t} href={['/check-in', '/returning', '/appointment', '/login'][i]}
              style={{ fontSize: '0.68rem', fontWeight: 600, color: '#6B7FA3', textDecoration: 'none' }}>{t}</Link>
          ))}
        </div>
        <p style={{ fontSize: '0.6rem', color: '#A0AEC0' }}>© 2025 VisitorPass. All rights reserved.</p>
      </footer>

      <style>{`
        @media (max-width: 1100px) { .hero-scanner { display: none !important; } }
        @media (max-width: 768px) {
          section, nav, footer { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </div>
  );
}
