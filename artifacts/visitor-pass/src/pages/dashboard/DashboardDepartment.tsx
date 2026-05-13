import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { API_URL } from '@/lib/api';

interface Dept { _id: string; name: string; code: string; }

export default function DashboardDepartment() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState<Dept|null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/departments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setDepartments(data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = currentDept ? 'PUT' : 'POST';
    const url = currentDept ? `${API_URL}/api/v1/departments/${currentDept._id}` : `${API_URL}/api/v1/departments`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(formData) });
      if (res.ok) { fetchDepartments(); handleCloseModal(); }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this department?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/v1/departments/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      fetchDepartments();
    } catch {}
  };

  const handleOpenModal = (dept: Dept|null = null) => {
    if (dept) { setCurrentDept(dept); setFormData({ name:dept.name||'', code:dept.code||'' }); }
    else { setCurrentDept(null); setFormData({ name:'', code:'' }); }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setCurrentDept(null); setFormData({ name:'', code:'' }); };

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase mb-1 text-[#0A1F44]">Departments</h1>
          <p className="text-[#6B7FA3] text-xs">Manage organizational structure and units.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          ADD DEPARTMENT
        </button>
      </div>
      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead><tr>
            <th className="px-6 py-4 text-left">Department Name</th>
            <th className="px-6 py-4 text-left">Code</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="py-12 text-center text-gray-500 italic">Syncing data...</td></tr>
            : departments.length === 0 ? <tr><td colSpan={3} className="py-12 text-center text-gray-500 italic">No departments recorded.</td></tr>
            : departments.map(dept => (
              <tr key={dept._id} className="group hover:bg-[#F8FAFC] transition-colors">
                <td className="px-6 py-4"><span className="text-[#0A1F44] font-bold uppercase tracking-wide">{dept.name}</span></td>
                <td className="px-6 py-4 text-[#6B7FA3] text-sm font-mono">{dept.code}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleOpenModal(dept)} className="text-[#6B7FA3] hover:text-[#0A1F44] transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                    <button onClick={() => handleDelete(dept._id)} className="text-[#6B7FA3] hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentDept ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Department Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} placeholder="e.g. Engineering"/>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Department Code</label>
            <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code:e.target.value})} placeholder="e.g. ENG"/>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black tracking-widest uppercase">{currentDept ? 'Save Changes' : 'Confirm Department'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
