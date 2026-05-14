import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { API_URL } from '@/lib/api';

export default function SetupPasswordPage() {
  const [search] = typeof window !== 'undefined' ? [window.location.search] : [''];
  const token = new URLSearchParams(search).get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!token) setError('Invalid or missing invite link. Please ask your admin to resend the invite.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) { setDone(true); }
      else setError(data.message || 'Failed to set password. The link may have expired.');
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F7FC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/vts-logo.png" alt="VTS Infosoft" style={{ height: '38px', objectFit: 'contain', marginBottom: '28px', display: 'block', margin: '0 auto 28px' }}/>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(47,93,170,0.08)', border: '1px solid rgba(47,93,170,0.15)', marginBottom: '16px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2F5DAA' }}/>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F5DAA' }}>Employee Onboarding</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.03em', marginBottom: '8px' }}>Set Up Your Account</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7FA3', lineHeight: 1.6 }}>Create a secure password to access your employee dashboard.</p>
        </div>

        {done ? (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '40px 36px', textAlign: 'center', boxShadow: '0 4px 32px rgba(10,31,68,0.08)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(22,163,74,0.08)', border: '2px solid rgba(22,163,74,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg style={{ width: '32px', height: '32px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A1F44', marginBottom: '10px' }}>Account Activated!</h2>
            <p style={{ fontSize: '0.82rem', color: '#6B7FA3', lineHeight: 1.7, marginBottom: '28px' }}>Your password has been set. You can now sign in to access your employee dashboard.</p>
            <button onClick={() => navigate('/login')} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Go to Sign In →
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 32px rgba(10,31,68,0.08)', border: '1px solid rgba(47,93,170,0.08)' }}>
            {error && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '0.8rem' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '8px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    required type={showPw ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    style={{ width: '100%', padding: '13px 44px 13px 16px', borderRadius: '10px', border: '1.5px solid rgba(47,93,170,0.15)', outline: 'none', fontSize: '0.875rem', color: '#0A1F44', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#2F5DAA'; e.target.style.boxShadow = '0 0 0 3px rgba(47,93,170,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(47,93,170,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', padding: 0 }}>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPw
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '8px' }}>Confirm Password</label>
                <input
                  required type="password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid rgba(47,93,170,0.15)', outline: 'none', fontSize: '0.875rem', color: '#0A1F44', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => { e.target.style.borderColor = '#2F5DAA'; e.target.style.boxShadow = '0 0 0 3px rgba(47,93,170,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(47,93,170,0.15)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button type="submit" disabled={loading || !token} style={{
                width: '100%', padding: '15px', borderRadius: '10px', border: 'none',
                background: loading || !token ? '#6B7FA3' : '#0A1F44',
                color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: loading || !token ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                {loading ? (
                  <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>Activating…</>
                ) : 'Activate Account →'}
              </button>
            </form>
          </div>
        )}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/login" style={{ fontSize: '0.7rem', color: '#6B7FA3', textDecoration: 'none', fontWeight: 600 }}>← Already have an account? Sign in</Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
