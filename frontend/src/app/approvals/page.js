'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';

export default function ApprovalsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
    fetchVisits(t);
  }, [router]);

  const fetchVisits = async (t) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/visits/pending', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVisits(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/visits/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setVisits(prev => prev.filter(v => v._id !== id));
      } else {
         alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-4xl font-bold text-brand-gold text-glow-gold">Pending Approvals</h1>
           <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-400 hover:text-white transition-colors">Logout</button>
        </div>

        {visits.length === 0 ? (
          <GlassCard className="text-center py-12">
             <p className="text-gray-400">No pending visits to approve.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visits.map(visit => (
              <GlassCard key={visit._id} className="flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20">
                    <img src={visit.visitor?.imageUrl ? `http://localhost:5000${visit.visitor.imageUrl}` : "https://via.placeholder.com/150"} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{visit.visitor?.name || 'Unknown'}</h3>
                    <p className="text-gray-400 text-sm">{visit.visitor?.phone}</p>
                  </div>
                </div>
                <div className="mb-6 space-y-2 text-sm">
                   <p><span className="text-brand-gold">Purpose:</span> {visit.purpose}</p>
                   <p><span className="text-brand-gold">Requested:</span> {new Date(visit.createdAt).toLocaleString()}</p>
                </div>
                <div className="mt-auto flex space-x-4">
                  <button onClick={() => handleUpdate(visit._id, 'Approved')} className="flex-1 bg-green-600/80 hover:bg-green-500 text-white font-bold py-2 rounded transition-colors shadow-[0_0_10px_rgba(0,255,0,0.2)]">
                    Approve
                  </button>
                  <button onClick={() => handleUpdate(visit._id, 'Rejected')} className="flex-1 bg-red-900/80 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors">
                    Deny
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
