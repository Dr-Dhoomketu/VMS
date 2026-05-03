import { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProcessAnimation from '@/components/ProcessAnimation';

gsap.registerPlugin(ScrollTrigger);

function GridBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(47,93,170,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(47,93,170,0.07) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }}/>
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '70vw', height: '70vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,127,212,0.10) 0%, transparent 65%)',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(47,93,170,0.07) 0%, transparent 65%)',
      }}/>
      <div style={{
        position: 'absolute', top: '40%', left: '30%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,127,212,0.04) 0%, transparent 65%)',
      }}/>
    </div>
  );
}

function FloatingCards() {
  const icons = [
    {
      path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      label: 'VISITOR ID',
      g1: '#0A1F44', g2: '#1e3a7a',
      iconG1: '#2F5DAA', iconG2: '#4A7FD4',
      rotate: -10, top: 0, right: 60, delay: 0,
      w: 158, h: 188,
    },
    {
      path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      label: 'VERIFIED',
      g1: '#152c6b', g2: '#2a4d9e',
      iconG1: '#4A7FD4', iconG2: '#6fa0e8',
      rotate: 7, top: 165, right: -15, delay: 1.2,
      w: 158, h: 188,
    },
    {
      path: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      label: 'GATE PASS',
      g1: '#0d2550', g2: '#173776',
      iconG1: '#3b6dc0', iconG2: '#2F5DAA',
      rotate: -5, top: 342, right: 80, delay: 2.2,
      w: 140, h: 168,
    },
  ];

  return (
    <div style={{ position: 'relative', width: '460px', height: '560px', flexShrink: 0 }}>
      {icons.map((card, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: card.top,
          right: card.right,
          width: card.w,
          height: card.h,
          borderRadius: '28px',
          background: `linear-gradient(145deg, ${card.g1} 0%, ${card.g2} 100%)`,
          boxShadow: `0 40px 100px rgba(10,31,68,0.35), 0 12px 32px rgba(10,31,68,0.2), inset 0 1px 0 rgba(255,255,255,0.08)`,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '14px',
          transform: `rotate(${card.rotate}deg)`,
          animation: `cardFloat${i + 1} ${5.5 + i}s ease-in-out ${card.delay}s infinite`,
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: `linear-gradient(135deg, ${card.iconG1}, ${card.iconG2})`,
            boxShadow: `0 8px 24px rgba(47,93,170,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: '34px', height: '34px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d={card.path}/>
            </svg>
          </div>
          <span style={{
            fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
          }}>{card.label}</span>
          <div style={{
            width: '40px', height: '3px', borderRadius: '2px',
            background: `linear-gradient(90deg, ${card.iconG1}, ${card.iconG2})`,
            opacity: 0.6,
          }}/>
        </div>
      ))}

      {/* Floating status chips */}
      <div style={{
        position: 'absolute', top: 68, left: -30,
        background: '#fff', borderRadius: '999px',
        padding: '10px 18px', boxShadow: '0 8px 32px rgba(10,31,68,0.14)',
        border: '1px solid rgba(47,93,170,0.12)',
        display: 'flex', alignItems: 'center', gap: '8px',
        animation: 'chipFloat 5s ease-in-out infinite',
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }}/>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0A1F44', letterSpacing: '0.08em' }}>APPROVED</span>
      </div>

      <div style={{
        position: 'absolute', top: 278, left: -50,
        background: '#fff', borderRadius: '14px',
        padding: '12px 16px', boxShadow: '0 8px 32px rgba(10,31,68,0.12)',
        border: '1px solid rgba(47,93,170,0.1)',
        animation: 'chipFloat 6s ease-in-out 1s infinite',
      }}>
        <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#6B7FA3', letterSpacing: '0.1em', marginBottom: '3px' }}>CHECK-IN TIME</div>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.02em' }}>09:42 AM</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 60, left: -20,
        background: 'rgba(47,93,170,0.06)', borderRadius: '999px',
        padding: '9px 16px', border: '1px solid rgba(47,93,170,0.15)',
        display: 'flex', alignItems: 'center', gap: '6px',
        animation: 'chipFloat 7s ease-in-out 2s infinite',
      }}>
        <svg style={{ width: '12px', height: '12px', color: '#2F5DAA' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2F5DAA', letterSpacing: '0.08em' }}>LIVE SCAN</span>
      </div>

      <style>{`
        @keyframes cardFloat1 { 0%,100%{transform:rotate(-10deg) translateY(0px)} 50%{transform:rotate(-10deg) translateY(-14px)} }
        @keyframes cardFloat2 { 0%,100%{transform:rotate(7deg) translateY(0px)} 50%{transform:rotate(7deg) translateY(-10px)} }
        @keyframes cardFloat3 { 0%,100%{transform:rotate(-5deg) translateY(0px)} 50%{transform:rotate(-5deg) translateY(-16px)} }
        @keyframes chipFloat  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

const features = [
  {
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    title: 'Live Photo Capture', body: 'Eye blink liveness detection ensures only real visitors check in. No spoofing, no uploads.',
    accent: '#2F5DAA',
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'OTP Verification', body: 'Double-factor identity check via mobile OTP and email before registration completes.',
    accent: '#4A7FD4',
  },
  {
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
    title: 'Instant Host Alerts', body: 'Your host is notified in real time. Approvals, rejections and confirmations via email.',
    accent: '#0A1F44',
  },
  {
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
    title: 'Digital Gate Pass', body: 'QR-coded gate pass issued instantly on approval — scannable at any entry or exit point.',
    accent: '#1e3a7a',
  },
];

export default function LandingPage() {
  const heroRef   = useRef<HTMLDivElement>(null);
  const cardsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-line', { y: 36, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.05 });
      gsap.from('.hero-cards-wrap', { x: 48, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.2 });
      gsap.from('.feat-card', {
        scrollTrigger: { trigger: cardsRef.current, start: 'top 82%' },
        y: 32, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0A1F44', overflowX: 'hidden', fontFamily: 'inherit' }}>
      <GridBackground />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 52px', height: '68px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(47,93,170,0.08)',
      }}>
        <img src="/vts-logo.png" alt="VISITORPASS" style={{ height: '36px', width: 'auto', objectFit: 'contain' }}/>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/check-in">
            <button style={{
              padding: '9px 20px', borderRadius: '8px', border: '1.5px solid rgba(10,31,68,0.15)',
              background: 'transparent', color: '#0A1F44', fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>Check In</button>
          </Link>
          <Link href="/login">
            <button style={{
              padding: '10px 22px', borderRadius: '8px', border: 'none',
              background: '#0A1F44', color: '#fff', fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              Employee Portal
              <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 52px 60px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

          {/* Left */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hero-line" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '999px',
              background: 'rgba(47,93,170,0.07)', border: '1px solid rgba(47,93,170,0.18)',
              marginBottom: '32px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2F5DAA', boxShadow: '0 0 8px rgba(47,93,170,0.6)', animation: 'pulseBlue 2s infinite' }}/>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#2F5DAA' }}>Enterprise Visitor Management</span>
            </div>

            <h1 className="hero-line" style={{
              fontSize: 'clamp(3.4rem, 6.5vw, 5.8rem)',
              fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.04em',
              textTransform: 'uppercase', color: '#0A1F44', marginBottom: '28px',
            }}>
              VISITOR<br/>
              <span style={{
                background: 'linear-gradient(135deg, #2F5DAA 0%, #4A7FD4 60%, #6fa0e8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>PASS</span>
            </h1>

            <p className="hero-line" style={{
              fontSize: '1rem', color: '#6B7FA3', lineHeight: 1.75,
              maxWidth: '420px', marginBottom: '40px', fontWeight: 400,
            }}>
              Secure, intelligent visitor management for modern enterprises. Instant check-in, biometric verification, and real-time host notifications.
            </p>

            <div className="hero-line" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '52px' }}>
              <Link href="/check-in">
                <button style={{
                  padding: '15px 32px', borderRadius: '10px', border: 'none',
                  background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(10,31,68,0.25)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  New Visitor
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                </button>
              </Link>
              <Link href="/returning">
                <button style={{
                  padding: '15px 28px', borderRadius: '10px', cursor: 'pointer',
                  border: '1.5px solid rgba(10,31,68,0.18)', background: 'transparent',
                  color: '#0A1F44', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.2s',
                }}>Returning Visitor</button>
              </Link>
              <Link href="/appointment">
                <button style={{
                  padding: '15px 28px', borderRadius: '10px', cursor: 'pointer',
                  border: '1.5px solid rgba(47,93,170,0.2)', background: 'rgba(47,93,170,0.04)',
                  color: '#2F5DAA', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.2s',
                }}>Pre-Book</button>
              </Link>
            </div>

            <div className="hero-line" style={{ display: 'flex', gap: '40px' }}>
              {[
                { value: '99.9%', label: 'Uptime' },
                { value: '<3s',   label: 'Check-in' },
                { value: 'AES-256', label: 'Encryption' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '6px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating 3D cards */}
          <div className="hero-cards-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
            <FloatingCards />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={cardsRef} style={{ padding: '80px 52px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '12px' }}>Why VisitorPass</p>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0A1F44', lineHeight: 1.1 }}>Built for enterprise security</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {features.map((f, i) => (
              <div key={i} className="feat-card" style={{
                background: '#fff',
                border: '1px solid rgba(47,93,170,0.1)',
                borderRadius: '20px',
                padding: '36px',
                boxShadow: '0 2px 20px rgba(10,31,68,0.05)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'default',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 56px rgba(10,31,68,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,93,170,0.22)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 20px rgba(10,31,68,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,93,170,0.1)'; }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${f.accent}, ${f.accent}cc)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '22px', boxShadow: `0 6px 20px ${f.accent}30`,
                }}>
                  <svg style={{ width: '24px', height: '24px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={f.icon}/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A1F44', letterSpacing: '-0.02em', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6B7FA3', lineHeight: 1.75 }}>{f.body}</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${f.accent}00, ${f.accent}60, ${f.accent}00)`, opacity: 0.4 }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ANIMATION ── */}
      <ProcessAnimation />

      {/* ── CTA BAND ── */}
      <section style={{
        padding: '80px 52px',
        background: '#0A1F44',
        position: 'relative', overflow: 'hidden', zIndex: 1,
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>Get Started</p>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: '16px' }}>Ready to check in?</h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '36px', maxWidth: '380px', margin: '0 auto 36px', lineHeight: 1.7 }}>Walk up, scan, verify — and you're in. No paperwork, no waiting.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/check-in">
              <button style={{
                padding: '15px 36px', borderRadius: '10px', border: 'none',
                background: '#fff', color: '#0A1F44', fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>New Visitor Check-In</button>
            </Link>
            <Link href="/appointment">
              <button style={{
                padding: '15px 32px', borderRadius: '10px',
                border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent',
                color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>Book Appointment</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(10,31,68,0.06)', padding: '28px 52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px', background: '#fff', position: 'relative', zIndex: 1,
      }}>
        <img src="/vts-logo.png" alt="VISITORPASS" style={{ height: '28px', width: 'auto', objectFit: 'contain' }}/>
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          {['New Visitor', 'Returning', 'Appointment', 'Login'].map((t, i) => (
            <Link key={t} href={['/check-in', '/returning', '/appointment', '/login'][i]}
              style={{ fontSize: '0.68rem', fontWeight: 600, color: '#6B7FA3', textDecoration: 'none' }}>{t}</Link>
          ))}
        </div>
        <p style={{ fontSize: '0.6rem', color: '#A0AEC0' }}>© 2025 VisitorPass. All rights reserved.</p>
      </footer>

      <style>{`
        @media (max-width: 1100px) { .hero-cards-wrap { display: none !important; } }
        @media (max-width: 768px)  { section, nav, footer { padding-left: 20px !important; padding-right: 20px !important; } }
        @keyframes pulseBlue { 0%,100%{box-shadow:0 0 0 0 rgba(47,93,170,0.4)} 50%{box-shadow:0 0 0 6px rgba(47,93,170,0)} }
      `}</style>
    </div>
  );
}
