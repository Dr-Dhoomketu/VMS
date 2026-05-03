'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
        if (data.role === 'Admin') router.push('/dashboard');
        else router.push('/approvals');
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
    <main className="min-h-screen bg-white flex">

      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1F44] relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Greek skyline background */}
        <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 800 300" fill="none" className="w-full">
            <line x1="0" y1="280" x2="800" y2="280" stroke="#2F5DAA" strokeWidth="1.5"/>
            <rect x="280" y="80" width="240" height="200" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
            <rect x="265" y="70" width="270" height="12" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
            <polyline points="265,70 400,30 535,70" stroke="#2F5DAA" strokeWidth="1.2" fill="none"/>
            {[295,325,355,385,415,445,475,505].map((x,i) => (
              <rect key={i} x={x} y="84" width="10" height="194" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
            ))}
            <rect x="60" y="140" width="140" height="140" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
            <polyline points="50,140 130,100 210,140" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
            {[72,96,120,144,168].map((x,i) => (
              <rect key={i} x={x} y="144" width="8" height="134" stroke="#2F5DAA" strokeWidth="0.7" fill="none"/>
            ))}
            <rect x="600" y="150" width="140" height="130" stroke="#2F5DAA" strokeWidth="0.8" fill="none"/>
            <polyline points="590,150 670,110 750,150" stroke="#2F5DAA" strokeWidth="1" fill="none"/>
            {[612,636,660,684,708].map((x,i) => (
              <rect key={i} x={x} y="154" width="8" height="124" stroke="#2F5DAA" strokeWidth="0.7" fill="none"/>
            ))}
          </svg>
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '28px 28px' }}/>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40 mb-6">
            Enterprise Access Portal
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-4">
            VISITOR<br/>PASS
          </h2>
          <div className="w-12 h-px bg-white/20 mx-auto my-6"/>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Secure, intelligent visitor management for modern enterprises.
          </p>

          {/* Decorative columns */}
          <div className="flex justify-center gap-8 mt-16 opacity-20">
            {[0,1,2].map(i => (
              <svg key={i} width="24" height="120" viewBox="0 0 24 120" fill="none">
                <rect x="7" y="0" width="10" height="100" stroke="white" strokeWidth="1"/>
                <rect x="3" y="98" width="18" height="6" stroke="white" strokeWidth="1"/>
                <rect x="0" y="104" width="24" height="8" stroke="white" strokeWidth="1"/>
                <ellipse cx="12" cy="3" rx="6" ry="2" stroke="white" strokeWidth="1"/>
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-10">
            <Link href="/">
              <Image src="/vts-logo.png" alt="VISITORPASS" width={140} height={40}
                className="h-10 w-auto object-contain mb-6" style={{ width: 'auto' }} priority/>
            </Link>
            <h1 className="text-3xl font-black text-[#0A1F44] tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm text-[#6B7FA3]">Sign in to your employee portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="vp-label">Email Address</label>
              <input
                required type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="vp-label">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7FA3] hover:text-[#0A1F44] transition-colors">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-vp-primary w-full py-4 text-sm justify-center mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
            <Link href="/" className="text-xs text-[#6B7FA3] hover:text-[#0A1F44] transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
