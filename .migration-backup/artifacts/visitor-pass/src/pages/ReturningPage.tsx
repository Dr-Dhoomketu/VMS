import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { API_URL } from '@/lib/api';
import GeoBackground from '@/components/GeoBackground';

interface Employee { _id: string; name: string; }
interface Visitor { name: string; phone: string; email?: string; aadhar?: string; imageUrl?: string; }

export default function ReturningPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const [visitorData, setVisitorData] = useState<Visitor | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ meetWith: '', purpose: '', fromTime: '', duration: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/users/employees`)
      .then(r => r.json()).then(d => setEmployees(d)).catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/history?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (res.ok) {
        setVisitorData(data.visitor);
        if (data.lastVisit) setFormData(f => ({ ...f, meetWith: data.lastVisit.meetWith?._id || '', purpose: data.lastVisit.purpose || '' }));
        setStep(2);
      } else { setError(data.message || 'Mobile number not found in our records'); }
    } catch { setError('Connection error'); }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setError('');
    try {
      const fd = new FormData();
      if (visitorData?.name) fd.append('name', visitorData.name);
      if (visitorData?.phone) fd.append('phone', visitorData.phone);
      if (visitorData?.email) fd.append('email', visitorData.email);
      if (visitorData?.aadhar) fd.append('aadhar', visitorData.aadhar);
      Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const res = await fetch(`${API_URL}/api/v1/visits/request`, { method: 'POST', body: fd });
      if (res.ok) setStep(3);
      else { const d = await res.json().catch(() => ({})); setError(d.message || 'Submission failed'); }
    } catch { setError('Connection error. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#0A1F44', position: 'relative' }}>
      <GeoBackground />

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(10,31,68,0.06)',
      }}>
        <img src="/vts-logo.png" alt="VISITORPASS" style={{ height: '32px', width: 'auto', objectFit: 'contain' }}/>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '0.65rem', fontWeight: 700, color: '#6B7FA3', textDecoration: 'none',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </span>
          Close
        </Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>

          {step === 1 && (
            <div className="fade-up">
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '8px' }}>Welcome Back</p>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44' }}>Returning Visitor</h1>
              </div>
              <div className="lux-card" style={{ padding: '36px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '0.78rem' }}>{error}</div>}
                  <div>
                    <label className="vp-label">Registered Mobile Number</label>
                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876 543 210"/>
                  </div>
                  <button type="submit" className="btn-vp-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '0.7rem' }}>
                    Search Records →
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up">
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '8px' }}>Record Found</p>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44' }}>Welcome Back</h1>
              </div>
              <div className="lux-card" style={{ padding: '36px' }}>
                <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '0.78rem' }}>{error}</div>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#F4F7FC', borderRadius: '12px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(47,93,170,0.15)', flexShrink: 0 }}>
                      {visitorData?.imageUrl
                        ? <img src={visitorData.imageUrl.startsWith('data:') ? visitorData.imageUrl : `${API_URL}${visitorData.imageUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : <div style={{ width: '100%', height: '100%', background: 'rgba(47,93,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#2F5DAA' }}>{visitorData?.name?.charAt(0)}</div>
                      }
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A1F44', letterSpacing: '-0.01em' }}>{visitorData?.name}</h3>
                      <p style={{ fontSize: '0.72rem', color: '#6B7FA3', fontWeight: 500 }}>{visitorData?.phone}</p>
                    </div>
                  </div>

                  <div>
                    <label className="vp-label">Who are you meeting?</label>
                    <select required value={formData.meetWith} onChange={e => setFormData({ ...formData, meetWith: e.target.value })}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="vp-label">Purpose of Visit</label>
                    <input required type="text" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} placeholder="Meeting, Interview..."/>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label className="vp-label">Check-In Time</label>
                      <input required type="time" value={formData.fromTime} onChange={e => setFormData({ ...formData, fromTime: e.target.value })}/>
                    </div>
                    <div>
                      <label className="vp-label">Duration</label>
                      <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 1hr"/>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-vp-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '0.7rem' }}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request →'}
                  </button>
                  <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7FA3', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px' }}>
                    Not you? Search again
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center' }} className="fade-up">
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(22,163,74,0.08)', border: '2px solid rgba(22,163,74,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px',
              }}>
                <svg style={{ width: '36px', height: '36px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '12px' }}>Request Dispatched</p>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44', marginBottom: '16px' }}>Request Sent</h2>
              <p style={{ color: '#6B7FA3', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '320px', margin: '0 auto 36px' }}>
                Host notified. Please wait for approval before proceeding.
              </p>
              <Link href="/">
                <button className="btn-vp-primary" style={{ padding: '14px 40px', fontSize: '0.7rem' }}>Return to Home</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
