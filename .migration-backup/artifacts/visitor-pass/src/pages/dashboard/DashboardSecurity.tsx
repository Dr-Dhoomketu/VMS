import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import socket, { connectSocket } from '@/utils/socket';
import { API_URL } from '@/lib/api';

interface Visit {
  _id: string; purpose: string; status: string; createdAt: string; updatedAt: string;
  visitor?: { name: string; phone: string; imageUrl?: string };
  meetWith?: { name: string };
  meetWithDept?: { name: string };
  qrToken?: string;
}

const statusColor: Record<string, string> = {
  Approved: '#16a34a', Pending: '#d97706', CheckedIn: '#2F5DAA', CheckedOut: '#64748b', Rejected: '#dc2626',
};
const statusBg: Record<string, string> = {
  Approved: 'rgba(22,163,74,0.08)', Pending: 'rgba(217,119,6,0.08)', CheckedIn: 'rgba(47,93,170,0.08)', CheckedOut: 'rgba(100,116,139,0.08)', Rejected: 'rgba(220,38,38,0.08)',
};

export default function DashboardSecurity() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState({ onPremise: 0, approvedWaiting: 0, todayCheckins: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const u = JSON.parse(userStr);
    setUser(u);
    fetchData();
    connectSocket(u);
    socket.on('visit_updated', fetchData);
    socket.on('new_visit', fetchData);
    return () => { socket.off('visit_updated', fetchData); socket.off('new_visit', fetchData); };
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [allRes, checkedInRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/visits?limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/v1/visits?status=CheckedIn`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const allData = allRes.ok ? await allRes.json() : [];
      const checkedInData = checkedInRes.ok ? await checkedInRes.json() : [];

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayCheckins = allData.filter((v: Visit) => v.status === 'CheckedIn' && new Date(v.updatedAt) >= today).length;
      const pending = allData.filter((v: Visit) => v.status === 'Pending').length;
      const approvedWaiting = allData.filter((v: Visit) => v.status === 'Approved').length;

      setStats({ onPremise: checkedInData.length, approvedWaiting, todayCheckins, pending });
      setVisits(allData.slice(0, 20));
    } catch {} finally { setLoading(false); }
  };

  const statCards = [
    { label: 'On Premises', value: stats.onPremise, sub: 'Currently Inside', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', bar: '#16a34a' },
    { label: 'Awaiting Entry', value: stats.approvedWaiting, sub: 'Approved, Not Yet In', color: '#2F5DAA', bg: 'rgba(47,93,170,0.08)', bar: '#2F5DAA' },
    { label: "Today's Check-ins", value: stats.todayCheckins, sub: 'Entered Today', color: '#0A1F44', bg: 'rgba(10,31,68,0.06)', bar: '#0A1F44' },
    { label: 'Pending Requests', value: stats.pending, sub: 'Awaiting Approval', color: '#d97706', bg: 'rgba(217,119,6,0.08)', bar: '#d97706' },
  ];

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
        <div>
          <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '6px' }}>Gate Control</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0A1F44' }}>Security Dashboard</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7FA3', marginTop: '4px' }}>Real-time gate monitoring and visitor access control.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 800, color: '#6B7FA3', marginBottom: '3px' }}>Signed in as</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A1F44' }}>{user.name}</p>
              <p style={{ fontSize: '0.6rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Security Officer</p>
            </div>
          )}
          <button onClick={() => navigate('/dashboard/scan')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: '#0A1F44', color: '#fff',
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
            Scan QR Code
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {statCards.map(({ label, value, sub, color, bg, bar }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,31,68,0.06)', boxShadow: '0 2px 12px rgba(10,31,68,0.04)', overflow: 'hidden' }}>
            <div style={{ height: '3px', background: `linear-gradient(90deg,${bar},transparent)` }}/>
            <div style={{ padding: '20px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}/>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44', marginTop: '6px' }}>{label}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#6B7FA3', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '3px' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Indicator + Quick Instructions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }}/>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0A1F44' }}>Live Gate Activity</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6B7FA3', background: '#F1F5F9', borderRadius: 999, padding: '2px 10px' }}>Auto-refreshes via socket</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['Approved → Scan QR → Check In', 'CheckedIn → Scan QR → Check Out'].map(hint => (
            <span key={hint} style={{ fontSize: '0.55rem', fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap' }}>
              {hint}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead><tr>
            <th>Visitor</th>
            <th>Meeting With</th>
            <th>Purpose</th>
            <th>Time</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'center' }}>Action</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#6B7FA3' }}>Loading…</td></tr>
            ) : visits.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#6B7FA3' }}>No recent visits.</td></tr>
            ) : visits.map(v => (
              <tr key={v._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(47,93,170,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 800, color: '#2F5DAA', fontSize: '0.75rem' }}>
                      {v.visitor?.imageUrl
                        ? <img src={v.visitor.imageUrl.startsWith('data:') ? v.visitor.imageUrl : `${API_URL}${v.visitor.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                        : v.visitor?.name?.charAt(0)
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A1F44' }}>{v.visitor?.name}</p>
                      <p style={{ fontSize: '0.65rem', color: '#6B7FA3' }}>{v.visitor?.phone}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem', color: '#0A1F44', fontWeight: 500 }}>{v.meetWith?.name || v.meetWithDept?.name || '—'}</td>
                <td style={{ fontSize: '0.82rem', color: '#6B7FA3' }}>{v.purpose}</td>
                <td style={{ fontSize: '0.72rem', color: '#6B7FA3' }}>{new Date(v.createdAt).toLocaleTimeString()}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: statusColor[v.status] || '#64748b', background: statusBg[v.status] || 'rgba(100,116,139,0.08)', border: `1px solid ${(statusColor[v.status] || '#64748b')}30` }}>
                    {v.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {(v.status === 'Approved' || v.status === 'CheckedIn') && v.qrToken ? (
                    <button onClick={() => navigate(`/dashboard/scan?token=${v.qrToken}`)} style={{ padding: '5px 14px', borderRadius: 8, border: 'none', background: '#0A1F44', color: '#fff', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em' }}>
                      Scan →
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
