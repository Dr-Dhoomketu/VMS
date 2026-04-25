'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import ValueTechLogo from '@/components/ValueTechLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8 border border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="flex flex-col items-center mb-10">
          <ValueTechLogo className="w-24 h-24" />
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Email Address</label>
            <input 
              required 
              type="email" 
              className="w-full" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@vms.com" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">Password</label>
            <input 
              required 
              type="password" 
              className="w-full" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95">
            Login
          </button>
        </form>
      </GlassCard>
    </main>
  );
}
