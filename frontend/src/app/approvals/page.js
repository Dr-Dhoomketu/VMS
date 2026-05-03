'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApprovalsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    if (u) setUser(JSON.parse(u));
    fetchVisits(t);
  }, [router]);

  const fetchVisits = async (t) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/visits/pending`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = await res.json();
      if (res.ok) setVisits(data);
    } catch {}
  };

  const handleUpdate = async (id, status) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/visits/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) setVisits(prev => prev.filter(v => v._id !== id));
    } catch {}
  };

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0A1F44]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/vts-logo.png" alt="VISITORPASS" className="h-8 w-auto object-contain"/>
          <div className="w-px h-6 bg-[#E2E8F0]"/>
          <div>
            <h1 className="text-sm font-black text-[#0A1F44] uppercase tracking-tight">Pending Approvals</h1>
            <p className="text-[10px] text-[#6B7FA3] uppercase tracking-widest">Employee Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-xs text-[#6B7FA3]">{user.name}</span>}
          <button onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="text-xs font-semibold text-[#6B7FA3] hover:text-[#0A1F44] transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        {visits.length === 0 ? (
          <div className="vp-card p-16 text-center mt-8">
            <div className="w-16 h-16 rounded-full bg-[#EEF3FB] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#2F5DAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-black text-[#0A1F44] mb-2">All Clear</h3>
            <p className="text-sm text-[#6B7FA3]">No pending visitor requests to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {visits.map(visit => (
              <div key={visit._id} className="vp-card p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E2E8F0] shrink-0">
                    <img src={visit.visitor?.imageUrl ? `${API}${visit.visitor.imageUrl}` : 'https://via.placeholder.com/150'}
                      alt="avatar" className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0A1F44]">{visit.visitor?.name || 'Unknown'}</h3>
                    <p className="text-xs text-[#6B7FA3]">{visit.visitor?.phone}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="badge badge-pending">Pending</span>
                  </div>
                </div>
                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7FA3] text-xs">Purpose</span>
                    <span className="text-[#0A1F44] font-semibold text-xs">{visit.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7FA3] text-xs">Requested</span>
                    <span className="text-[#0A1F44] font-semibold text-xs">{new Date(visit.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleUpdate(visit._id, 'Approved')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors">
                    ✓ Approve
                  </button>
                  <button onClick={() => handleUpdate(visit._id, 'Rejected')}
                    className="flex-1 bg-[#F8FAFC] hover:bg-red-50 text-[#6B7FA3] hover:text-red-500 border border-[#E2E8F0] hover:border-red-200 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all">
                    ✕ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
