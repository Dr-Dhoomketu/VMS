import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { API_URL } from '@/lib/api';
import GeoBackground from '@/components/GeoBackground';

interface Employee { _id: string; name: string; }

// Generate time slots every 15 min, 7 AM – 9 PM
function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 7; h <= 21; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 21 && m > 0) break;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

function formatTimeSlot(val: string) {
  if (!val) return '';
  const [h, m] = val.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ap}`;
}

function QuickTimePicker({
  value, onChange, placeholder = 'Select time', disabled = false,
}: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; }) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setCustomMode(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => { if (!disabled) { setOpen(!open); setCustomMode(false); } }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px',
          background: disabled ? '#F8FAFC' : '#fff',
          fontSize: '0.875rem', color: disabled ? '#A0AEC0' : (value ? '#0A1F44' : '#A0AEC0'),
          userSelect: 'none', opacity: disabled ? 0.6 : 1,
        }}
      >
        <svg style={{ width: '14px', height: '14px', color: '#6B7FA3', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span style={{ flex: 1 }}>{value ? formatTimeSlot(value) : placeholder}</span>
        <svg style={{ width: '12px', height: '12px', color: '#A0AEC0', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300, minWidth: '280px',
          background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0',
          boxShadow: '0 20px 60px rgba(10,31,68,0.14)', overflow: 'hidden',
        }}>
          {!customMode ? (
            <>
              <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '0.52rem', fontWeight: 800, color: '#6B7FA3', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Quick Select</span>
              </div>
              <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button"
                    onClick={() => { onChange(slot); setOpen(false); }}
                    style={{
                      padding: '7px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: value === slot ? 800 : 500,
                      background: value === slot ? '#0A1F44' : 'transparent',
                      color: value === slot ? '#fff' : '#0A1F44', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (value !== slot) (e.currentTarget as HTMLElement).style.background = '#F4F7FC'; }}
                    onMouseLeave={e => { if (value !== slot) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {formatTimeSlot(slot)}
                  </button>
                ))}
              </div>
              <div style={{ padding: '8px 8px 10px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setCustomMode(true)} style={{
                  width: '100%', padding: '8px', borderRadius: '8px', border: '1px dashed #E2E8F0',
                  background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#2F5DAA',
                }}>+ Enter custom time</button>
              </div>
            </>
          ) : (
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.52rem', fontWeight: 800, color: '#6B7FA3', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '10px' }}>Custom Time</div>
              <input type="time" value={value} autoFocus onChange={e => onChange(e.target.value)} style={{ width: '100%', fontSize: '1rem', fontWeight: 700 }}/>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setCustomMode(false)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#6B7FA3' }}>← Back</button>
                <button type="button" onClick={() => { setOpen(false); setCustomMode(false); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#0A1F44', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>Done</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', address: '',
    meetWith: '', purpose: '', scheduledTime: '', visitorStatus: '',
    fromTime: '', toTime: '', duration: '',
  });
  const [flexibleEnd, setFlexibleEnd] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/users/employees`).then(r => r.json()).then(d => setEmployees(d)).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFlexibleToggle = () => {
    setFlexibleEnd(prev => {
      if (!prev) setFormData(f => ({ ...f, toTime: 'Flexible' }));
      else setFormData(f => ({ ...f, toTime: '' }));
      return !prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsSubmitting(true);
    try {
      const payload = { ...formData, toTime: flexibleEnd ? 'Flexible / Open-ended' : formData.toTime };
      const res = await fetch(`${API_URL}/api/v1/visits/request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
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

            {/* Personal Info */}
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

            {/* Appointment Details */}
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

                {/* From Time */}
                <div>
                  <label className="vp-label">From Time</label>
                  <QuickTimePicker
                    value={formData.fromTime}
                    onChange={v => setFormData(f => ({ ...f, fromTime: v }))}
                    placeholder="Start time"
                  />
                </div>

                {/* To Time with flexible toggle */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="vp-label" style={{ margin: 0 }}>To Time</label>
                    <button
                      type="button"
                      onClick={handleFlexibleToggle}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.62rem', fontWeight: 700,
                        border: `1.5px solid ${flexibleEnd ? '#0A1F44' : '#E2E8F0'}`,
                        background: flexibleEnd ? '#0A1F44' : 'transparent',
                        color: flexibleEnd ? '#fff' : '#6B7FA3',
                        transition: 'all 0.2s',
                      }}
                    >
                      <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Flexible end
                    </button>
                  </div>

                  {flexibleEnd ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px 14px', borderRadius: '10px',
                      border: '1.5px solid rgba(10,31,68,0.15)', background: 'rgba(10,31,68,0.03)',
                    }}>
                      <svg style={{ width: '14px', height: '14px', color: '#0A1F44', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A1F44' }}>Open / Flexible end time</span>
                    </div>
                  ) : (
                    <QuickTimePicker
                      value={formData.toTime}
                      onChange={v => setFormData(f => ({ ...f, toTime: v }))}
                      placeholder="End time"
                    />
                  )}

                  {!flexibleEnd && (
                    <p style={{ fontSize: '0.6rem', color: '#A0AEC0', marginTop: '6px', fontStyle: 'italic' }}>
                      Toggle "Flexible end" if the meeting may run over
                    </p>
                  )}
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
                onClick={() => { setFormData({ name:'',email:'',phone:'',gender:'',address:'',meetWith:'',purpose:'',scheduledTime:'',visitorStatus:'',fromTime:'',toTime:'',duration:'' }); setFlexibleEnd(false); }}
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
