import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import socket, { connectSocket } from '@/utils/socket';
import { API_URL } from '@/lib/api';

const statCards = [
  { key:'total',      label:'Total Visits',  sub:'All Time',    color:'#2F5DAA', bg:'rgba(47,93,170,0.08)',  bar:'#2F5DAA' },
  { key:'today',      label:'Today',         sub:'Live Traffic', color:'#0A1F44', bg:'rgba(10,31,68,0.06)',   bar:'#0A1F44' },
  { key:'checkedIn',  label:'On Premise',    sub:'Active Now',  color:'#16a34a', bg:'rgba(22,163,74,0.08)',  bar:'#16a34a' },
  { key:'checkedOut', label:'Checked Out',   sub:'Cleared',     color:'#6B7FA3', bg:'rgba(107,127,163,0.08)',bar:'#6B7FA3' },
  { key:'preVisitor', label:'Scheduled',     sub:'Pre-Booked',  color:'#7C3AED', bg:'rgba(124,58,237,0.08)', bar:'#7C3AED' },
];

interface Stats { total:number; today:number; checkedIn:number; checkedOut:number; preVisitor:number; }
interface Visit { _id:string; purpose:string; createdAt:string; status:string; visitor?:{name:string;email?:string;imageUrl?:string}; meetWith?:{name:string}; }

export default function DashboardHome() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<Stats>({ total:0, today:0, checkedIn:0, checkedOut:0, preVisitor:0 });
  const [visitors, setVisitors] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name:string; role:string }|null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const u = JSON.parse(userStr);
    setUser(u);
    fetchStats(); fetchVisitors();
    connectSocket(u);
    socket.on('visit_updated', () => { fetchStats(); fetchVisitors(); });
    socket.on('new_visit', () => { fetchStats(); fetchVisitors(); });
    return () => { socket.off('visit_updated'); socket.off('new_visit'); };
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/visits/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setStats(data);
    } catch {}
  };

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/visits?status=Approved`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setVisitors(data);
    } catch {} finally { setLoading(false); }
  };

  const handleCheckout = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${id}/checkout`, { method:'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { fetchStats(); fetchVisitors(); }
    } catch {}
  };

  return (
    <div className="fade-up">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
        <div>
          <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '6px' }}>Operations Center</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0A1F44' }}>System Overview</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7FA3', marginTop: '4px' }}>Real-time monitoring of facility access and visitor flow.</p>
        </div>
        {user && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 800, color: '#6B7FA3', marginBottom: '4px' }}>Signed in as</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A1F44' }}>{user.name}</p>
            <p style={{ fontSize: '0.6rem', color: '#2F5DAA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{user.role}</p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {statCards.map(({ key, label, sub, color, bg, bar }) => (
          <div key={key} style={{
            background: '#ffffff', borderRadius: '16px',
            border: '1px solid rgba(10,31,68,0.06)',
            boxShadow: '0 2px 12px rgba(10,31,68,0.04)',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ height: '3px', background: `linear-gradient(90deg, ${bar}, transparent)` }}/>
            <div style={{ padding: '20px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}/>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {(stats as Record<string,number>)[key] ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44', marginTop: '6px' }}>{label}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#6B7FA3', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '3px' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active visitors table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A1F44', letterSpacing: '-0.02em' }}>Active Visitors</h2>
          <p style={{ fontSize: '0.72rem', color: '#6B7FA3', marginTop: '3px' }}>Currently on premises</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }}/>
          <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#6B7FA3', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Live</span>
        </div>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Meeting With</th>
              <th>Purpose</th>
              <th>Check-In</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#6B7FA3', fontSize: '0.875rem' }}>Loading...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#6B7FA3', fontSize: '0.875rem' }}>No active visitors on premises.</td></tr>
            ) : visitors.map(v => (
              <tr key={v._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(47,93,170,0.08)', flexShrink: 0 }}>
                      {v.visitor?.imageUrl
                        ? <img src={v.visitor.imageUrl.startsWith('data:') ? v.visitor.imageUrl : `${API_URL}${v.visitor.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2F5DAA', fontSize: '0.75rem', fontWeight: 800 }}>{v.visitor?.name?.charAt(0)}</div>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A1F44' }}>{v.visitor?.name}</p>
                      <p style={{ fontSize: '0.7rem', color: '#6B7FA3' }}>{v.visitor?.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.875rem', color: '#0A1F44', fontWeight: 500 }}>{v.meetWith?.name || '—'}</td>
                <td style={{ fontSize: '0.875rem', color: '#6B7FA3' }}>{v.purpose}</td>
                <td style={{ fontSize: '0.78rem', color: '#6B7FA3' }}>{new Date(v.createdAt).toLocaleTimeString()}</td>
                <td><span className="badge badge-approved">Active</span></td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleCheckout(v._id)}
                    style={{
                      fontSize: '0.72rem', fontWeight: 700, color: '#dc2626',
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                      borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
                  >
                    Check Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
