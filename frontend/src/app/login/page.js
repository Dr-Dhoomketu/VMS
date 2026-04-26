'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import ValueTechLogo from '@/components/ValueTechLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
    } catch (err) {
      setError('Connection error. Check your internet.');
    }
  };

  return (
    <main className="fixed inset-0 flex items-center justify-center p-4 bg-[#050505] theme-coffee:bg-[#f5f5f7] dot-bg overflow-hidden">

      {/* Ambient orbs — dark mode only */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden theme-coffee:hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #aaaaaa 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />
      </div>

      {/* Light mode subtle gradient */}
      <div className="absolute inset-0 pointer-events-none hidden theme-coffee:block"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,0,0,0.04) 0%, transparent 70%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="
          p-10 rounded-[2.5rem] flex flex-col items-center
          border border-white/[0.07] bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)]
          theme-coffee:border-black/[0.06] theme-coffee:bg-white theme-coffee:backdrop-blur-none theme-coffee:shadow-[0_8px_40px_rgba(0,0,0,0.10)]
        ">

          {/* Logo + title */}
          <div className="mb-10 flex flex-col items-center text-center">
            <ValueTechLogo className="h-[100px] w-auto mb-5" />
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-2 text-white theme-coffee:text-[#1d1d1f]">
              VMS Portal
            </h1>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black text-gray-600 theme-coffee:text-[#86868b]">
              Secure Administrative Access
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-8 bg-gradient-to-r from-transparent via-white/10 to-transparent theme-coffee:via-black/10" />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 theme-coffee:text-red-500 text-xs py-3 px-4 rounded-xl mb-6 text-center w-full">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 w-full">
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2 font-black text-gray-500 theme-coffee:text-[#86868b]">
                Email Identity
              </label>
              <input
                required type="email" className="w-full"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@vms.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2 font-black text-gray-500 theme-coffee:text-[#86868b]">
                Secure Password
              </label>
              <div className="relative">
                <input
                  required type={showPassword ? 'text' : 'password'} className="w-full pr-12"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white theme-coffee:hover:text-[#1d1d1f] transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full btn-primary py-4 rounded-2xl text-[11px] tracking-[0.4em]">
                Authenticate →
              </button>
            </div>
          </form>

        </div>

        {/* Bottom hint */}
        <p className="text-center text-[9px] uppercase tracking-widest mt-6 font-bold text-gray-700 theme-coffee:text-[#86868b]">
          Visitor Management System · Secure Access
        </p>
      </div>
    </main>
  );
}

