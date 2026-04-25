'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';

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
      const res = await fetch('http://localhost:5000/api/v1/departments', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = await res.json();
      if (res.ok) setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-gold mb-8">Manage Departments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(dept => (
            <GlassCard key={dept._id}>
              <h3 className="text-xl text-white font-bold">{dept.name}</h3>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
