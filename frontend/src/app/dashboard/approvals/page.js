'use client';
import { useEffect, useState } from 'react';
import socket, { connectSocket } from '@/utils/socket';

export default function ApprovalsPage() {
  const [pendingVisits, setPendingVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    fetchPending();
    connectSocket(user);

    socket.on('new_visit', () => fetchPending());
    socket.on('new_visit_request', () => fetchPending());

    return () => {
      socket.off('new_visit');
      socket.off('new_visit_request');
    };
  }, []);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/visits/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPendingVisits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/visits/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-up w-full px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Approvals</h1>
        <p className="text-gray-500 text-sm">Review and authorize visitor access in real-time.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center w-full">
          <p className="text-gray-500 italic">Syncing live feed...</p>
        </div>
      ) : pendingVisits.length === 0 ? (
        <div className="py-20 text-center w-full border border-white/5 bg-white/5 rounded-3xl">
          <p className="text-gray-500 italic">No pending visitor requests found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pendingVisits.map((visit) => (
            <div key={visit._id} className="holographic-glass p-8 border border-white/5 bg-white/5 rounded-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex gap-6 relative z-10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  {visit.visitor?.imageUrl ? (
                    <img src={`http://localhost:5000${visit.visitor.imageUrl}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-[8px] text-gray-500 uppercase font-black">No Photo</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{visit.visitor?.name}</h3>
                    <span className="text-[8px] font-black bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full uppercase tracking-widest">New Request</span>
                  </div>
                  <p className="text-blue-500 text-[10px] uppercase tracking-widest font-black mt-1">Host: {visit.meetWith?.name}</p>
                  <div className="mt-4 space-y-1">
                     <p className="text-xs text-gray-400 font-medium">Purpose: <span className="text-gray-200">{visit.purpose}</span></p>
                     <p className="text-[10px] text-gray-500 font-mono">ID: {visit.visitor?.aadhar}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8 relative z-10">
                <button 
                  onClick={() => handleUpdate(visit._id, 'Approved')}
                  className="flex-1 btn-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                >
                  Approve Access
                </button>
                <button 
                  onClick={() => handleUpdate(visit._id, 'Rejected')}
                  className="flex-1 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 border border-white/5 hover:border-red-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
