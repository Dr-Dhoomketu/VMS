'use client';
import { useEffect, useState } from 'react';

export default function AppointmentLog() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    fetchPreVisitors();
  }, [searchDate]);

  const fetchPreVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/v1/visits?';
      if (searchDate) {
        url += `startDate=${searchDate}&endDate=${searchDate}T23:59:59&`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVisitors(data.filter(v => v.scheduledTime));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
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
      if (res.ok) fetchPreVisitors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Appointments</h1>
          <p className="text-gray-500 text-sm">Manage pre-scheduled visits and upcoming appointments.</p>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Filter:</span>
           <input 
             type="date" 
             className="text-xs p-3 bg-white/5 border border-white/10 rounded-xl" 
             onChange={e => setSearchDate(e.target.value)}
           />
        </div>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left">Visitor Details</th>
              <th className="px-6 py-4 text-left">Host Personnel</th>
              <th className="px-6 py-4 text-left">Visit Purpose</th>
              <th className="px-6 py-4 text-left">Scheduled For</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-12 text-center text-gray-500 italic">Syncing schedule...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="6" className="py-12 text-center text-gray-500 italic">No pre-scheduled appointments found.</td></tr>
            ) : (
              visitors.map((v) => (
                <tr key={v._id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-bold uppercase tracking-wide">{v.visitor?.name}</span>
                    <p className="text-[10px] text-gray-500">{v.visitor?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{v.meetWith?.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs uppercase tracking-widest">{v.purpose}</td>
                  <td className="px-6 py-4 text-blue-500 text-[10px] font-mono">
                    {new Date(v.scheduledTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      v.status === 'Approved' ? 'text-green-500' :
                      v.status === 'Rejected' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {v.status === 'Pending' && (
                      <div className="flex justify-center gap-4">
                        <button onClick={() => handleUpdateStatus(v._id, 'Approved')} className="text-green-500 hover:text-green-300 font-bold text-[10px] uppercase">Approve</button>
                        <button onClick={() => handleUpdateStatus(v._id, 'Rejected')} className="text-red-500 hover:text-red-300 font-bold text-[10px] uppercase">Deny</button>
                      </div>
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
