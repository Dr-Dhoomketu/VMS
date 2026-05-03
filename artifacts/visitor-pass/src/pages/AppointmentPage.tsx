import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { API_URL } from '@/lib/api';

interface Employee { _id: string; name: string; }

export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', address: '',
    meetWith: '', purpose: '', scheduledTime: '', visitorStatus: '',
    fromTime: '', toTime: '', duration: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/users/employees`)
      .then(r => r.json()).then(d => setEmployees(d)).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) setStep(2);
      else { const d = await res.json(); setError(d.message || 'Submission failed'); }
    } catch { setError('Connection failed'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-[#0A1F44] relative dot-bg">
      <nav className="relative z-50 flex justify-between items-center px-10 py-6 border-b border-[#E2E8F0] bg-white">
        <img src="/vts-logo.png" alt="VISITORPASS" className="h-9 w-auto object-contain" style={{ width: 'auto' }} />
      </nav>

      <div className="flex-1 flex items-start justify-center py-16 px-6">
        <div className="w-full max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-[#6B7FA3] hover:text-[#0A1F44] text-[10px] uppercase tracking-[0.2em] font-bold transition-colors group">
            <span className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#F8FAFC] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </span>
            Close
          </Link>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-10 fade-up">
              <div className="text-center mb-12">
                <p className="vp-caption mb-4">Schedule Your Visit</p>
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">Book<br/>Appointment</h1>
              </div>

              {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest p-4 bg-red-50 border border-red-200 rounded-xl">{error}</p>}

              <div className="vp-section-card">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6B7FA3] mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="vp-label">Full Name <span className="text-red-500">*</span></label>
                    <input required name="name" onChange={handleChange} type="text" placeholder="e.g. John Doe"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Email Address</label>
                    <input required name="email" onChange={handleChange} type="email" placeholder="you@example.com"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Mobile Number <span className="text-red-500">*</span></label>
                    <input required name="phone" onChange={handleChange} type="tel" placeholder="e.g. 555-0123"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Gender</label>
                    <select required name="gender" onChange={handleChange}>
                      <option value="">-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="vp-label">Address</label>
                    <input required name="address" onChange={handleChange} type="text" placeholder="Street, City"/>
                  </div>
                </div>
              </div>

              <div className="vp-section-card" style={{ overflow: 'visible' }}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6B7FA3] mb-8">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="vp-label">Who are you meeting? <span className="text-red-500">*</span></label>
                    <select required name="meetWith" value={formData.meetWith} onChange={handleChange}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Appointment Date <span className="text-red-500">*</span></label>
                    <input required name="scheduledTime" onChange={handleChange} type="date"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">From Time</label>
                    <input required name="fromTime" onChange={handleChange} type="time"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">To Time</label>
                    <input required name="toTime" onChange={handleChange} type="time"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Purpose of Visit <span className="text-red-500">*</span></label>
                    <input required name="purpose" onChange={handleChange} type="text" placeholder="Interview, Meeting, etc."/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Status</label>
                    <select name="visitorStatus" value={formData.visitorStatus} onChange={handleChange}>
                      <option value="">-- Select --</option>
                      <option value="New">New Visitor</option>
                      <option value="Returning">Returning Visitor</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl">
                  {isSubmitting ? 'Requesting...' : 'Confirm Appointment →'}
                </button>
                <button type="button" onClick={() => setFormData({ name:'',email:'',phone:'',gender:'',address:'',meetWith:'',purpose:'',scheduledTime:'',visitorStatus:'',fromTime:'',toTime:'',duration:'' })}
                  className="px-8 py-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EEF3FB] text-[10px] font-black uppercase tracking-[0.4em] text-[#6B7FA3] hover:text-[#0A1F44] transition-all">
                  Clear
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-20 fade-up flex flex-col items-center gap-10">
              <div className="w-24 h-24 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <p className="vp-caption mb-4">Request dispatched</p>
                <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">Request Sent</h2>
              </div>
              <p className="text-[#6B7FA3] font-light text-sm leading-relaxed max-w-sm mx-auto">
                Your request has been sent for approval.<br/>You will receive an email once confirmed.
              </p>
              <Link href="/" className="btn-primary py-4 px-14 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px]">Return to Home</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
