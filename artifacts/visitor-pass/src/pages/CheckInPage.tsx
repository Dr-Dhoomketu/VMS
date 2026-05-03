import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-easy-crop';
import { Link } from 'wouter';
import { API_URL } from '@/lib/api';
import GeoBackground from '@/components/GeoBackground';

interface Employee { _id: string; name: string; }
interface CropArea { x: number; y: number; width: number; height: number; }

const COUNTRIES = [
  {code:'+91',flag:'🇮🇳',name:'India'},{code:'+1',flag:'🇺🇸',name:'USA'},{code:'+44',flag:'🇬🇧',name:'UK'},
  {code:'+61',flag:'🇦🇺',name:'Australia'},{code:'+1',flag:'🇨🇦',name:'Canada'},{code:'+971',flag:'🇦🇪',name:'UAE'},
  {code:'+966',flag:'🇸🇦',name:'Saudi Arabia'},{code:'+65',flag:'🇸🇬',name:'Singapore'},{code:'+60',flag:'🇲🇾',name:'Malaysia'},
  {code:'+49',flag:'🇩🇪',name:'Germany'},{code:'+33',flag:'🇫🇷',name:'France'},{code:'+39',flag:'🇮🇹',name:'Italy'},
  {code:'+34',flag:'🇪🇸',name:'Spain'},{code:'+31',flag:'🇳🇱',name:'Netherlands'},{code:'+7',flag:'🇷🇺',name:'Russia'},
  {code:'+86',flag:'🇨🇳',name:'China'},{code:'+81',flag:'🇯🇵',name:'Japan'},{code:'+82',flag:'🇰🇷',name:'South Korea'},
  {code:'+55',flag:'🇧🇷',name:'Brazil'},{code:'+52',flag:'🇲🇽',name:'Mexico'},{code:'+27',flag:'🇿🇦',name:'South Africa'},
  {code:'+234',flag:'🇳🇬',name:'Nigeria'},{code:'+20',flag:'🇪🇬',name:'Egypt'},{code:'+254',flag:'🇰🇪',name:'Kenya'},
  {code:'+62',flag:'🇮🇩',name:'Indonesia'},{code:'+63',flag:'🇵🇭',name:'Philippines'},{code:'+66',flag:'🇹🇭',name:'Thailand'},
  {code:'+84',flag:'🇻🇳',name:'Vietnam'},{code:'+880',flag:'🇧🇩',name:'Bangladesh'},{code:'+92',flag:'🇵🇰',name:'Pakistan'},
  {code:'+94',flag:'🇱🇰',name:'Sri Lanka'},{code:'+977',flag:'🇳🇵',name:'Nepal'},{code:'+964',flag:'🇮🇶',name:'Iraq'},
  {code:'+98',flag:'🇮🇷',name:'Iran'},{code:'+90',flag:'🇹🇷',name:'Turkey'},{code:'+48',flag:'🇵🇱',name:'Poland'},
  {code:'+46',flag:'🇸🇪',name:'Sweden'},{code:'+47',flag:'🇳🇴',name:'Norway'},{code:'+45',flag:'🇩🇰',name:'Denmark'},
  {code:'+358',flag:'🇫🇮',name:'Finland'},{code:'+41',flag:'🇨🇭',name:'Switzerland'},{code:'+43',flag:'🇦🇹',name:'Austria'},
  {code:'+32',flag:'🇧🇪',name:'Belgium'},{code:'+351',flag:'🇵🇹',name:'Portugal'},{code:'+30',flag:'🇬🇷',name:'Greece'},
  {code:'+64',flag:'🇳🇿',name:'New Zealand'},{code:'+353',flag:'🇮🇪',name:'Ireland'},{code:'+972',flag:'🇮🇱',name:'Israel'},
  {code:'+852',flag:'🇭🇰',name:'Hong Kong'},
];

// Generate time slots every 15 min from 7:00 AM to 9:00 PM
function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 7; h <= 21; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 21 && m > 0) break;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
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
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

