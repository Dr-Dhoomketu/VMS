'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDepartments() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!t || !userStr) return router.push('/login');
    if (JSON.parse(userStr).role !== 'Admin') return router.push('/dashboard');
    setToken(t);
    fetchDepartments(t);
  }, [router]);

  const fetchDepartments = async (t) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/departments`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = await res.json();
      if (res.ok) setDepartments(data);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#0A1F44] mb-8 uppercase tracking-tight">Departments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(dept => (
            <div key={dept._id} className="vp-card p-6">
              <h3 className="text-lg font-black text-[#0A1F44] uppercase">{dept.name}</h3>
              {dept.code && <p className="text-xs text-[#6B7FA3] mt-1 font-mono">{dept.code}</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
