'use client';
import { useEffect, useState } from 'react';

export default function VisitorLog() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchVisitors();
  }, [filters]);

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/visits?`;
      if (filters.status) url += `status=${filters.status}&`;
      if (filters.startDate) url += `startDate=${filters.startDate}&`;
      if (filters.endDate) url += `endDate=${filters.endDate}&`;

      const res = await fetch(url, {
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
    if (!confirm('Proceed with Check-out for this visitor?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/visits/${id}/checkout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchVisitors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Visitor Log</h1>
          <p className="text-gray-500 text-sm">Comprehensive logs of all entry and exit events.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col gap-1">
             <label className="text-[10px] uppercase font-bold text-gray-500">From</label>
             <input type="date" className="text-xs p-3 bg-white/5 border border-white/10 rounded-xl" onChange={e => setFilters({...filters, startDate: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
             <label className="text-[10px] uppercase font-bold text-gray-500">To</label>
             <input type="date" className="text-xs p-3 bg-white/5 border border-white/10 rounded-xl" onChange={e => setFilters({...filters, endDate: e.target.value})} />
           </div>
        </div>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left">Visitor</th>
              <th className="px-6 py-4 text-left">Identity</th>
              <th className="px-6 py-4 text-left">Meeting With</th>
              <th className="px-6 py-4 text-left">Purpose</th>
              <th className="px-6 py-4 text-left">Time Recorded</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="py-12 text-center text-gray-500 italic">Accessing archives...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="7" className="py-12 text-center text-gray-500 italic">No visitor records found.</td></tr>
            ) : (
              visitors.map((v) => (
                <tr key={v._id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-bold uppercase tracking-wide">{v.visitor?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-[10px] font-mono">{v.visitor?.aadhar}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{v.meetWith?.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs uppercase tracking-widest">{v.purpose}</td>
                  <td className="px-6 py-4 text-gray-500 text-[10px]">{new Date(v.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      v.status === 'CheckedOut' ? 'text-gray-500' :
                      v.status === 'Approved' ? 'text-green-500' :
                      v.status === 'Rejected' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {v.status === 'Approved' ? 'Active' : v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {v.status === 'Approved' && (
                      <button 
                        onClick={() => handleCheckout(v._id)}
                        className="text-red-500 hover:text-red-300 font-bold text-[10px] uppercase"
                      >
                        Check Out
                      </button>
                    )}
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
