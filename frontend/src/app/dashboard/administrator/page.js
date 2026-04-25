'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Admin', isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/users?role=Admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = currentUser ? 'PUT' : 'POST';
    const url = currentUser 
      ? `http://localhost:5000/api/v1/users/${currentUser._id}`
      : 'http://localhost:5000/api/v1/users';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchUsers();
        handleCloseModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this admin?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        name: user.name, email: user.email, password: '', 
        role: user.role, isActive: user.isActive
      });
    } else {
      setCurrentUser(null);
      setFormData({
        name: '', email: '', password: '', role: 'Admin', isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Admins</h1>
          <p className="text-gray-500 text-sm">Manage privileged accounts and access controls.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          ADD ADMIN
        </button>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left">Full Name</th>
              <th className="px-6 py-4 text-left">Email Address</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-12 text-center text-gray-500 italic">Syncing database...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" className="py-12 text-center text-gray-500 italic">No administrative accounts found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-bold uppercase tracking-wide">{user.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${!user.isActive ? 'text-red-500' : 'text-green-500'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleOpenModal(user)} className="text-gray-600 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="text-gray-600 hover:text-red-500 transition-colors">
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
        onClose={handleCloseModal} 
        title={currentUser ? 'Edit Administrator' : 'Onboard Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
            <input required type="text" className="w-full py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
            <input required type="email" className="w-full py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
            <input required={!currentUser} type="password" placeholder={currentUser ? "(Unchanged)" : ""} className="w-full py-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black tracking-widest uppercase">
              {currentUser ? 'Update Account' : 'Authorize Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
