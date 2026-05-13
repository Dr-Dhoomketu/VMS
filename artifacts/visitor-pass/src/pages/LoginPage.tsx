import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { API_URL } from '@/lib/api';

function FloatingCard({ icon, label, rotate, top, left, right, bottom, delay, g1, g2, iconG }: {
  icon: string; label: string; rotate: number;
  top?: string; left?: string; right?: string; bottom?: string;
  delay: number; g1: string; g2: string; iconG: string;
}) {
  return (
    <div style={{
      position: 'absolute',
      top, left, right, bottom,
      width: '190px', height: '224px',
      borderRadius: '26px',
      background: `linear-gradient(145deg, ${g1}, ${g2})`,
      boxShadow: `0 32px 72px rgba(10,31,68,0.4), 0 10px 24px rgba(10,31,68,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
      border: '1px solid rgba(255,255,255,0.09)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '14px',
      transform: `rotate(${rotate}deg)`,
      animation: `cardF ${5 + delay}s ease-in-out ${delay}s infinite`,
    }}>
      <div style={{
        width: '68px', height: '68px', borderRadius: '20px',
        background: iconG,
        boxShadow: '0 8px 24px rgba(47,93,170,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg style={{ width: '34px', height: '34px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d={icon}/>
        </svg>
      </div>
      <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        if (data.role === 'Admin') navigate('/dashboard');
        else navigate('/approvals');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <div className="login-left" style={{
        width: '50%', background: '#0A1F44', position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center',
        padding: '72px 64px', flexShrink: 0, overflow: 'hidden',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}/>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,127,212,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,93,170,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        {/* Floating 3D cards */}
        <div style={{ position: 'absolute', right: '-20px', top: 0, bottom: 0, width: '280px' }}>
          <FloatingCard
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
            label="VISITOR" g1="#152c6b" g2="#2a4d9e"
            iconG="linear-gradient(135deg,#2F5DAA,#4A7FD4)"
            rotate={-8} top="8%" right="40px" delay={0}
          />
          <FloatingCard
            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            label="SECURE" g1="#0d2550" g2="#1e3a7a"
            iconG="linear-gradient(135deg,#4A7FD4,#6fa0e8)"
            rotate={6} top="38%" right="-10px" delay={1.4}
          />
          <FloatingCard
            icon="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            label="ACCESS" g1="#102040" g2="#1a3266"
            iconG="linear-gradient(135deg,#1e4080,#2F5DAA)"
            rotate={-4} bottom="10%" right="50px" delay={2.5}
          />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '380px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4A7FD4', boxShadow: '0 0 8px rgba(74,127,212,0.8)' }}/>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Enterprise Access Portal</span>
          </div>

          <h2 style={{
            fontSize: '3.8rem', fontWeight: 900, color: '#fff',
            lineHeight: 0.92, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '24px',
          }}>
            VALUE MANAGEMENT<br/>
            <span style={{
              background: 'linear-gradient(135deg, #4A7FD4, #7ab0f0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>SYSTEM</span>
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '48px' }}>
            Secure, intelligent visitor management for modern enterprises.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', label: 'Biometric Liveness Check' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Real-Time Approvals' },
              { icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', label: 'Digital Gate Pass' },
              { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Full Audit Trail' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 18px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <svg style={{ width: '14px', height: '14px', color: '#4A7FD4', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
                </svg>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes cardF { 0%,100%{transform:rotate(var(--r,0deg)) translateY(0px)} 50%{transform:rotate(var(--r,0deg)) translateY(-12px)} }
        `}</style>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', position: 'relative', background: '#ffffff',
      }}>
        {/* Subtle grid on right too */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(47,93,170,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(47,93,170,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}/>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,127,212,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
          {/* Logo */}
          <Link href="/">
            <img src="/vts-logo.png" alt="VISITORPASS" style={{ height: '38px', width: 'auto', objectFit: 'contain', marginBottom: '44px', display: 'block', cursor: 'pointer' }}/>
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '10px' }}>Employee Portal</div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '8px' }}>Welcome back</h1>
            <p style={{ fontSize: '0.875rem', color: '#6B7FA3', lineHeight: 1.6 }}>Sign in to access your management dashboard</p>
          </div>

          {error && (
            <div style={{
              marginBottom: '24px', padding: '13px 16px',
              background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', color: '#dc2626', fontSize: '0.8rem',
            }}>{error}</div>
          )}

          {/* Form card */}
          <div style={{
            background: '#fff', borderRadius: '20px',
            border: '1px solid rgba(47,93,170,0.1)',
            boxShadow: '0 4px 32px rgba(10,31,68,0.07), 0 1px 4px rgba(10,31,68,0.04)',
            padding: '36px',
          }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  required type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    width: '100%', padding: '13px 16px', borderRadius: '10px',
                    border: '1.5px solid rgba(47,93,170,0.15)', outline: 'none',
                    fontSize: '0.875rem', color: '#0A1F44', background: '#fff',
                    fontFamily: 'inherit', transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2F5DAA'; e.target.style.boxShadow = '0 0 0 3px rgba(47,93,170,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(47,93,170,0.15)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    required type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '13px 48px 13px 16px', borderRadius: '10px',
                      border: '1.5px solid rgba(47,93,170,0.15)', outline: 'none',
                      fontSize: '0.875rem', color: '#0A1F44', background: '#fff',
                      fontFamily: 'inherit', transition: 'all 0.2s', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#2F5DAA'; e.target.style.boxShadow = '0 0 0 3px rgba(47,93,170,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(47,93,170,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', padding: 0,
                  }}>
                    {showPassword ? (
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    ) : (
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px', borderRadius: '10px', border: 'none',
                background: loading ? '#6B7FA3' : '#0A1F44',
                color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px', transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(10,31,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                {loading ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                    Signing in…
                  </>
                ) : 'Sign In →'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '0.7rem', color: '#6B7FA3', textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { .login-left { display: none !important; } }
      `}</style>
    </main>
  );
}
