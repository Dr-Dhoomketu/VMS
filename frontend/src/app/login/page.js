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
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#000000] dot-bg">
      <div className="w-full max-w-md p-12 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50"></div>
        <div className="flex flex-col items-center mb-12">
          <ValueTechLogo className="h-[120px] w-auto mb-6" />
          <h2 className="hero-title text-2xl mb-2">VMS Portal</h2>
          <p className="caption text-[8px]">Authorized Security Personnel Only</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-lg mb-6 text-center animate-shake">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Email Identity</label>
            <input 
              required 
              type="email" 
              className="w-full bg-[#111] border-[#1f1f1f] text-white focus:border-white/30 transition-all rounded-xl py-3 px-4" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@vms.com" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Secure Password</label>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                className="w-full bg-[#111] border-[#1f1f1f] text-white focus:border-white/30 transition-all rounded-xl py-3 px-4 pr-12" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
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
          <button type="submit" className="w-full btn-primary py-4 rounded-xl text-sm">
            AUTHENTICATE →
          </button>
        </form>
      </div>
    </main>
  );
}
