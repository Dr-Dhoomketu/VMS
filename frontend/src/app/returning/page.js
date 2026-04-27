'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ValueTechLogo from '@/components/ValueTechLogo';

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
    <main className="min-h-screen flex flex-col bg-[#050505] theme-coffee:bg-[#fbfbfd] text-white theme-coffee:text-[#1d1d1f] relative dot-bg">
      {/* Navbar - matches check-in page */}
      <nav className="relative z-50 flex justify-between items-center px-10 py-8 border-b border-white/5 theme-coffee:border-black/5 backdrop-blur-sm">
        <ValueTechLogo className="h-[60px] w-auto" />
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Close button */}
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-gray-500 hover:text-white theme-coffee:hover:text-black text-[10px] uppercase tracking-[0.2em] font-bold transition-colors group">
            <span className="w-8 h-8 rounded-full border border-white/10 theme-coffee:border-black/10 flex items-center justify-center group-hover:bg-white/10 theme-coffee:group-hover:bg-black/5 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
            Close
          </Link>

          {step === 1 && (
            <div className="fade-up">
              <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] theme-coffee:bg-white border border-white/[0.07] theme-coffee:border-black/[0.07] p-8 shadow-[0_4px_40px_rgba(0,0,0,0.4)] theme-coffee:shadow-[0_4px_40px_rgba(0,0,0,0.04)]">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/40 theme-coffee:from-black/20 to-transparent" />
                <form onSubmit={handleSearch} className="space-y-8 py-4">
                  <div className="text-center">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Returning Visitor</h2>
                    <p className="text-gray-500 theme-coffee:text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Please enter your registered number</p>
                  </div>
                  
                  {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest p-4 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</p>}
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">Mobile Number</label>
                    <input required type="tel" className="w-full" 
                      value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 ..." />
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 text-xs font-black tracking-[0.2em]">
                    Search Records →
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up">
              <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] theme-coffee:bg-white border border-white/[0.07] theme-coffee:border-black/[0.07] p-8 shadow-[0_4px_40px_rgba(0,0,0,0.4)] theme-coffee:shadow-[0_4px_40px_rgba(0,0,0,0.04)]">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/40 theme-coffee:from-black/20 to-transparent" />
                <form onSubmit={handleCheckIn} className="space-y-8 text-center py-4">
                  <div className="text-center">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Record Found</h2>
                    <p className="text-gray-500 theme-coffee:text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Welcome back!</p>
                  </div>

                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-white/10 theme-coffee:border-black/10 shadow-2xl theme-coffee:shadow-lg">
                    <img src={visitorData?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${visitorData.imageUrl}` : "https://via.placeholder.com/150"} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Hello, {visitorData?.name}</h3>
                    <p className="text-gray-500 theme-coffee:text-gray-400 text-[10px] uppercase tracking-widest font-bold">Please confirm your visit details</p>
                  </div>
                  
                  <div className="text-left space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">Who are you meeting?</label>
                      <select required className="w-full" value={formData.meetWith} onChange={e => setFormData({...formData, meetWith: e.target.value})}>
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">Purpose of Visit</label>
                      <input required type="text" className="w-full" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">Check-In Time</label>
                        <input required type="time" className="w-full" value={formData.fromTime} onChange={e => setFormData({...formData, fromTime: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">Duration</label>
                        <input type="text" className="w-full" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 1hr" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-xs font-black tracking-[0.2em]">
                    {isSubmitting ? 'Submitting...' : 'Submit Request →'}
                  </button>
                  
                  <button type="button" onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white theme-coffee:hover:text-black font-bold transition-colors">Not you? Search again</button>
                </form>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16 fade-up">
              <div className="w-28 h-28 rounded-full bg-white/5 theme-coffee:bg-black/5 border border-white/10 theme-coffee:border-black/10 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(255,255,255,0.05)] theme-coffee:shadow-lg">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="caption mb-4 text-gray-600">Request dispatched</p>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">Request Sent</h3>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                Host notified. Please wait for approval.
              </p>
              <Link href="/" className="inline-block mt-12 btn-primary py-4 px-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em]">
                Return to Home
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
