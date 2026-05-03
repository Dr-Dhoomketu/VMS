import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const PHASE_DURATION = 2800;
const TOTAL_PHASES = 4;

const phases = [
  {
    id: 'invite',
    label: 'Receive Invite',
    desc: 'An email or SMS with a secure QR code is sent to your registered number before your visit.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    id: 'qr',
    label: 'Show QR Code',
    desc: 'Open the link on your phone. Your unique QR pass is displayed — no app download needed.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
      </svg>
    ),
  },
  {
    id: 'scan',
    label: 'Scan & Verify',
    desc: 'Hold your phone to the kiosk scanner. Identity is verified instantly with OTP confirmation.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
  },
  {
    id: 'pass',
    label: 'Gate Pass Issued',
    desc: 'Access granted. Your digital gate pass is issued and your host is notified in real time.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
      </svg>
    ),
  },
];

function PhoneInviteScreen() {
  return (
    <motion.div
      key="invite-screen"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45 }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 14px', gap: '10px' }}
    >
      <div style={{ fontSize: '0.45rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center' }}>
        Messages
      </div>
      <div style={{ background: '#F0F4FF', borderRadius: '12px', padding: '12px', border: '1px solid rgba(47,93,170,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#0A1F44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 800 }}>VP</span>
          </div>
          <div>
            <div style={{ fontSize: '0.5rem', fontWeight: 800, color: '#0A1F44' }}>VISITORPASS</div>
            <div style={{ fontSize: '0.42rem', color: '#9CA3AF' }}>Just now</div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
            style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#2F5DAA' }}
          />
        </div>
        <div style={{ fontSize: '0.52rem', color: '#374151', lineHeight: 1.5 }}>
          Your visitor pass for <strong>VTS Infosoft</strong> is ready. Tap to view your QR code.
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '10px', padding: '7px 12px', borderRadius: '8px',
            background: '#0A1F44', textAlign: 'center',
            fontSize: '0.48rem', color: '#fff', fontWeight: 700, letterSpacing: '0.08em',
          }}
        >
          View Pass →
        </motion.div>
      </div>
      <div style={{ background: '#F9FAFB', borderRadius: '10px', padding: '10px', opacity: 0.5, border: '1px solid #E5E7EB' }}>
        <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', width: '70%', marginBottom: '5px' }}/>
        <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', width: '50%' }}/>
      </div>
    </motion.div>
  );
}

function PhoneQRScreen() {
  return (
    <motion.div
      key="qr-screen"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45 }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px', gap: '10px' }}
    >
      <div style={{ fontSize: '0.5rem', fontWeight: 800, color: '#0A1F44', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Gate Pass</div>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.3, delay: 0.15 }}
        style={{
          width: '90px', height: '90px',
          background: '#fff',
          border: '2px solid rgba(47,93,170,0.2)',
          borderRadius: '12px',
          padding: '8px',
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2.5px',
        }}
      >
        {[...Array(25)].map((_, i) => {
          const filled = [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,12,18].includes(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.025 }}
              style={{
                borderRadius: '1.5px',
                background: filled ? '#0A1F44' : 'transparent',
              }}
            />
          );
        })}
      </motion.div>
      <div style={{ fontSize: '0.42rem', color: '#6B7280', textAlign: 'center', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 700, color: '#0A1F44', fontSize: '0.52rem' }}>Alex Johnson</div>
        <div>VTS Infosoft HQ</div>
        <div>Valid: 09:00 AM – 06:00 PM</div>
      </div>
    </motion.div>
  );
}

function PhoneScanScreen() {
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVerified(true), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      key="scan-screen"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45 }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px', gap: '12px' }}
    >
      <div style={{
        width: '90px', height: '90px', borderRadius: '12px',
        position: 'relative', overflow: 'hidden',
        border: `2px solid ${verified ? '#22C55E' : '#2F5DAA'}`,
        transition: 'border-color 0.4s',
        background: '#F0F9FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2.5px', padding: '8px', width: '100%', height: '100%' }}>
          {[...Array(25)].map((_, i) => {
            const filled = [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,12,18].includes(i);
            return <div key={i} style={{ borderRadius: '1.5px', background: filled ? '#0A1F44' : 'transparent' }} />;
          })}
        </div>
        {!verified && (
          <motion.div
            style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #2F5DAA, transparent)', boxShadow: '0 0 8px #2F5DAA' }}
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {verified && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(34,197,94,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </motion.div>
        )}
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{ fontSize: '0.5rem', fontWeight: 700, color: verified ? '#22C55E' : '#2F5DAA', letterSpacing: '0.1em', textTransform: 'uppercase' }}
      >
        {verified ? '✓ Identity Verified' : 'Scanning…'}
      </motion.div>
    </motion.div>
  );
}

