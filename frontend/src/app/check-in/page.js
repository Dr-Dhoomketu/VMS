'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-easy-crop';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import ValueTechLogo from '@/components/ValueTechLogo';

// ── Custom Time Picker ────────────────────────────────────────────────────────
function TimePicker({ value, onChange, label, required }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  // Parse current value into parts
  const parsed = value
    ? (() => {
        const [h, m] = value.split(':').map(Number);
        return { hour: h % 12 === 0 ? 12 : h % 12, minute: m, ampm: h >= 12 ? 'PM' : 'AM' };
      })()
    : { hour: 12, minute: 0, ampm: 'AM' };

  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState(parsed.ampm);

  const display = value
    ? `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')} ${parsed.ampm}`
    : 'Select time';

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const emit = (h, m, ap) => {
    let h24 = h % 12;
    if (ap === 'PM') h24 += 12;
    onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const pickHour   = (h)  => { setHour(h);   emit(h, minute, ampm); };
  const pickMinute = (m)  => { setMinute(m); emit(hour, m, ampm); };
  const pickAmpm   = (ap) => { setAmpm(ap);  emit(hour, minute, ap); };

  // Theme-aware colours (always light now)
  const bg       = '#ffffff';
  const border   = 'rgba(10,31,68,0.1)';
  const shadow   = '0 24px 64px rgba(10,31,68,0.12)';
  const labelCol = '#6B7FA3';
  const trigBg   = '#ffffff';
  const trigBdr  = (o) => `1.5px solid ${o ? 'rgba(47,93,170,0.4)' : 'rgba(226,232,240,1)'}`;
  const trigCol  = value ? '#0A1F44' : '#A0AEC0';

  const btnBase = { borderRadius: 8, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', border: 'none' };
  const activeStyle   = { background: '#0A1F44', color: '#ffffff' };
  const inactiveStyle = { background: 'rgba(10,31,68,0.05)', color: '#6B7FA3' };
  const sectionLabel  = { fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: labelCol, fontWeight: 800, marginBottom: 8 };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <label className="vp-label">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Trigger button */}
      <button
        type="button" onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between"
        style={{ background: trigBg, border: trigBdr(open), borderRadius: 10, padding: '12px 16px', color: trigCol, transition: 'all 0.2s ease', fontSize: '0.875rem' }}
      >
        <span>{display}</span>
        <svg className="w-4 h-4" style={{ color: labelCol }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200, background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 16, width: '100%', boxShadow: shadow }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

            {/* Hours */}
            <div>
              <p style={sectionLabel}>Hour</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                  <button key={h} type="button" onClick={() => pickHour(h)}
                    style={{ ...btnBase, padding: '7px 4px', fontSize: '0.8rem', ...(hour === h && value ? activeStyle : inactiveStyle) }}>
                    {String(h).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <p style={sectionLabel}>Min</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[0, 15, 30, 45].map(m => (
                  <button key={m} type="button" onClick={() => pickMinute(m)}
                    style={{ ...btnBase, padding: '9px 4px', fontSize: '0.8rem', ...(minute === m && value ? activeStyle : inactiveStyle) }}>
                    {String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* AM / PM */}
            <div>
              <p style={sectionLabel}>Period</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['AM', 'PM'].map(ap => (
                  <button key={ap} type="button" onClick={() => pickAmpm(ap)}
                    style={{ ...btnBase, padding: '12px 4px', fontSize: '0.85rem', ...(ampm === ap && value ? activeStyle : inactiveStyle) }}>
                    {ap}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Confirm */}
          <button
            type="button"
            onClick={() => {
              emit(hour, minute, ampm);
              if (!value) onChange(`${String(ampm === 'PM' ? hour % 12 + 12 : hour % 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
              setOpen(false);
            }}
            style={{ marginTop: 14, width: '100%', padding: '10px', borderRadius: 8, background: '#0A1F44', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', border: 'none' }}>
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

// ── Country Code Picker ───────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'IN', name: 'India',          dial: '+91',  flag: '🇮🇳', len: [10, 10], indiaRules: true },
  { code: 'US', name: 'United States',  dial: '+1',   flag: '🇺🇸', len: [10, 10] },
  { code: 'GB', name: 'United Kingdom', dial: '+44',  flag: '🇬🇧', len: [10, 10] },
  { code: 'AE', name: 'UAE',            dial: '+971', flag: '🇦🇪', len: [9, 9]   },
  { code: 'SA', name: 'Saudi Arabia',   dial: '+966', flag: '🇸🇦', len: [9, 9]   },
  { code: 'AU', name: 'Australia',      dial: '+61',  flag: '🇦🇺', len: [9, 9]   },
  { code: 'CA', name: 'Canada',         dial: '+1',   flag: '🇨🇦', len: [10, 10] },
  { code: 'SG', name: 'Singapore',      dial: '+65',  flag: '🇸🇬', len: [8, 8]   },
  { code: 'DE', name: 'Germany',        dial: '+49',  flag: '🇩🇪', len: [10, 11] },
  { code: 'FR', name: 'France',         dial: '+33',  flag: '🇫🇷', len: [9, 9]   },
  { code: 'JP', name: 'Japan',          dial: '+81',  flag: '🇯🇵', len: [10, 11] },
  { code: 'CN', name: 'China',          dial: '+86',  flag: '🇨🇳', len: [11, 11] },
  { code: 'BR', name: 'Brazil',         dial: '+55',  flag: '🇧🇷', len: [10, 11] },
  { code: 'ZA', name: 'South Africa',   dial: '+27',  flag: '🇿🇦', len: [9, 9]   },
  { code: 'NG', name: 'Nigeria',        dial: '+234', flag: '🇳🇬', len: [10, 10] },
  { code: 'PK', name: 'Pakistan',       dial: '+92',  flag: '🇵🇰', len: [10, 10] },
  { code: 'BD', name: 'Bangladesh',     dial: '+880', flag: '🇧🇩', len: [10, 10] },
  { code: 'LK', name: 'Sri Lanka',      dial: '+94',  flag: '🇱🇰', len: [9, 9]   },
  { code: 'NP', name: 'Nepal',          dial: '+977', flag: '🇳🇵', len: [10, 10] },
  { code: 'MY', name: 'Malaysia',       dial: '+60',  flag: '🇲🇾', len: [9, 10]  },
  { code: 'ID', name: 'Indonesia',      dial: '+62',  flag: '🇮🇩', len: [9, 12]  },
  { code: 'PH', name: 'Philippines',    dial: '+63',  flag: '🇵🇭', len: [10, 10] },
  { code: 'TH', name: 'Thailand',       dial: '+66',  flag: '🇹🇭', len: [9, 9]   },
  { code: 'VN', name: 'Vietnam',        dial: '+84',  flag: '🇻🇳', len: [9, 10]  },
  { code: 'KR', name: 'South Korea',    dial: '+82',  flag: '🇰🇷', len: [9, 10]  },
  { code: 'IT', name: 'Italy',          dial: '+39',  flag: '🇮🇹', len: [9, 10]  },
  { code: 'ES', name: 'Spain',          dial: '+34',  flag: '🇪🇸', len: [9, 9]   },
  { code: 'RU', name: 'Russia',         dial: '+7',   flag: '🇷🇺', len: [10, 10] },
  { code: 'TR', name: 'Turkey',         dial: '+90',  flag: '🇹🇷', len: [10, 10] },
  { code: 'MX', name: 'Mexico',         dial: '+52',  flag: '🇲🇽', len: [10, 10] },
  { code: 'AR', name: 'Argentina',      dial: '+54',  flag: '🇦🇷', len: [10, 10] },
  { code: 'EG', name: 'Egypt',          dial: '+20',  flag: '🇪🇬', len: [10, 10] },
  { code: 'KE', name: 'Kenya',          dial: '+254', flag: '🇰🇪', len: [9, 9]   },
  { code: 'GH', name: 'Ghana',          dial: '+233', flag: '🇬🇭', len: [9, 9]   },
  { code: 'QA', name: 'Qatar',          dial: '+974', flag: '🇶🇦', len: [8, 8]   },
  { code: 'KW', name: 'Kuwait',         dial: '+965', flag: '🇰🇼', len: [8, 8]   },
  { code: 'BH', name: 'Bahrain',        dial: '+973', flag: '🇧🇭', len: [8, 8]   },
  { code: 'OM', name: 'Oman',           dial: '+968', flag: '🇴🇲', len: [8, 8]   },
  { code: 'NZ', name: 'New Zealand',    dial: '+64',  flag: '🇳🇿', len: [8, 9]   },
  { code: 'CH', name: 'Switzerland',    dial: '+41',  flag: '🇨🇭', len: [9, 9]   },
  { code: 'NL', name: 'Netherlands',    dial: '+31',  flag: '🇳🇱', len: [9, 9]   },
  { code: 'SE', name: 'Sweden',         dial: '+46',  flag: '🇸🇪', len: [7, 10]  },
  { code: 'NO', name: 'Norway',         dial: '+47',  flag: '🇳🇴', len: [8, 8]   },
  { code: 'DK', name: 'Denmark',        dial: '+45',  flag: '🇩🇰', len: [8, 8]   },
  { code: 'FI', name: 'Finland',        dial: '+358', flag: '🇫🇮', len: [9, 11]  },
  { code: 'PL', name: 'Poland',         dial: '+48',  flag: '🇵🇱', len: [9, 9]   },
  { code: 'PT', name: 'Portugal',       dial: '+351', flag: '🇵🇹', len: [9, 9]   },
  { code: 'IL', name: 'Israel',         dial: '+972', flag: '🇮🇱', len: [9, 9]   },
];

function CountryCodePicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const bg     = '#fff';
  const bdr    = 'rgba(10,31,68,0.1)';
  const shadow = '0 20px 50px rgba(10,31,68,0.12)';
  const hoverBg = 'rgba(47,93,170,0.05)';
  const trigBg  = '#fff';
  const trigBdr = '1.5px solid rgba(226,232,240,1)';
  const trigCol = '#0A1F44';
  const mutedCol = '#6B7FA3';
  const inputBg  = 'rgba(10,31,68,0.03)';

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: trigBg, border: trigBdr,
          borderRadius: 12, padding: '14px 12px',
          color: trigCol, fontSize: '0.875rem', fontWeight: 700,
          cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{selected.flag}</span>
        <span>{selected.dial}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.4 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 300,
          background: bg, border: `1px solid ${bdr}`, borderRadius: 16,
          boxShadow: shadow, width: 280, overflow: 'hidden'
        }}>
          {/* Search */}
          <div style={{ padding: '12px 12px 8px' }}>
            <input
              ref={searchRef}
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code…"
              style={{
                width: '100%', background: inputBg,
                border: `1px solid ${bdr}`, borderRadius: 8,
                padding: '8px 12px', fontSize: '0.75rem',
                color: trigCol, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          {/* List */}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {filtered.map(c => (
              <button
                key={c.code} type="button"
                onClick={() => { onSelect(c); setOpen(false); setSearch(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px', border: 'none',
                  background: selected.code === c.code ? (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)') : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = selected.code === c.code ? (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)') : 'transparent'}
              >
                <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: trigCol }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', color: mutedCol, fontWeight: 700 }}>{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: '16px', textAlign: 'center', color: mutedCol, fontSize: '0.75rem' }}>No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcDuration(from, to) {
  if (!from || !to) return '';
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  const diff = (th * 60 + tm) - (fh * 60 + fm);
  if (diff <= 0) return '';
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CheckInPage() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [phoneError, setPhoneError] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]); // Default: India
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', gender: '', address: '',
    meetWith: '', purpose: '', scheduledTime: '', visitorStatus: '',
    fromTime: '', toTime: '', duration: ''
  });
  const [webcamLoading, setWebcamLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      await new Promise(r => img.onload = r);

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height
      );

      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (e) {
      console.error(e);
      return image;
    }
  };
  const [webcamError, setWebcamError] = useState(null);
  const [videoConstraints, setVideoConstraints] = useState(null);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setVideoConstraints(isMobile
      ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      : { facingMode: 'user' }
    );
  }, []);

  // Auto-calculate duration whenever fromTime or toTime changes
  const updateTime = (field, val) => {
    const next = { ...formData, [field]: val };
    next.duration = calcDuration(
      field === 'fromTime' ? val : next.fromTime,
      field === 'toTime' ? val : next.toTime
    );
    setFormData(next);
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/employees`);
      const data = await res.json();
      if (res.ok) setEmployees(data);
    } catch (err) { console.error('Failed to fetch employees:', err); }
  };

  useGSAP(() => {
    gsap.from('.fade-up', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' });
    const mm = (e) => {
      const xPos = (e.clientX / window.innerWidth - 0.5) * 20;
      const yPos = (e.clientY / window.innerHeight - 0.5) * 20;
      gsap.to('.parallax-bg-container > div', { x: xPos, y: yPos, duration: 2, ease: 'power2.out', stagger: 0.1 });
    };
    window.addEventListener('mousemove', mm);
    return () => window.removeEventListener('mousemove', mm);
  }, { scope: containerRef, dependencies: [step] });

  const validatePhone = (val, c = country) => {
    const [min, max] = c.len;
    const digits = val.replace(/\D/g, '');
    if (digits.length < min || digits.length > max) {
      setPhoneError(`Enter a valid ${min === max ? min : `${min}–${max}`}-digit number for ${c.name}`);
      return false;
    }
    if (c.indiaRules && !/^[6-9]/.test(digits)) {
      setPhoneError('Indian numbers must start with 6, 7, 8 or 9');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validatePhone(formData.phone, country)) return;
    // Store full number with dial code
    setFormData(prev => ({ ...prev, phone: `${country.dial} ${prev.phone}` }));
    setStep(2);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const src = webcamRef.current.getScreenshot();
      if (src) setImage(src);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleWebcamError = (err) => {
    const n = err?.name || '';
    if (n === 'OverconstrainedError' || n === 'ConstraintNotSatisfiedError') {
      setVideoConstraints({});
    } else {
      setIsWebcamReady(false); setWebcamLoading(false);
      setWebcamError(
        n === 'NotAllowedError' ? 'Camera access denied. Please allow camera permissions.' :
        n === 'NotFoundError' ? 'No camera detected on this device.' :
        err?.message || 'Unable to access camera.'
      );
    }
  };

  const handleSubmit = async (skipPhoto = false) => {
    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(k => { if (formData[k]) form.append(k, formData[k]); });
      if (image && !skipPhoto) {
        const blob = await (await fetch(image)).blob();
        form.append('webcamImage', blob, 'visitor_photo.jpg');
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/visits/request`, { method: 'POST', body: form });
      if (res.ok) { setStep(3); }
      else { const d = await res.json(); alert(`Error: ${d.message}`); }
    } catch (err) { alert('Failed to submit. Please check the server connection.'); }
    finally { setIsSubmitting(false); }
  };

  // Shared section card style
  const sectionCard = "vp-section-card";
  const labelCls = "vp-label";

  return (
    <main ref={containerRef} className="relative min-h-screen flex flex-col bg-white text-[#0A1F44] overflow-hidden dot-bg">

      {/* Subtle ambient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #2F5DAA 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-10 py-6 border-b border-[#E2E8F0] bg-white">
        <ValueTechLogo className="h-10 w-auto" />
      </nav>

      <div className="relative z-10 flex-1 flex items-start justify-center py-16 px-6">
        <div className="w-full max-w-4xl">
          {/* Close button */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-[#6B7FA3] hover:text-[#0A1F44] text-[10px] uppercase tracking-[0.2em] font-bold transition-colors group">
            <span className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#F8FAFC] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
            Close
          </Link>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-10 fade-up">
              <div className="text-center mb-12">
                <p className="vp-caption mb-4">Phase 01: Identification &amp; Details</p>
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">Visitor<br />Registration</h1>
              </div>

              {/* Personal Info */}
              <div className={sectionCard}>
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/40 to-transparent" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6B7FA3] mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ravi Kumar" />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" className="w-full" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 items-stretch">
                      <CountryCodePicker
                        selected={country}
                        onSelect={(c) => { setCountry(c); setPhoneError(''); setFormData({ ...formData, phone: '' }); }}
                      />
                      <input
                        required type="tel" inputMode="numeric" className="w-full"
                        value={formData.phone}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, country.len[1]);
                          setFormData({ ...formData, phone: v });
                          if (v.length >= country.len[0]) validatePhone(v); else setPhoneError('');
                        }}
                        placeholder={country.code === 'IN' ? '98XXXXXXXX' : 'Enter number'}
                        maxLength={country.len[1]}
                      />
                    </div>
                    {phoneError && <p className="text-red-400 text-[10px] mt-1 font-bold">{phoneError}</p>}
                    {formData.phone.length >= country.len[0] && !phoneError && (
                      <p className="text-green-500 text-[10px] mt-1 font-bold">✓ Valid {country.name} number</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select className="w-full" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                      <option value="">-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Address</label>
                    <input type="text" className="w-full" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street, City, State" />
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div className={`${sectionCard} relative`} style={{ overflow: 'visible' }}>
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/20 to-transparent rounded-l-3xl" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6B7FA3] mb-8">Visit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Meet With <span className="text-red-500">*</span></label>
                    <select required className="w-full" value={formData.meetWith} onChange={e => setFormData({ ...formData, meetWith: e.target.value })}>
                      <option value="">-- Select Employee or Team --</option>
                      {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Purpose <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} placeholder="e.g. Interview, Meeting" />
                  </div>
                  <div>
                    <label className={labelCls}>Visit Date</label>
                    <input
                      type="date" className="w-full"
                      min={todayISO()}
                      value={formData.scheduledTime}
                      onChange={e => setFormData({ ...formData, scheduledTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select className="w-full" value={formData.visitorStatus} onChange={e => setFormData({ ...formData, visitorStatus: e.target.value })}>
                      <option value="">-- Select --</option>
                      <option value="New">New Visitor</option>
                      <option value="Returning">Returning Visitor</option>
                    </select>
                  </div>

                  {/* Custom Time Pickers */}
                  <TimePicker label="From Time" value={formData.fromTime} onChange={v => updateTime('fromTime', v)} />
                  <TimePicker label="To Time" value={formData.toTime} onChange={v => updateTime('toTime', v)} />

                  {/* Auto Duration */}
                  <div className="md:col-span-2">
                    <label className={labelCls}>Duration (auto-calculated)</label>
                    <div style={{
                      background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                      borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <svg className="w-4 h-4 text-[#6B7FA3] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span style={{ color: formData.duration ? '#0A1F44' : '#A0AEC0', fontSize: '0.875rem', fontWeight: formData.duration ? 600 : 400 }}>
                        {formData.duration || 'Will calculate when From & To are set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary py-5 px-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-white/5">
                  Continue to Photo →
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="fade-up flex flex-col items-center gap-12">
              <div className="text-center">
                <p className="vp-caption mb-4">Phase 02: Verification Capture</p>
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">Photo<br />Identity</h1>
              </div>

              <div className="w-full max-w-2xl rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden relative aspect-square md:aspect-video flex items-center justify-center shadow-lg">
                {image && !isFinalized ? (
                  <div className="relative w-full h-full">
                    <Cropper
                      image={image}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      cropShape="round"
                      showGrid={false}
                      style={{
                        containerStyle: { background: '#000' },
                        cropAreaStyle: { border: '2px solid rgba(255,255,255,0.3)' }
                      }}
                    />
                    {/* Circle Grid Overlay inside Cropper area */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                       <div className="w-[300px] h-[300px] rounded-full border border-white/10" style={{
                         backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                         backgroundSize: '20px 20px'
                       }} />
                    </div>
                  </div>
                ) : image && isFinalized ? (
                  <img src={image} alt="captured" className="w-full h-full object-cover" />
                ) : webcamError ? (
                  <div className="flex flex-col items-center gap-4 p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                    </div>
                    <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Camera Unavailable</p>
                    <p className="text-[#6B7FA3] text-[10px] leading-relaxed max-w-xs">{webcamError}</p>
                  </div>
                ) : (
                  <>
                    {webcamLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-white/80">
                        <div className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] border-t-[#2F5DAA] animate-spin" />
                        <p className="text-[#6B7FA3] text-[10px] uppercase tracking-widest font-bold">Starting camera…</p>
                      </div>
                    )}
                    {videoConstraints !== null && (
                      <div className="relative w-full h-full">
                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={videoConstraints}
                          className="w-full h-full object-cover"
                          onUserMedia={() => { setIsWebcamReady(true); setWebcamError(null); setWebcamLoading(false); }}
                          onUserMediaError={handleWebcamError}
                        />
                        {/* Cinematic Dot Grid Overlay */}
                        {isWebcamReady && !image && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                             <div className="absolute inset-0 opacity-40" style={{
                               backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
                               backgroundSize: '24px 24px'
                             }} />
                             <div className="absolute top-0 left-0 w-full h-1 bg-white/10 animate-scan" style={{
                               background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                               boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                             }} />
                             {/* Corners */}
                             <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-white/30" />
                             <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-white/30" />
                             <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-white/30" />
                             <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-white/30" />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                {!image && !webcamError && isWebcamReady && (
                  <div className="absolute inset-0 border-2 border-white/10 rounded-[2.5rem] animate-pulse pointer-events-none" />
                )}
              </div>

              <div className="flex flex-col items-center gap-5 w-full">
                {image && !isFinalized ? (
                  <div className="w-full max-w-xs space-y-6">
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 text-center font-black">Zoom to Focus Face</label>
                      <input 
                        type="range" min="1" max="3" step="0.1" 
                        value={zoom} onChange={(e) => setZoom(e.target.value)}
                        className="w-full accent-white"
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        const cropped = await createCroppedImage();
                        setImage(cropped);
                        setIsFinalized(true);
                      }}
                      className="w-full btn-primary py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px]"
                    >
                      ✓ Finalize Identity
                    </button>
                    <button onClick={() => { setImage(null); setIsFinalized(false); }} className="w-full text-gray-500 text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors">
                      Retake Photo
                    </button>
                  </div>
                ) : !image ? (
                  <div className="flex gap-4 flex-wrap justify-center">
                    <button onClick={capture} disabled={!isWebcamReady || !!webcamError}
                      className="btn-primary py-4 px-10 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] disabled:opacity-30 disabled:cursor-not-allowed">
                      Take Picture
                    </button>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="btn-vp-secondary py-4 px-10 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all">
                      Upload File
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                ) : (
                  <div className="flex gap-4 flex-wrap justify-center">
                    <button onClick={() => setImage(null)} className="text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] px-10 transition-all">Retake / Change</button>
                    <button disabled={isSubmitting} onClick={() => handleSubmit(false)}
                      className="btn-primary py-5 px-12 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] disabled:opacity-50">
                      {isSubmitting ? 'Processing...' : 'Complete Registration'}
                    </button>
                  </div>
                )}
                <button onClick={() => handleSubmit(true)} disabled={isSubmitting}
                  className="text-gray-600 hover:text-gray-400 text-[9px] uppercase tracking-[0.3em] font-bold transition-all">
                  Skip Photo &amp; Submit →
                </button>
              </div>

              <button onClick={() => { setStep(1); setImage(null); setWebcamError(null); setWebcamLoading(true); setIsWebcamReady(false); }}
                className="text-gray-600 hover:text-gray-400 text-[9px] uppercase tracking-[0.3em] font-bold transition-all">
                ← Back to Details
              </button>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="text-center py-20 fade-up flex flex-col items-center gap-10">
              <div className="w-24 h-24 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="vp-caption mb-4">Registration complete</p>
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">You're<br />Checked In</h1>
              </div>
              <p className="text-[#6B7FA3] text-sm font-light max-w-sm leading-relaxed">Your request has been dispatched. Please wait in the lounge while the host reviews your credentials.</p>
              <Link href="/" className="btn-primary py-4 px-14 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px]">Return to Home</Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
