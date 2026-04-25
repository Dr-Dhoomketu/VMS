'use client';
import { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import Link from 'next/link';

export default function ReturningVisitor() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const [visitorData, setVisitorData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ meetWith: '', purpose: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/users/employees`);
      const data = await res.json();
      if (res.ok) setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/visits/history?phone=${phone}`);
      const data = await res.json();
      if (res.ok) {
        setVisitorData(data.visitor);
        if (data.lastVisit) {
          setFormData({ 
            meetWith: data.lastVisit.meetWith?._id || '', 
            purpose: data.lastVisit.purpose || '' 
          });
        }
        setStep(2);
      } else {
        setError(data.message || 'Mobile number not found in our records');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: visitorData.name,
        phone: visitorData.phone,
        aadhar: visitorData.aadhar,
        email: visitorData.email,
        meetWith: formData.meetWith, 
        purpose: formData.purpose,
        fromTime: formData.fromTime,
        duration: formData.duration
      };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/visits/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStep(3);
      } else {
        setError('Submission failed');
      }
    } catch (err) {
      setError('Sync failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black relative">
      {/* Close Button on Top Left */}
      <Link href="/" className="absolute top-8 left-8 z-50 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400 hover:text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </Link>

      <GlassCard className="w-full max-w-md">
        {step === 1 && (
          <form onSubmit={handleSearch} className="space-y-8 fade-up py-4">
            <div className="text-center">
              <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Returning Visitor</h2>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Please enter your registered number</p>
            </div>
            
            {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest">{error}</p>}
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-2">Mobile Number</label>
              <input required type="tel" className="w-full" 
                value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 ..." />
            </div>
            <button type="submit" className="btn-action btn-primary w-full py-4 text-xs font-black tracking-[0.2em]">
              Search Records →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCheckIn} className="space-y-8 text-center fade-up py-4">
             <div className="text-center">
              <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Record Found</h2>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Welcome back!</p>
            </div>

             <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
               <img src={visitorData?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${visitorData.imageUrl}` : "https://via.placeholder.com/150"} alt="avatar" className="w-full h-full object-cover" />
             </div>
             
             <div>
               <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Hello, {visitorData?.name}</h3>
               <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Please confirm your visit details</p>
             </div>
             
             <div className="text-left space-y-4">
                 <div>
                   <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-2">Who are you meeting?</label>
                   <select required className="w-full" value={formData.meetWith} onChange={e => setFormData({...formData, meetWith: e.target.value})}>
                     <option value="">Select Employee</option>
                     {employees.map(emp => (
                       <option key={emp._id} value={emp._id}>{emp.name}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-2">Purpose of Visit</label>
                   <input required type="text" className="w-full" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-2">Check-In Time</label>
                      <input required type="time" className="w-full" value={formData.fromTime} onChange={e => setFormData({...formData, fromTime: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-2">Duration</label>
                      <input type="text" className="w-full" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 1hr" />
                    </div>
                 </div>
              </div>

             <button type="submit" disabled={isSubmitting} className="btn-action btn-danger w-full py-4 text-xs font-black tracking-[0.2em]">
                {isSubmitting ? 'Submitting...' : 'Submit Request →'}
             </button>
             
             <button type="button" onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white font-bold">Not you? Search again</button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-16 fade-up">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Request Sent</h3>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
              Host notified. Please wait for approval.
            </p>
            <Link href="/" className="inline-block mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 hover:text-white transition-all">
              Return to Home
            </Link>
          </div>
        )}
      </GlassCard>
    </main>
  );
}
