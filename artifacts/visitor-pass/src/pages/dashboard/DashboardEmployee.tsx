import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { API_URL } from '@/lib/api';

interface Emp { _id:string; name:string; email:string; role:string; department?:{_id:string;name:string}|string; designation?:{_id:string;name:string}|string; }
interface Dept { _id:string; name:string; }
interface Des { _id:string; name:string; }

export default function DashboardEmployee() {
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Des[]>([]);
  const [currentEmp, setCurrentEmp] = useState<Emp|null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newEmp, setNewEmp] = useState({ name:'', email:'', password:'password123', role:'Employee', department:'', designation:'' });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [e, d, des] = await Promise.all([
        fetch(`${API_URL}/api/v1/users`, { headers:h }).then(r=>r.json()),
        fetch(`${API_URL}/api/v1/departments`, { headers:h }).then(r=>r.json()),
        fetch(`${API_URL}/api/v1/designations`, { headers:h }).then(r=>r.json()),
      ]);
      setEmployees(e||[]); setDepartments(d||[]); setDesignations(des||[]);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (emp: Emp|null = null) => {
    if (emp) {
      setCurrentEmp(emp);
      setNewEmp({ name:emp.name||'', email:emp.email||'', password:'password123', role:emp.role||'Employee',
        department: typeof emp.department === 'object' ? emp.department?._id||'' : emp.department||'',
        designation: typeof emp.designation === 'object' ? emp.designation?._id||'' : emp.designation||'' });
    } else { setCurrentEmp(null); setNewEmp({ name:'', email:'', password:'password123', role:'Employee', department:'', designation:'' }); }
    setIsModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const token = localStorage.getItem('token');
    const method = currentEmp ? 'PUT' : 'POST';
    const url = currentEmp ? `${API_URL}/api/v1/users/${currentEmp._id}` : `${API_URL}/api/v1/users`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(newEmp) });
      const data = await res.json();
      if (res.ok) { setIsModalOpen(false); setCurrentEmp(null); fetchData(); }
      else setError(data.message || 'Operation failed');
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/v1/users/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      fetchData();
    } catch {}
  };

  const deptName = (d: {_id:string;name:string}|string|undefined) => typeof d==='object'?d?.name:'N/A';
  const desName = (d: {_id:string;name:string}|string|undefined) => typeof d==='object'?d?.name:'N/A';

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-[#0A1F44]">Employees</h1>
          <p className="text-[#6B7FA3] text-sm">Monitor and manage the active team directory.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          ADD EMPLOYEE
        </button>
      </div>
      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead><tr>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Email</th>
            <th className="px-6 py-4 text-left">Department</th>
            <th className="px-6 py-4 text-left">Designation</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr></thead>
          <tbody>
            {employees.length === 0
              ? <tr><td colSpan={5} className="py-12 text-center text-gray-500 italic">No employee records found.</td></tr>
              : employees.map(emp => (
                <tr key={emp._id} className="group hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#EEF3FB] flex items-center justify-center text-[#2F5DAA] font-bold text-base flex-shrink-0">{emp.name?.charAt(0)}</div>
                      <span className="text-[#0A1F44] font-bold uppercase tracking-wide">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7FA3] text-sm">{emp.email}</td>
                  <td className="px-6 py-4 text-[#6B7FA3] text-xs uppercase tracking-widest">{deptName(emp.department)}</td>
                  <td className="px-6 py-4 text-[#6B7FA3] text-xs uppercase tracking-widest">{desName(emp.designation)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleOpenModal(emp)} className="text-[#6B7FA3] hover:text-[#0A1F44] transition-colors p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                      <button onClick={() => handleDelete(emp._id)} className="text-[#6B7FA3] hover:text-red-500 transition-colors p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentEmp ? "Edit Personnel" : "Onboard Team"}>
        <form onSubmit={handleAdd} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
              <input required type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp,name:e.target.value})}/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp,email:e.target.value})}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Department</label>
              <select required value={newEmp.department} onChange={e => setNewEmp({...newEmp,department:e.target.value})}>
                <option value="">Select Dept</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Designation</label>
              <select required value={newEmp.designation} onChange={e => setNewEmp({...newEmp,designation:e.target.value})}>
                <option value="">Select Role</option>
                {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-2">
            <button disabled={loading} type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black tracking-widest uppercase disabled:opacity-50">
              {loading ? 'Initializing...' : currentEmp ? 'Update Profile' : 'Authorize Personnel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