function QuickTimePicker({ value, onChange, placeholder = 'Select time' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setCustomMode(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => { setOpen(!open); setCustomMode(false); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px',
          background: '#fff', fontSize: '0.875rem', color: value ? '#0A1F44' : '#A0AEC0',
          userSelect: 'none', transition: 'border-color 0.2s',
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

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300, minWidth: '280px',
          background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0',
          boxShadow: '0 20px 60px rgba(10,31,68,0.14)', overflow: 'hidden',
        }}>
          {/* Quick grid */}
          {!customMode && (
            <>
              <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '0.52rem', fontWeight: 800, color: '#6B7FA3', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Quick Select</span>
              </div>
              <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => { onChange(slot); setOpen(false); }}
                    style={{
                      padding: '7px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: value === slot ? 800 : 500,
                      background: value === slot ? '#0A1F44' : 'transparent',
                      color: value === slot ? '#fff' : '#0A1F44',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (value !== slot) (e.currentTarget as HTMLElement).style.background = '#F4F7FC'; }}
                    onMouseLeave={e => { if (value !== slot) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {formatTimeSlot(slot)}
                  </button>
                ))}
              </div>
              <div style={{ padding: '8px 8px 10px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '8px', border: '1px dashed #E2E8F0',
                    background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#2F5DAA',
                  }}
                >
                  + Enter custom time
                </button>
              </div>
            </>
          )}

          {/* Custom time input */}
          {customMode && (
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.52rem', fontWeight: 800, color: '#6B7FA3', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '10px' }}>Custom Time</div>
              <input
                type="time"
                value={value}
                autoFocus
                onChange={e => onChange(e.target.value)}
                style={{ width: '100%', fontSize: '1rem', fontWeight: 700 }}
              />
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

// Duration quick-select
const DURATION_OPTIONS = [
  { label: '30 min', value: '30 min' },
  { label: '45 min', value: '45 min' },
  { label: '1 hr',   value: '1 hr' },
  { label: '1.5 hr', value: '1.5 hr' },
  { label: '2 hr',   value: '2 hr' },
  { label: '3 hr',   value: '3 hr' },
  { label: 'Half day', value: 'Half day' },
  { label: 'Full day', value: 'Full day' },
  { label: 'Open-ended', value: 'Open-ended' },
];

function DurationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '6px' }}>
      {DURATION_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          style={{
            padding: '7px 13px', borderRadius: '20px', border: '1.5px solid',
            borderColor: value === opt.value ? '#0A1F44' : '#E2E8F0',
            background: value === opt.value ? '#0A1F44' : '#fff',
            color: value === opt.value ? '#fff' : '#6B7FA3',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.18s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function getCroppedImg(imageSrc: string, croppedAreaPixels: CropArea): Promise<File> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
      canvas.toBlob(blob => resolve(new File([blob!], 'photo.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.9);
    };
  });
}

function isLight(hex: string) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 128;
}

function CountryCodePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 10px',
        border: '1.5px solid #E2E8F0', borderRadius: '10px 0 0 10px', borderRight: 'none',
        background: '#F8FAFC', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#0A1F44', whiteSpace: 'nowrap',
      }}>
        {selected.flag} {value}
        <svg style={{ width: '10px', height: '10px', color: '#6B7FA3', marginLeft: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
          boxShadow: '0 16px 48px rgba(10,31,68,0.14)', width: '240px', overflow: 'hidden',
        }}>
          <div style={{ padding: '10px' }}>
            <input placeholder="Search country..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px' }} autoFocus/>
          </div>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filtered.map((c, i) => (
              <button key={i} type="button" onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px',
                border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFC'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>{c.flag}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0A1F44', flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#6B7FA3' }}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckInPage() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [countryCode, setCountryCode] = useState('+91');
  const [badgeColor, setBadgeColor] = useState('#2F5DAA');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', address: '', nationality: '',
    aadhar: '', meetWith: '', purpose: '', fromTime: '', duration: '',
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<File | null>(null);
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/users/employees`).then(r => r.json()).then(d => setEmployees(d)).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const capturePhoto = useCallback(() => {
    const img = webcamRef.current?.getScreenshot();
    if (img) { setPhoto(img); setShowCamera(false); setCameraError(''); }
  }, []);

  const onCropComplete = useCallback((_: unknown, area: CropArea) => setCroppedArea(area), []);

  const confirmCrop = async () => {
    if (!photo || !croppedArea) return;
    const file = await getCroppedImg(photo, croppedArea);
    setCroppedPhoto(file);
    setCroppedPhotoUrl(URL.createObjectURL(file));
    setPhoto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries({ ...formData, phone: `${countryCode}${formData.phone}`, badgeColor }).forEach(([k, v]) => payload.append(k, v));
      if (croppedPhoto) payload.append('photo', croppedPhoto);
      const res = await fetch(`${API_URL}/api/v1/visits/request`, { method: 'POST', body: payload });
      if (res.ok) setStep(3);
      else { const d = await res.json(); setError(d.message || 'Submission failed'); }
    } catch { setError('Connection failed'); }
    finally { setIsSubmitting(false); }
  };

  const STEPS = [
    { n: 1, label: 'Personal Info' },
    { n: 2, label: 'Visit Details' },
    { n: 3, label: 'Confirmed' },
  ];

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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEPS.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step >= s.n ? '#0A1F44' : 'rgba(10,31,68,0.06)',
                      border: step === s.n ? '2px solid #2F5DAA' : 'none',
                      fontSize: '0.7rem', fontWeight: 800,
                      color: step >= s.n ? '#ffffff' : '#6B7FA3',
                      transition: 'all 0.3s ease',
                    }}>
                      {step > s.n ? '✓' : s.n}
                    </div>
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, color: step >= s.n ? '#0A1F44' : '#6B7FA3', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: '1px', background: step > s.n ? '#0A1F44' : '#E2E8F0', margin: '0 8px', marginBottom: '22px', transition: 'background 0.3s' }}/>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo crop overlay */}
        {photo && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: '#0A1F44', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Crop Photo</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Pinch or scroll to zoom</span>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <Cropper image={photo} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} cropShape="round"/>
            </div>
            <div style={{ padding: '20px', display: 'flex', gap: '12px', justifyContent: 'center', background: '#0A1F44' }}>
              <button onClick={() => setPhoto(null)} style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Cancel</button>
              <button onClick={confirmCrop} className="btn-vp-primary">Use This Photo</button>
            </div>
          </div>
        )}

        {/* Camera overlay */}
        {showCamera && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: '#0A1F44', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
              {cameraError ? (
                <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg style={{ width: '28px', height: '28px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>Camera access denied</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '28px' }}>
                    Please allow camera access in your browser settings and try again. Camera is required for walk-in check-in.
                  </p>
                  <button
                    onClick={() => { setCameraError(''); setShowCamera(true); }}
                    className="btn-vp-primary"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}
                  >
                    Try Again
                  </button>
                  <button onClick={() => { setShowCamera(false); setCameraError(''); }} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.75rem' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: 'user', width: 440, height: 440 }}
                      style={{ width: '100%', display: 'block' }}
                      onUserMediaError={(err) => {
                        console.error('Camera error:', err);
                        setCameraError(String(err));
                      }}
                    />
                    {/* Overlay guide circle */}
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                      <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)' }}/>
                    </div>
                  </div>
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: '10px' }}>Position your face within the circle</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button onClick={() => { setShowCamera(false); setCameraError(''); }} style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Cancel</button>
                    <button onClick={capturePhoto} className="btn-vp-primary" style={{ flex: 2, justifyContent: 'center' }}>
                      <svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="4" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      </svg>
                      Take Photo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '8px' }}>New Visitor</p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44' }}>Check In</h1>
            </div>

            {error && <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '20px' }}>{error}</div>}

            <div className="lux-card" style={{ padding: '32px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#6B7FA3', marginBottom: '24px' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>

                {/* Photo capture — camera only for walk-in */}
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
                    border: '2px dashed rgba(47,93,170,0.25)', background: 'rgba(47,93,170,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {croppedPhotoUrl ? (
                      <img src={croppedPhotoUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <svg style={{ width: '28px', height: '28px', color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCameraError(''); setShowCamera(true); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '9px 20px', borderRadius: '8px', border: '1.5px solid rgba(47,93,170,0.2)',
                      background: 'rgba(47,93,170,0.05)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: '#2F5DAA',
                    }}
                  >
                    <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {croppedPhotoUrl ? 'Retake Photo' : 'Take Photo'}
                  </button>
                  {croppedPhotoUrl && (
                    <button type="button" onClick={() => { setCroppedPhoto(null); setCroppedPhotoUrl(null); }} style={{ fontSize: '0.62rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Remove photo
                    </button>
                  )}
                </div>

                <div>
                  <label className="vp-label">Full Name *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="John Doe"/>
                </div>
                <div>
                  <label className="vp-label">Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@example.com"/>
                </div>
                <div>
                  <label className="vp-label">Mobile Number *</label>
                  <div style={{ display: 'flex' }}>
                    <CountryCodePicker value={countryCode} onChange={setCountryCode}/>
                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="9876543210" style={{ borderRadius: '0 10px 10px 0', borderLeft: 'none' }}/>
                  </div>
                </div>
                <div>
                  <label className="vp-label">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="vp-label">Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Street, City"/>
                </div>
                <div>
                  <label className="vp-label">Nationality</label>
                  <input name="nationality" value={formData.nationality} onChange={handleChange} type="text" placeholder="Indian"/>
                </div>
                <div>
                  <label className="vp-label">Aadhar / ID No.</label>
                  <input name="aadhar" value={formData.aadhar} onChange={handleChange} type="text" placeholder="XXXX-XXXX-XXXX"/>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="vp-label">Badge Color</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {['#2F5DAA','#0A1F44','#1e7e34','#c0392b','#7d3c98','#b7950b','#1a5276','#117a65'].map(c => (
                      <button key={c} type="button" onClick={() => setBadgeColor(c)} style={{
                        width: '28px', height: '28px', borderRadius: '50%', background: c,
                        border: badgeColor === c ? `3px solid ${isLight(c) ? '#333' : '#fff'}` : '2px solid transparent',
                        cursor: 'pointer', outline: badgeColor === c ? `2px solid ${c}` : 'none', outlineOffset: '2px',
                      }}/>
                    ))}
                    <input type="color" value={badgeColor} onChange={e => setBadgeColor(e.target.value)} style={{ width: '28px', height: '28px', padding: 0, border: '1px solid #E2E8F0', borderRadius: '50%', cursor: 'pointer', overflow: 'hidden' }}/>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setStep(2)} className="btn-vp-primary" style={{ width: '100%', padding: '15px', justifyContent: 'center', fontSize: '0.7rem' }}>
              Continue to Visit Details →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '8px' }}>Step 2 of 2</p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44' }}>Visit Details</h1>
            </div>

            {error && <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '20px' }}>{error}</div>}

            <div className="lux-card" style={{ padding: '32px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#6B7FA3', marginBottom: '24px' }}>Appointment Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="vp-label">Who are you meeting? *</label>
                  <select required name="meetWith" value={formData.meetWith} onChange={handleChange}>
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="vp-label">Purpose of Visit *</label>
                  <input required name="purpose" value={formData.purpose} onChange={handleChange} type="text" placeholder="Meeting, Interview, Delivery..."/>
                </div>
                <div>
                  <label className="vp-label">Check-In Time</label>
                  <QuickTimePicker value={formData.fromTime} onChange={v => setFormData(f => ({ ...f, fromTime: v }))} placeholder="Select time"/>
                </div>
                <div>
                  <label className="vp-label">Expected Duration</label>
                  <DurationPicker value={formData.duration} onChange={v => setFormData(f => ({ ...f, duration: v }))}/>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-vp-secondary" style={{ padding: '14px 24px', fontSize: '0.7rem' }}>← Back</button>
              <button type="submit" disabled={isSubmitting} className="btn-vp-primary" style={{ flex: 1, padding: '15px', justifyContent: 'center', fontSize: '0.7rem' }}>
                {isSubmitting ? 'Submitting...' : 'Submit Request →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 — Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }} className="fade-up">
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
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#0A1F44', marginBottom: '16px' }}>You're Checked In</h2>
            <p style={{ color: '#6B7FA3', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto 40px' }}>
              Your visit request has been submitted. Your host has been notified and will approve shortly.
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
