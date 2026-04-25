'use client';
import { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import Link from 'next/link';

export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', address: '',
    meetWith: '', purpose: '', scheduledTime: '', visitorStatus: '',
    fromTime: '', toTime: '', duration: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}`}/api/v1/users/employees`);
      const data = await res.json();
      if (res.ok) setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleClear = () => setFormData({
    name: '', email: '', phone: '', gender: '', address: '',
    meetWith: '', purpose: '', scheduledTime: '', visitorStatus: '',
    fromTime: '', toTime: '', duration: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}`}/api/v1/visits/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.message || 'Submission failed');
      }
    } catch (err) {
      setError('Connection failed');
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

      <GlassCard className="w-full max-w-4xl" hoverEffect={false}>
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-12 fade-up py-4">
            <div className="text-center">
              <h2 className="text-5xl font-black tracking-tighter uppercase text-white">Book Appointment</h2>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-bold mt-2">Schedule your visit in advance</p>
            </div>

            {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest p-4 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</p>}

            <div className="space-y-10">
              {/* Personal Information Section */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8 flex items-center gap-2">
                  PERSONAL INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Full Name</label>
                    <input required name="name" onChange={handleChange} type="text" className="w-full" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Email Address</label>
                    <input required name="email" onChange={handleChange} type="email" className="w-full" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Mobile Number</label>
                    <input required name="phone" onChange={handleChange} type="tel" className="w-full" placeholder="e.g. 555-0123" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Gender</label>
                    <select required name="gender" onChange={handleChange} className="w-full">
                      <option value="">-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Address</label>
                    <input required name="address" onChange={handleChange} type="text" className="w-full" placeholder="Street, City" />
                  </div>
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 mb-8 flex items-center gap-2">
                  APPOINTMENT DETAILS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Who are you meeting?</label>
                    <select required name="meetWith" className="w-full" value={formData.meetWith} onChange={handleChange}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Appointment Date</label>
                    <input required name="scheduledTime" onChange={handleChange} type="date" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">From Time</label>
                    <input required name="fromTime" onChange={handleChange} type="time" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">To Time</label>
                    <input required name="toTime" onChange={handleChange} type="time" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Purpose of Visit <span className="text-red-500">*</span></label>
                    <input required name="purpose" onChange={handleChange} type="text" className="w-full" placeholder="Interview, Meeting, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Status</label>
                    <select name="visitorStatus" className="w-full" value={formData.visitorStatus} onChange={handleChange}>
                      <option value="">-- Select --</option>
                      <option value="New">New Visitor</option>
                      <option value="Returning">Returning Visitor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Duration (Hours)</label>
                    <input name="duration" onChange={handleChange} type="text" className="w-full" placeholder="e.g. 1.5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-5 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl shadow-blue-500/20">
                {isSubmitting ? 'Requesting...' : 'Confirm Appointment →'}
              </button>
              <button type="button" onClick={handleClear} className="px-8 py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white transition-all">
                Clear
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-16 fade-up">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Request Sent</h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
              Your request has been sent for approval. <br /><br />
              You will receive an email once confirmed.
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