function PhonePassScreen() {
  return (
    <motion.div
      key="pass-screen"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45 }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px', gap: '10px' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(34,197,94,0.4)' }}
      >
        <svg width="24" height="24" fill="none" stroke="#fff" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
        </svg>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          width: '100%', background: 'linear-gradient(135deg, #0A1F44, #1e3a7a)',
          borderRadius: '14px', padding: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(10,31,68,0.3)',
        }}
      >
        <div style={{ fontSize: '0.38rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Gate Pass</div>
        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>Alex Johnson</div>
        <div style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.55)', marginBottom: '8px' }}>Visiting: Engineering Dept.</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <span style={{ fontSize: '0.42rem', fontWeight: 800, color: '#4ADE80', letterSpacing: '0.1em' }}>APPROVED</span>
          </div>
          <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.35)' }}>09:42 AM</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ fontSize: '0.44rem', color: '#6B7280', textAlign: 'center' }}
      >
        Host notified · Access granted
      </motion.div>
    </motion.div>
  );
}

const screenComponents = [PhoneInviteScreen, PhoneQRScreen, PhoneScanScreen, PhonePassScreen];

export default function ProcessAnimation() {
  const [phase, setPhase] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % TOTAL_PHASES);
    }, PHASE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const ScreenComponent = screenComponents[phase];

  return (
    <section ref={sectionRef} style={{ padding: '0 52px 100px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '64px', flexWrap: 'wrap',
        }}>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', flexShrink: 0 }}
          >
            {/* Glow */}
            <div style={{
              position: 'absolute', inset: '-24px',
              borderRadius: '60px',
              background: phase === 2 ? 'radial-gradient(circle, rgba(34,197,94,0.12), transparent 70%)' : 'radial-gradient(circle, rgba(47,93,170,0.12), transparent 70%)',
              transition: 'background 0.6s',
              pointerEvents: 'none',
            }}/>

            {/* Phone shell */}
            <div style={{
              width: '200px', height: '360px',
              background: 'linear-gradient(160deg, #1a1a2e 0%, #0f0f1a 100%)',
              borderRadius: '36px',
              border: '6px solid #2a2a3e',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Notch */}
              <div style={{
                position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                width: '60px', height: '10px', background: '#1a1a2e', borderRadius: '6px',
                zIndex: 10,
              }}/>

              {/* Status bar */}
              <div style={{
                padding: '20px 14px 6px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '0.4rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>9:42</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '6px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '1.5px', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: '1px', width: '70%', background: 'rgba(255,255,255,0.4)', borderRadius: '1px' }}/>
                  </div>
                </div>
              </div>

              {/* Screen content */}
              <div style={{
                flex: 1, background: '#F8FAFF',
                margin: '0 6px 6px', borderRadius: '24px',
                overflow: 'hidden', position: 'relative',
              }}>
                <AnimatePresence mode="wait">
                  <ScreenComponent key={phase} />
                </AnimatePresence>
              </div>
            </div>

            {/* Step dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {phases.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === phase ? 24 : 8, background: i === phase ? '#0A1F44' : 'rgba(10,31,68,0.2)' }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '8px', borderRadius: '4px' }}
                />
              ))}
            </div>
          </motion.div>

          {/* Steps list */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ flex: 1, minWidth: '280px', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {phases.map((p, i) => {
              const active = i === phase;
              return (
                <motion.div
                  key={i}
                  onClick={() => setPhase(i)}
                  animate={{
                    background: active ? '#fff' : 'transparent',
                    borderColor: active ? 'rgba(47,93,170,0.25)' : 'rgba(47,93,170,0.08)',
                    boxShadow: active ? '0 8px 32px rgba(10,31,68,0.10)' : 'none',
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    border: '1px solid',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: '16px',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Progress bar on active */}
                  {active && (
                    <motion.div
                      key={`bar-${phase}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: PHASE_DURATION / 1000, ease: 'linear' }}
                      style={{
                        position: 'absolute', bottom: 0, left: 0, height: '2px',
                        background: 'linear-gradient(90deg, #2F5DAA, #4A7FD4)',
                        borderRadius: '0 0 0 16px',
                      }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    animate={{
                      background: active ? 'linear-gradient(135deg, #0A1F44, #2F5DAA)' : 'rgba(47,93,170,0.08)',
                      color: active ? '#fff' : '#6B7FA3',
                    }}
                    style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: active ? '#fff' : '#6B7FA3' }}>{p.icon}</span>
                  </motion.div>

                  <div>
                    <div style={{
                      fontSize: '0.88rem', fontWeight: 800, letterSpacing: '-0.02em',
                      color: active ? '#0A1F44' : '#9CA3AF', marginBottom: '5px',
                      transition: 'color 0.3s',
                    }}>
                      {String(i + 1).padStart(2, '0')}  {p.label}
                    </div>
                    <div style={{
                      fontSize: '0.78rem', color: active ? '#6B7FA3' : '#C4C9D4',
                      lineHeight: 1.65, transition: 'color 0.3s',
                    }}>
                      {p.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
