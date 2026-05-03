'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import socket, { connectSocket } from '@/utils/socket';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const statCards = [
  { key: 'total',      label: 'Total Visits',  sub: 'All Time',     color: '#2F5DAA', bg: 'rgba(47,93,170,0.08)' },
  { key: 'today',      label: 'Today',         sub: 'Live Traffic', color: '#0A1F44', bg: 'rgba(10,31,68,0.06)' },
  { key: 'checkedIn',  label: 'On Premise',    sub: 'Active Now',   color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  { key: 'checkedOut', label: 'Checked Out',   sub: 'Cleared',      color: '#6B7FA3', bg: 'rgba(107,127,163,0.08)' },
  { key: 'preVisitor', label: 'Scheduled',     sub: 'Pre-Booked',   color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, today: 0, checkedIn: 0, checkedOut: 0, preVisitor: 0 });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return router.push('/login');
    const u = JSON.parse(userStr);
    setUser(u);
    fetchStats();
    fetchVisitors();
    connectSocket(u);
    socket.on('visit_updated', () => { fetchStats(); fetchVisitors(); });
    socket.on('new_visit', () => { fetchStats(); fetchVisitors(); });
    return () => { socket.off('visit_updated'); socket.off('new_visit'); };
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/visits/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch {}
  };

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/visits?status=Approved`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setVisitors(data);
    } catch {} finally { setLoading(false); }
  };

  const handleCheckout = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/v1/visits/${id}/checkout`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { fetchStats(); fetchVisitors(); }
    } catch {}
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 pb-6 border-b border-[#E2E8F0]">
        <div>
          <p className="vp-caption mb-2">Operations Center</p>
          <h1 className="text-3xl font-black tracking-tight text-[#0A1F44]">
            System Overview
          </h1>
          <p className="text-sm text-[#6B7FA3] mt-1">Real-time monitoring of facility access and visitor flow.</p>
        </div>
        {user && (
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#6B7FA3] mb-1">Signed in as</p>
            <p className="text-sm font-bold text-[#0A1F44]">{user.name}</p>
            <p className="text-[10px] text-[#2F5DAA] font-semibold uppercase tracking-widest">{user.role}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ key, label, sub, color, bg }) => (
          <div key={key} className="vp-stat-card">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: bg }}>
              <div className="w-3 h-3 rounded-full" style={{ background: color }}/>
            </div>
            <div className="text-2xl font-black text-[#0A1F44] mb-1">{stats[key] ?? 0}</div>
            <div className="text-xs font-semibold text-[#0A1F44]">{label}</div>
            <div className="text-[10px] text-[#6B7FA3] uppercase tracking-widest mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Active Visitors Table */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#0A1F44]">Active Visitors</h2>
          <p className="text-xs text-[#6B7FA3] mt-0.5">Currently on premises</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <span className="text-[10px] font-bold text-[#6B7FA3] uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead>
            <tr>
              <th className="px-5 py-4 text-left">Visitor</th>
              <th className="px-5 py-4 text-left">Meeting With</th>
              <th className="px-5 py-4 text-left">Purpose</th>
              <th className="px-5 py-4 text-left">Check-In</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-12 text-center text-[#6B7FA3] text-sm">Loading...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="6" className="py-12 text-center text-[#6B7FA3] text-sm">No active visitors on premises.</td></tr>
            ) : visitors.map((v) => (
              <tr key={v._id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#EEF3FB] shrink-0">
                      {v.visitor?.imageUrl
                        ? <img src={`${API}${v.visitor.imageUrl}`} className="w-full h-full object-cover" alt=""/>
                        : <div className="w-full h-full flex items-center justify-center text-[#2F5DAA] text-xs font-bold">
                            {v.visitor?.name?.charAt(0)}
                          </div>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1F44]">{v.visitor?.name}</p>
                      <p className="text-[10px] text-[#6B7FA3]">{v.visitor?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#0A1F44]">{v.meetWith?.name || '—'}</td>
                <td className="px-5 py-4 text-sm text-[#6B7FA3]">{v.purpose}</td>
                <td className="px-5 py-4 text-xs text-[#6B7FA3]">{new Date(v.createdAt).toLocaleTimeString()}</td>
                <td className="px-5 py-4">
                  <span className="badge badge-approved">Active</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => handleCheckout(v._id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
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
