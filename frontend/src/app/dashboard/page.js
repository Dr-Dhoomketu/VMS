'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import socket, { connectSocket } from '@/utils/socket';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0, today: 0, checkedIn: 0, checkedOut: 0, preVisitor: 0
  });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return router.push('/login');
    const user = JSON.parse(userStr);

    fetchStats();
    fetchVisitors();
    connectSocket(user);

    socket.on('visit_updated', () => {
      fetchStats();
      fetchVisitors();
    });

    socket.on('new_visit', () => {
      fetchStats();
      fetchVisitors();
    });

    return () => {
      socket.off('visit_updated');
      socket.off('new_visit');
    };
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/visits/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/visits?status=Approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setVisitors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/visits/${id}/checkout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStats();
        fetchVisitors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto fade-up">
      <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-12">
        <div>
          <p className="caption mb-4">Operations Center</p>
          <h1 className="hero-title text-6xl">System Overview</h1>
          <p className="text-gray-500 text-xs mt-4 tracking-wide">Real-time monitoring of facility access and security protocols.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="caption text-[9px] mb-1">Authenticated User</p>
            <p className="text-sm font-black tracking-widest uppercase">Lead Administrator</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-xl font-black relative z-10">A</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-16">
        <div className="holographic-card p-8 rounded-3xl text-center">
          <p className="caption text-[8px] mb-4">Total Integrity</p>
          <p className="text-5xl font-black mb-2">{stats.total}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Gross Visits</p>
        </div>
        <div className="holographic-card p-8 rounded-3xl text-center border-blue-500/10">
          <p className="caption text-[8px] mb-4 text-blue-500">Live Traffic</p>
          <p className="text-5xl font-black mb-2 text-blue-500">{stats.today}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Today's Flow</p>
        </div>
        <div className="holographic-card p-8 rounded-3xl text-center border-green-500/10">
          <p className="caption text-[8px] mb-4 text-green-500">On-Premise</p>
          <p className="text-5xl font-black mb-2 text-green-500">{stats.checkedIn}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Security</p>
        </div>
        <div className="holographic-card p-8 rounded-3xl text-center">
          <p className="caption text-[8px] mb-4">Finalized</p>
          <p className="text-5xl font-black mb-2">{stats.checkedOut}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Cleared Site</p>
        </div>
        <div className="holographic-card p-8 rounded-3xl text-center border-yellow-500/10">
          <p className="caption text-[8px] mb-4 text-yellow-500">Scheduled</p>
          <p className="text-5xl font-black mb-2 text-yellow-500">{stats.preVisitor}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Booked Entry</p>
        </div>
      </div>

      <div className="dark-table-container mb-8">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-lg font-black tracking-tighter uppercase">Approved Visitors</h2>
          <span className="text-[10px] uppercase tracking-widest text-blue-500 font-bold animate-pulse">Live Feed Active</span>
        </div>
        <table className="dark-table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Meeting With</th>
              <th>Purpose</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-12 text-gray-500 italic">Syncing live data...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="6" className="text-center p-12 text-gray-500 italic">No active visitors.</td></tr>
            ) : (
              visitors.map((v) => (
                <tr key={v._id} className="group transition-colors">
                  <td className="font-bold text-white theme-coffee:text-black">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                         {v.visitor?.imageUrl ? <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${v.visitor.imageUrl}`} className="w-full h-full object-cover" /> : <div className="text-[10px]">VIS</div>}
                       </div>
                       <div>
                         <p>{v.visitor?.name}</p>
                         <p className="text-[10px] text-gray-500 font-normal">{v.visitor?.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="text-gray-400 font-medium">{v.meetWith?.name}</td>
                  <td className="text-[11px] uppercase tracking-wider">{v.purpose}</td>
                  <td className="text-gray-500 font-mono text-[11px]">{new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
                      Approved
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleCheckout(v._id)}
                      className="btn-action bg-white/5 hover:bg-red-500/20 hover:text-red-500 border border-white/10 hover:border-red-500/40 transition-all uppercase text-[9px] font-black tracking-widest"
                    >
                      Check Out
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
