import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { API_URL } from '@/lib/api';

interface Emp { _id: string; name: string; email: string; role: string; department?: { _id: string; name: string } | string; designation?: { _id: string; name: string } | string; }
interface Dept { _id: string; name: string; }
interface Des { _id: string; name: string; }

export default function DashboardEmployee() {
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Des[]>([]);
  const [currentEmp, setCurrentEmp] = useState<Emp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteResult, setInviteResult] = useState<{ name: string; url: string } | null>(null);
  const [resendLoading, setResendLoading] = useState<string | null>(null);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', role: 'Employee', department: '', designation: '' });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [e, d, des] = await Promise.all([
        fetch(`${API_URL}/api/v1/users`, { headers: h }).then(r => r.json()),
        fetch(`${API_URL}/api/v1/departments`, { headers: h }).then(r => r.json()),
        fetch(`${API_URL}/api/v1/designations`, { headers: h }).then(r => r.json()),
      ]);
      setEmployees(Array.isArray(e) ? e : []); setDepartments(Array.isArray(d) ? d : []); setDesignations(Array.isArray(des) ? des : []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (emp: Emp | null = null) => {
    if (emp) {
      setCurrentEmp(emp);
      setNewEmp({
        name: emp.name || '', email: emp.email || '', role: emp.role || 'Employee',
        department: typeof emp.department === 'object' ? emp.department?._id || '' : emp.department || '',
        designation: typeof emp.designation === 'object' ? emp.designation?._id || '' : emp.designation || '',
      });
    } else {
      setCurrentEmp(null);
      setNewEmp({ name: '', email: '', role: 'Employee', department: '', designation: '' });
    }
    setError(''); setInviteResult(null);
    setIsModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setInviteResult(null);
    const token = localStorage.getItem('token');
    const method = currentEmp ? 'PUT' : 'POST';
    const url = currentEmp ? `${API_URL}/api/v1/users/${currentEmp._id}` : `${API_URL}/api/v1/users`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newEmp),
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        if (!currentEmp && data.inviteUrl) {
          setInviteResult({ name: newEmp.name, url: data.inviteUrl });
        } else {
          setIsModalOpen(false); setCurrentEmp(null);
        }
      } else setError(data.message || 'Operation failed');
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/v1/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch {}
  };

  const handleResendInvite = async (emp: Emp) => {
    setResendLoading(emp._id);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/users/${emp._id}/resend-invite`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) alert(`Invite sent to ${emp.email}${data.inviteUrl ? `\n\nSetup link:\n${data.inviteUrl}` : ''}`);
      else alert(data.message || 'Failed to resend invite');
    } catch { alert('Network error'); } finally { setResendLoading(null); }
  };

  const deptName = (d: { _id: string; name: string } | string | undefined) => typeof d === 'object' ? d?.name : 'N/A';
  const desName = (d: { _id: string; name: string } | string | undefined) => typeof d === 'object' ? d?.name : 'N/A';

  const roleStyle: Record<string, { color: string; bg: string; border: string }> = {
    Employee: { color: '#2F5DAA', bg: 'rgba(47,93,170,0.08)', border: 'rgba(47,93,170,0.2)' },
    Security: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
    Admin:    { color: '#0A1F44', bg: 'rgba(10,31,68,0.06)',   border: 'rgba(10,31,68,0.15)'  },
  };

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase mb-1 text-[#0A1F44]">Staff Directory</h1>
          <p className="text-[#6B7FA3] text-xs">Manage employees and security personnel. Each person gets their own login credentials.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          ADD STAFF
        </button>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead><tr>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Email</th>
            <th className="px-6 py-4 text-left">Department</th>
            <th className="px-6 py-4 text-left">Designation</th>
            <th className="px-6 py-4 text-center">System Role</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr></thead>
          <tbody>
            {employees.length === 0
              ? <tr><td colSpan={6} className="py-12 text-center text-gray-500 italic">No staff records found.</td></tr>
              : employees.map(emp => (
                <tr key={emp._id} className="group hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                        style={{ background: roleStyle[emp.role]?.bg || '#EEF3FB', color: roleStyle[emp.role]?.color || '#2F5DAA' }}>
                        {emp.name?.charAt(0)}
                      </div>
                      <span className="text-[#0A1F44] font-bold uppercase tracking-wide">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7FA3] text-sm">{emp.email}</td>
                  <td className="px-6 py-4 text-[#6B7FA3] text-xs uppercase tracking-widest">{deptName(emp.department)}</td>
                  <td className="px-6 py-4 text-[#6B7FA3] text-xs uppercase tracking-widest">{desName(emp.designation)}</td>
                  <td className="px-6 py-4 text-center">
                    <span style={{
                      padding: '3px 12px', borderRadius: 20,
                      fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: roleStyle[emp.role]?.color || '#6B7FA3',
                      background: roleStyle[emp.role]?.bg || '#F1F5F9',
                      border: `1px solid ${roleStyle[emp.role]?.border || '#E2E8F0'}`,
                    }}>{emp.role}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleResendInvite(emp)}
                        disabled={resendLoading === emp._id}
                        title="Resend invite email"
                        className="text-[#6B7FA3] hover:text-[#2F5DAA] transition-colors p-2"
                      >
                        {resendLoading === emp._id
                          ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        }
                      </button>
                      <button onClick={() => handleOpenModal(emp)} className="text-[#6B7FA3] hover:text-[#0A1F44] transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(emp._id)} className="text-[#6B7FA3] hover:text-red-500 transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentEmp(null); setInviteResult(null); }} title={currentEmp ? 'Edit Personnel' : 'Onboard Team'}>
        {inviteResult ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(22,163,74,0.08)', border: '2px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg style={{ width: '24px', height: '24px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A1F44', marginBottom: '8px' }}>{inviteResult.name} added!</h3>
            <p style={{ fontSize: '0.8rem', color: '#6B7FA3', marginBottom: '20px', lineHeight: 1.6 }}>An invite email has been sent. Share this link if the email isn't received:</p>
            <div style={{ padding: '12px 14px', background: '#F8FAFF', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.72rem', color: '#2F5DAA', wordBreak: 'break-all', textAlign: 'left', marginBottom: '20px', fontFamily: 'monospace' }}>
              {inviteResult.url}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { navigator.clipboard.writeText(inviteResult.url); }} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', color: '#0A1F44' }}>Copy Link</button>
              <button onClick={() => { setIsModalOpen(false); setInviteResult(null); }} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">{error}</div>}
            {!currentEmp && (
              <div style={{ padding: '10px 14px', background: 'rgba(47,93,170,0.05)', border: '1px solid rgba(47,93,170,0.15)', borderRadius: '10px', fontSize: '0.75rem', color: '#2F5DAA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                An invite email will be sent so the employee can set their own password.
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required type="text" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.875rem', color: '#0A1F44', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input required type="email" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.875rem', color: '#0A1F44', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}/>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">System Role</label>
              <select value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.875rem', color: '#0A1F44', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}>
                <option value="Employee">Employee — can approve visits &amp; manage appointments</option>
                <option value="Security">Security — gate access, QR scanning &amp; visitor log</option>
              </select>
              <p style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: '4px', fontWeight: 600 }}>
                {newEmp.role === 'Security'
                  ? 'Security staff will see the Security Dashboard with live gate activity after logging in.'
                  : 'Employees will see their personal dashboard with visit approvals and appointments.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Department</label>
                <select value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.875rem', color: '#0A1F44', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select Dept</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Designation</label>
                <select value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.875rem', color: '#0A1F44', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select Designation (optional)</option>
                  {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="pt-2">
              <button disabled={loading} type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black tracking-widest uppercase disabled:opacity-50">
                {loading ? 'Processing...' : currentEmp ? 'Update Profile' : `Send Invite & Add ${newEmp.role}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
