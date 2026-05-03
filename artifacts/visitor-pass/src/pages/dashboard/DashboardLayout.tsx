import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FC' }}>
      <Sidebar/>
      <main style={{ flex: 1, minHeight: '100vh', position: 'relative', overflowY: 'auto' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(10,31,68,0.06)',
          boxShadow: '0 1px 16px rgba(10,31,68,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2F5DAA', animation: 'pulseBlue 2s ease-in-out infinite' }}/>
            <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.35em', fontWeight: 800, color: '#6B7FA3' }}>Live System</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0A1F44', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
              <div style={{ fontSize: '0.55rem', color: '#6B7FA3', fontWeight: 600, letterSpacing: '0.1em' }}>{dateStr}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }}/>
              <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 800, color: '#6B7FA3' }}>Connected</span>
            </div>
          </div>
        </header>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
