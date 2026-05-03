import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { API_URL } from '@/lib/api';
import GeoBackground from '@/components/GeoBackground';

function QRMiniSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 200, height: 200, opacity: 0.75 }}>
      <path d="M 10 30 L 10 10 L 30 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M 90 10 L 110 10 L 110 30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M 10 90 L 10 110 L 30 110" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M 110 90 L 110 110 L 90 110" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <rect x="18" y="18" width="30" height="30" stroke="white" strokeWidth="1.5" fill="none"/>
      <rect x="24" y="24" width="18" height="18" fill="rgba(255,255,255,0.2)"/>
      <rect x="30" y="30" width="6" height="6" fill="white"/>
      <rect x="72" y="18" width="30" height="30" stroke="white" strokeWidth="1.5" fill="none"/>
      <rect x="78" y="24" width="18" height="18" fill="rgba(255,255,255,0.2)"/>
      <rect x="84" y="30" width="6" height="6" fill="white"/>
      <rect x="18" y="72" width="30" height="30" stroke="white" strokeWidth="1.5" fill="none"/>
      <rect x="24" y="78" width="18" height="18" fill="rgba(255,255,255,0.2)"/>
      <rect x="30" y="84" width="6" height="6" fill="white"/>
      {[72,82,92].map((x,i)=>[72,82,92].map((y,j)=>
        (i+j)%2===0 && <rect key={`${i}${j}`} x={x} y={y} width="6" height="6" fill="rgba(255,255,255,0.5)"/>
      ))}
      <rect x="18" y="66" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="30" y="66" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="42" y="66" width="6" height="6" fill="rgba(255,255,255,0.6)"/>
      <rect x="60" y="18" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="60" y="30" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="60" y="54" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="60" y="66" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="18" y="54" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="42" y="54" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="54" y="42" width="6" height="6" fill="rgba(255,255,255,0.4)"/>
      <line x1="10" y1="60" x2="110" y2="60" stroke="rgba(47,93,170,0.9)" strokeWidth="1.5">
        <animate attributeName="y1" values="18;102;18" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="y2" values="18;102;18" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="2.5s" repeatCount="indefinite"/>
      </line>
    </svg>
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
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', display: 'flex' }}>
      <div style={{
        display: 'none',
        width: '48%',
        background: '#0A1F44',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px',
        flexShrink: 0,
      }} className="login-panel-left">
        <GeoBackground dark />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>
            Enterprise Access Portal
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <QRMiniSVG />
          </div>

          <h2 style={{ fontSize: '4.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '16px' }}>
            VISITOR<br/>PASS
          </h2>

          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '20px auto' }}/>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.7, maxWidth: '280px', margin: '0 auto 40px' }}>
            Secure, intelligent visitor management for modern enterprises.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            {['Biometric Verification', 'Real-Time Approvals', 'Digital Gate Pass', 'Audit Trail'].map((f) => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px', padding: '8px 20px',
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4A7FD4' }}/>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', position: 'relative' }}>
        <GeoBackground />

        <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
          <div style={{ marginBottom: '40px' }}>
            <Link href="/">
              <img src="/vts-logo.png" alt="VISITORPASS" style={{ height: '40px', width: 'auto', objectFit: 'contain', marginBottom: '28px', display: 'block' }}/>
            </Link>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '10px' }}>
              Employee Portal
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6B7FA3' }}>Sign in to access your management dashboard</p>
          </div>

          {error && (
            <div style={{
              marginBottom: '24px', padding: '14px 18px',
              background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', color: '#dc2626', fontSize: '0.8rem',
            }}>{error}</div>
          )}

          <div className="lux-card" style={{ padding: '36px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="vp-label">Email Address</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/>
              </div>
              <div>
                <label className="vp-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: '48px' }}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7FA3', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? (
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-vp-primary" style={{ width: '100%', padding: '15px', justifyContent: 'center', fontSize: '0.7rem', marginTop: '4px' }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '0.7rem', color: '#6B7FA3', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.05em' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .login-panel-left { display: flex !important; }
        }
      `}</style>
    </main>
  );
}
