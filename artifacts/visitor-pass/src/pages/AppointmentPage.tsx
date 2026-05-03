import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { API_URL } from '@/lib/api';
import GeoBackground from '@/components/GeoBackground';

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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '10px' }}>Schedule Your Visit</p>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44', lineHeight: 1 }}>
                Book Appointment
              </h1>
            </div>

            {error && <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '24px' }}>{error}</div>}

            <div className="lux-card" style={{ padding: '36px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#6B7FA3', marginBottom: '24px' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <label className="vp-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="John Doe"/>
                </div>
                <div>
                  <label className="vp-label">Email Address</label>
                  <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@example.com"/>
                </div>
                <div>
                  <label className="vp-label">Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+91 9876 543 210"/>
                </div>
                <div>
                  <label className="vp-label">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="vp-label">Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Street, City"/>
                </div>
              </div>
            </div>

            <div className="lux-card" style={{ padding: '36px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#6B7FA3', marginBottom: '24px' }}>Appointment Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <label className="vp-label">Who are you meeting? <span style={{ color: '#ef4444' }}>*</span></label>
                  <select required name="meetWith" value={formData.meetWith} onChange={handleChange}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="vp-label">Appointment Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} type="date"/>
                </div>
                <div>
                  <label className="vp-label">From Time</label>
                  <input name="fromTime" value={formData.fromTime} onChange={handleChange} type="time"/>
                </div>
                <div>
                  <label className="vp-label">To Time</label>
                  <input name="toTime" value={formData.toTime} onChange={handleChange} type="time"/>
                </div>
                <div>
                  <label className="vp-label">Purpose of Visit <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required name="purpose" value={formData.purpose} onChange={handleChange} type="text" placeholder="Interview, Meeting, etc."/>
                </div>
                <div>
                  <label className="vp-label">Visitor Status</label>
                  <select name="visitorStatus" value={formData.visitorStatus} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    <option value="New">New Visitor</option>
                    <option value="Returning">Returning Visitor</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={isSubmitting} className="btn-vp-primary" style={{ flex: 1, padding: '15px', justifyContent: 'center', fontSize: '0.72rem' }}>
                {isSubmitting ? 'Requesting...' : 'Confirm Appointment →'}
              </button>
              <button type="button"
                onClick={() => setFormData({ name:'',email:'',phone:'',gender:'',address:'',meetWith:'',purpose:'',scheduledTime:'',visitorStatus:'',fromTime:'',toTime:'',duration:'' })}
                className="btn-vp-secondary" style={{ padding: '14px 28px', fontSize: '0.72rem' }}>
                Clear
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '60px' }} className="fade-up">
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(22,163,74,0.08)', border: '2px solid rgba(22,163,74,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px',
            }}>
              <svg style={{ width: '36px', height: '36px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '12px' }}>Request Dispatched</p>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44', marginBottom: '16px' }}>Appointment Booked</h2>
            <p style={{ color: '#6B7FA3', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto 40px' }}>
              Your appointment request has been submitted for approval. You will receive a confirmation once approved.
            </p>
            <Link href="/">
              <button className="btn-vp-primary" style={{ padding: '14px 40px', fontSize: '0.7rem' }}>Return to Home</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
