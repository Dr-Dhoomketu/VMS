'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';

export default function DesignationManagement() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDes, setCurrentDes] = useState(null);
  const [formData, setFormData] = useState({ name: '', level: '1' });

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/designations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDesignations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = currentDes ? 'PUT' : 'POST';
    const url = currentDes 
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/designations/${currentDes._id}`
      : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/designations`;

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
        fetchDesignations();
        handleCloseModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this designation?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/designations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDesignations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (des = null) => {
    if (des) {
      setCurrentDes(des);
      setFormData({ name: des.name, level: des.level });
    } else {
      setCurrentDes(null);
      setFormData({ name: '', level: '1' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDes(null);
  };

  return (
    <div className="fade-up w-full">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Designations</h1>
          <p className="text-gray-500 text-sm">Manage employee roles and authority levels.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          ADD DESIGNATION
        </button>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left">Designation Name</th>
              <th className="px-6 py-4 text-left">Level</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="py-12 text-center text-gray-500 italic">Syncing data...</td></tr>
            ) : designations.length === 0 ? (
              <tr><td colSpan="3" className="py-12 text-center text-gray-500 italic">No designations found.</td></tr>
            ) : (
              designations.map((des) => (
                <tr key={des._id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-bold uppercase tracking-wide">{des.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">Rank {des.level}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleOpenModal(des)} className="text-gray-600 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(des._id)} className="text-gray-600 hover:text-red-500 transition-colors">
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
        title={currentDes ? 'Edit Designation' : 'Create Designation'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Designation Name</label>
            <input required type="text" className="w-full py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Senior Manager" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Authority Level</label>
            <input required type="number" min="1" max="10" className="w-full py-2" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black tracking-widest uppercase">
              {currentDes ? 'Update Role' : 'Confirm Designation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
