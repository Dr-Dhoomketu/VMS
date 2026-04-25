'use client';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [currentEmp, setCurrentEmp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'Employee',
    department: '',
    designation: ''
  });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [empRes, deptRes, desRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/users`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/departments`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/designations`, { headers })
      ]);

      const [empData, deptData, desData] = await Promise.all([
        empRes.json(),
        deptRes.json(),
        desRes.json()
      ]);

      setEmployees(empData || []);
      setDepartments(deptData || []);
      setDesignations(desData || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setCurrentEmp(emp);
      setNewEmp({
        name: emp.name || '',
        email: emp.email || '',
        password: 'password123',
        role: emp.role || 'Employee',
        department: emp.department?._id || emp.department || '',
        designation: emp.designation?._id || emp.designation || ''
      });
    } else {
      setCurrentEmp(null);
      setNewEmp({ name: '', email: '', password: 'password123', role: 'Employee', department: '', designation: '' });
    }
    setIsModalOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const method = currentEmp ? 'PUT' : 'POST';
    const url = currentEmp 
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/users/${currentEmp._id}`
      : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/users`;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEmp)
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setNewEmp({ name: '', email: '', password: 'password123', role: 'Employee', department: '', designation: '' });
        setCurrentEmp(null);
        fetchData();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="fade-up w-full px-4">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Team</h1>
          <p className="text-gray-500 text-sm">Monitor and manage the active team directory.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          ADD EMPLOYEE
        </button>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Department</th>
              <th className="px-6 py-4 text-left">Designation</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500 italic">No employee records found.</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                        {emp.name?.charAt(0)}
                      </div>
                      <span className="text-white font-bold uppercase tracking-wide">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{emp.email}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs uppercase tracking-widest">{emp.department?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs uppercase tracking-widest">{emp.designation?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(emp)}
                        className="text-gray-600 hover:text-white transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="text-gray-600 hover:text-red-500 transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEmp ? "Edit Personnel" : "Onboard Team"}
      >
        <form onSubmit={handleAdd} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
              <input required type="text" className="w-full py-2" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <input required type="email" className="w-full py-2" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Department</label>
              <select required className="w-full py-2" value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}>
                <option value="">Select Dept</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Designation</label>
              <select required className="w-full py-2" value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })}>
                <option value="">Select Role</option>
                {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled={loading}
              type="submit"
              className="w-full btn-primary py-3.5 rounded-xl font-black tracking-widest uppercase disabled:opacity-50"
            >
              {loading ? 'Initializing...' : (currentEmp ? 'Update Profile' : 'Authorize Personnel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
