'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ValueTechLogo from '@/components/ValueTechLogo';

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/users/employees`);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/visits/request`, {
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

  const sectionCard = "relative overflow-hidden rounded-3xl bg-white/[0.03] theme-coffee:bg-white border border-white/[0.07] theme-coffee:border-black/[0.07] p-8 shadow-[0_4px_40px_rgba(0,0,0,0.4)] theme-coffee:shadow-[0_4px_40px_rgba(0,0,0,0.04)]";
  const labelCls = "block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2";

  return (
    <main className="min-h-screen flex flex-col bg-[#050505] theme-coffee:bg-[#fbfbfd] text-white theme-coffee:text-[#1d1d1f] relative dot-bg">
      {/* Navbar - matches check-in page */}
      <nav className="relative z-50 flex justify-between items-center px-10 py-8 border-b border-white/5 theme-coffee:border-black/5 backdrop-blur-sm">
        <ValueTechLogo className="h-[60px] w-auto" />
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center py-16 px-6">
        <div className="w-full max-w-4xl">
          {/* Close button */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-gray-500 hover:text-white theme-coffee:hover:text-black text-[10px] uppercase tracking-[0.2em] font-bold transition-colors group">
            <span className="w-8 h-8 rounded-full border border-white/10 theme-coffee:border-black/10 flex items-center justify-center group-hover:bg-white/10 theme-coffee:group-hover:bg-black/5 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
            Close
          </Link>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-10 fade-up">
              <div className="text-center mb-12">
                <p className="caption mb-4 text-gray-600">Schedule Your Visit</p>
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none">Book<br />Appointment</h1>
              </div>

              {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest p-4 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</p>}

              <div className="space-y-10">
                {/* Personal Information Section */}
                <div className={sectionCard}>
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/40 theme-coffee:from-black/20 to-transparent" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                      <input required name="name" onChange={handleChange} type="text" className="w-full" placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Email Address</label>
                      <input required name="email" onChange={handleChange} type="email" className="w-full" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
                      <input required name="phone" onChange={handleChange} type="tel" className="w-full" placeholder="e.g. 555-0123" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Gender</label>
                      <select required name="gender" onChange={handleChange} className="w-full">
                        <option value="">-- Select --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className={labelCls}>Address</label>
                      <input required name="address" onChange={handleChange} type="text" className="w-full" placeholder="Street, City" />
                    </div>
                  </div>
                </div>

                {/* Appointment Details Section */}
                <div className={sectionCard} style={{ overflow: 'visible' }}>
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/20 theme-coffee:from-black/10 to-transparent" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelCls}>Who are you meeting? <span className="text-red-500">*</span></label>
                      <select required name="meetWith" className="w-full" value={formData.meetWith} onChange={handleChange}>
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Appointment Date <span className="text-red-500">*</span></label>
                      <input required name="scheduledTime" onChange={handleChange} type="date" className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>From Time</label>
                      <input required name="fromTime" onChange={handleChange} type="time" className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>To Time</label>
                      <input required name="toTime" onChange={handleChange} type="time" className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Purpose of Visit <span className="text-red-500">*</span></label>
                      <input required name="purpose" onChange={handleChange} type="text" className="w-full" placeholder="Interview, Meeting, etc." />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Status</label>
                      <select name="visitorStatus" className="w-full" value={formData.visitorStatus} onChange={handleChange}>
                        <option value="">-- Select --</option>
                        <option value="New">New Visitor</option>
                        <option value="Returning">Returning Visitor</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Duration (Hours)</label>
                      <input name="duration" onChange={handleChange} type="text" className="w-full" placeholder="e.g. 1.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-5 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl shadow-white/5 theme-coffee:shadow-black/5">
                  {isSubmitting ? 'Requesting...' : 'Confirm Appointment →'}
                </button>
                <button type="button" onClick={handleClear} className="px-8 py-5 rounded-2xl border border-white/10 theme-coffee:border-black/10 bg-white/5 theme-coffee:bg-black/5 hover:bg-white/10 theme-coffee:hover:bg-black/10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 theme-coffee:text-gray-500 hover:text-white theme-coffee:hover:text-black transition-all">
                  Clear
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-20 fade-up flex flex-col items-center gap-10">
              <div className="w-28 h-28 rounded-full bg-white/5 theme-coffee:bg-black/5 border border-white/10 theme-coffee:border-black/10 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.05)] theme-coffee:shadow-lg">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <p className="caption mb-4 text-gray-600">Request dispatched</p>
                <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none">Request Sent</h2>
              </div>
              <p className="text-gray-500 font-light text-sm leading-relaxed max-w-sm mx-auto">
                Your request has been sent for approval. <br /><br />
                You will receive an email once confirmed.
              </p>
              <Link href="/" className="btn-primary py-5 px-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-white/5 theme-coffee:shadow-black/5">
                Return to Home
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
