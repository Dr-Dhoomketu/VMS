import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-easy-crop';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'wouter';
import ValueTechLogo from '@/components/ValueTechLogo';
import { API_URL } from '@/lib/api';

function TimePicker({ value, onChange, label, required }: { value: string; onChange: (v: string) => void; label: string; required?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const emit = (h: number, m: number, ap: string) => {
    let h24 = h % 12;
    if (ap === 'PM') h24 += 12;
    onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const pickHour   = (h: number)  => { setHour(h);   emit(h, minute, ampm); };
  const pickMinute = (m: number)  => { setMinute(m); emit(hour, m, ampm); };
  const pickAmpm   = (ap: string) => { setAmpm(ap);  emit(hour, minute, ap); };

  const trigBdr = (o: boolean) => `1.5px solid ${o ? 'rgba(47,93,170,0.4)' : 'rgba(226,232,240,1)'}`;
  const trigCol  = value ? '#0A1F44' : '#A0AEC0';
  const btnBase: React.CSSProperties = { borderRadius: 8, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', border: 'none' };
  const activeStyle: React.CSSProperties   = { background: '#0A1F44', color: '#ffffff' };
  const inactiveStyle: React.CSSProperties = { background: 'rgba(10,31,68,0.05)', color: '#6B7FA3' };
  const sectionLabel: React.CSSProperties  = { fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6B7FA3', fontWeight: 800, marginBottom: 8 };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <label className="vp-label">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <button
        type="button" onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between"
        style={{ background: '#ffffff', border: trigBdr(open), borderRadius: 10, padding: '12px 16px', color: trigCol, transition: 'all 0.2s ease', fontSize: '0.875rem' }}
      >
        <span>{display}</span>
        <svg className="w-4 h-4" style={{ color: '#6B7FA3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200, background: '#ffffff', border: '1px solid rgba(10,31,68,0.1)', borderRadius: 14, padding: 16, width: '100%', boxShadow: '0 24px 64px rgba(10,31,68,0.12)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
] as const;

type Country = (typeof COUNTRIES)[number];

function CountryCodePicker({ selected, onSelect }: { selected: Country; onSelect: (c: Country) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const hoverBg  = 'rgba(47,93,170,0.05)';
  const selectedBg = 'rgba(0,0,0,0.06)';

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1.5px solid rgba(226,232,240,1)', borderRadius: 12, padding: '14px 12px', color: '#0A1F44', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
      >
        <span style={{ fontSize: '1.1rem' }}>{selected.flag}</span>
        <span>{selected.dial}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.4 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 300, background: '#fff', border: '1px solid rgba(10,31,68,0.1)', borderRadius: 16, boxShadow: '0 20px 50px rgba(10,31,68,0.12)', width: 280, overflow: 'hidden' }}>
          <div style={{ padding: '12px 12px 8px' }}>
            <input
              ref={searchRef}
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code…"
              style={{ width: '100%', background: 'rgba(10,31,68,0.03)', border: '1px solid rgba(10,31,68,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem', color: '#0A1F44', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {filtered.map(c => (
              <button
                key={c.code} type="button"
                onClick={() => { onSelect(c); setOpen(false); setSearch(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: selected.code === c.code ? selectedBg : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = selected.code === c.code ? selectedBg : 'transparent')}
              >
                <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#0A1F44' }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#6B7FA3', fontWeight: 700 }}>{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: '16px', textAlign: 'center', color: '#6B7FA3', fontSize: '0.75rem' }}>No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function calcDuration(from: string, to: string) {
  if (!from || !to) return '';
  const [fh,fm] = from.split(':').map(Number);
  const [th,tm] = to.split(':').map(Number);
  const diff = (th*60+tm)-(fh*60+fm);
  if (diff<=0) return '';
  const hrs=Math.floor(diff/60), mins=diff%60;
  return mins===0?`${hrs}h`:`${hrs}h ${mins}m`;
}

interface Employee { _id: string; name: string; }

export default function CheckInPage() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [phoneError, setPhoneError] = useState('');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [formData, setFormData] = useState({ name:'', phone:'', email:'', gender:'', address:'', meetWith:'', purpose:'', scheduledTime:'', visitorStatus:'', fromTime:'', toTime:'', duration:'' });
  const [webcamLoading, setWebcamLoading] = useState(true);
  const [image, setImage] = useState<string|null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [crop, setCrop] = useState({ x:0, y:0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{x:number;y:number;width:number;height:number}|null>(null);
  const [webcamError, setWebcamError] = useState<string|null>(null);
  const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints|null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onCropComplete = useCallback((_: unknown, pixels: {x:number;y:number;width:number;height:number}) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createCroppedImage = async () => {
    if (!image || !croppedAreaPixels) return image;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      img.src = image;
      await new Promise(r => img.onload = r);
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch { return image; }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/v1/users/employees`).then(r=>r.json()).then(d=>setEmployees(d)).catch(console.error);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setVideoConstraints(isMobile ? { facingMode:'user', width:{ ideal:1280 }, height:{ ideal:720 } } : { facingMode:'user' });
  }, []);

  const updateTime = (field: string, val: string) => {
    const next = { ...formData, [field]: val };
    next.duration = calcDuration(field==='fromTime'?val:next.fromTime, field==='toTime'?val:next.toTime);
    setFormData(next);
  };

  useGSAP(() => {
    gsap.from('.fade-up', { y:40, opacity:0, duration:0.9, stagger:0.12, ease:'power3.out' });
  }, { scope: containerRef, dependencies: [step] });

  const validatePhone = (val: string, c = country) => {
    const [min,max] = c.len;
    const digits = val.replace(/\D/g,'');
    if (digits.length<min || digits.length>max) { setPhoneError(`Enter a valid ${min===max?min:`${min}–${max}`}-digit number for ${c.name}`); return false; }
    if ('indiaRules' in c && c.indiaRules && !/^[6-9]/.test(digits)) { setPhoneError('Indian numbers must start with 6, 7, 8 or 9'); return false; }
    setPhoneError(''); return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(formData.phone, country)) return;
    setFormData(prev => ({ ...prev, phone: `${country.dial} ${prev.phone}` }));
    setStep(2);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) { const src = webcamRef.current.getScreenshot(); if (src) setImage(src); }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleWebcamError = (err: unknown) => {
    const n = (err as { name?: string })?.name || '';
    if (n==='OverconstrainedError'||n==='ConstraintNotSatisfiedError') { setVideoConstraints({}); }
    else {
      setIsWebcamReady(false); setWebcamLoading(false);
      setWebcamError(n==='NotAllowedError'?'Camera access denied. Please allow camera permissions.':n==='NotFoundError'?'No camera detected on this device.':(err as {message?:string})?.message||'Unable to access camera.');
    }
  };

  const handleSubmit = async (skipPhoto=false) => {
    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k,v]) => { if (v) form.append(k, v); });
      if (image && !skipPhoto) {
        const cropped = await createCroppedImage();
        if (cropped) { const blob = await (await fetch(cropped)).blob(); form.append('webcamImage', blob, 'visitor_photo.jpg'); }
      }
      const res = await fetch(`${API_URL}/api/v1/visits/request`, { method:'POST', body: form });
      if (res.ok) setStep(3);
      else { const d = await res.json(); alert(`Error: ${d.message}`); }
    } catch { alert('Failed to submit. Please check the server connection.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main ref={containerRef} className="relative min-h-screen flex flex-col bg-white text-[#0A1F44] overflow-hidden dot-bg">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background:'radial-gradient(circle, #2F5DAA 0%, transparent 70%)' }}/>
      </div>

      <nav className="relative z-50 flex justify-between items-center px-10 py-6 border-b border-[#E2E8F0] bg-white">
        <ValueTechLogo className="h-10 w-auto"/>
      </nav>

      <div className="relative z-10 flex-1 flex items-start justify-center py-16 px-6">
        <div className="w-full max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-[#6B7FA3] hover:text-[#0A1F44] text-[10px] uppercase tracking-[0.2em] font-bold transition-colors group">
            <span className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#F8FAFC] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </span>
            Close
          </Link>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-10 fade-up">
              <div className="text-center mb-12">
                <p className="vp-caption mb-4">Phase 01: Identification &amp; Details</p>
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">Visitor<br/>Check‑In</h1>
              </div>
              <div className="vp-section-card">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6B7FA3] mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="vp-label">Full Name <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="e.g. John Doe"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <CountryCodePicker selected={country} onSelect={c => { setCountry(c as Country); if (phoneError) validatePhone(formData.phone, c as Country); }}/>
                      <input required type="tel" value={formData.phone} onChange={e=>{setFormData({...formData,phone:e.target.value}); if(phoneError) validatePhone(e.target.value);}} placeholder="Enter number"/>
                    </div>
                    {phoneError && <p className="text-red-500 text-[10px] font-bold mt-1">{phoneError}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Email Address</label>
                    <input type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="you@example.com"/>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Gender</label>
                    <select value={formData.gender} onChange={e=>setFormData({...formData,gender:e.target.value})}>
                      <option value="">-- Select --</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="vp-label">Address</label>
                    <input type="text" value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} placeholder="Street, City"/>
                  </div>
                </div>
              </div>

              <div className="vp-section-card" style={{ overflow:'visible' }}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6B7FA3] mb-8">Visit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="vp-label">Who are you meeting? <span className="text-red-500">*</span></label>
                    <select required value={formData.meetWith} onChange={e=>setFormData({...formData,meetWith:e.target.value})}>
                      <option value="">Select Employee</option>
                      {employees.map(emp=><option key={emp._id} value={emp._id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="vp-label">Purpose of Visit <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.purpose} onChange={e=>setFormData({...formData,purpose:e.target.value})} placeholder="Meeting, Interview..."/>
                  </div>
                  <div className="space-y-2" style={{ overflow: 'visible' }}>
                    <TimePicker label="From Time" value={formData.fromTime} onChange={v => updateTime('fromTime', v)}/>
                  </div>
                  <div className="space-y-2" style={{ overflow: 'visible' }}>
                    <TimePicker label="To Time" value={formData.toTime} onChange={v => updateTime('toTime', v)}/>
                  </div>
                  {formData.duration && (
                    <div className="space-y-1">
                      <label className="vp-label">Duration</label>
                      <div className="text-[#0A1F44] font-bold text-sm py-3 px-4 bg-[#EEF3FB] rounded-xl">{formData.duration}</div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="vp-label">Visitor Status</label>
                    <select value={formData.visitorStatus} onChange={e=>setFormData({...formData,visitorStatus:e.target.value})}>
                      <option value="">-- Select --</option>
                      <option value="New">New Visitor</option>
                      <option value="Returning">Returning Visitor</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-5 text-sm font-black tracking-widest rounded-2xl">Continue to Photo Capture →</button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="fade-up space-y-8">
              <div className="text-center mb-12">
                <p className="vp-caption mb-4">Phase 02: Identity Capture</p>
                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">Photo<br/>Capture</h1>
              </div>
              <div className="vp-section-card">
                <div className="relative bg-[#F8FAFC] rounded-2xl overflow-hidden" style={{ aspectRatio:'4/3' }}>
                  {!image ? (
                    <>
                      {webcamError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                          <div className="text-4xl mb-4">📷</div>
                          <p className="text-[#6B7FA3] text-sm">{webcamError}</p>
                          <button type="button" onClick={()=>fileInputRef.current?.click()} className="mt-4 btn-primary px-6 py-3 text-xs rounded-xl">Upload Photo Instead</button>
                        </div>
                      ) : (
                        videoConstraints && (
                          <>
                            {webcamLoading && (
                              <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="w-8 h-8 border-2 border-[#2F5DAA] border-t-transparent rounded-full animate-spin"/>
                              </div>
                            )}
                            <Webcam
                              ref={webcamRef}
                              audio={false}
                              videoConstraints={videoConstraints}
                              screenshotFormat="image/jpeg"
                              className="w-full h-full object-cover"
                              onUserMedia={()=>{setIsWebcamReady(true);setWebcamLoading(false);}}
                              onUserMediaError={handleWebcamError}
                            />
                          </>
                        )
                      )}
                    </>
                  ) : (
                    <div className="relative w-full h-full">
                      <Cropper
                        image={image} crop={crop} zoom={zoom}
                        aspect={3/4} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  {!image ? (
                    <>
                      <button type="button" onClick={capture} disabled={!isWebcamReady}
                        className="flex-1 btn-primary py-3 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-40">
                        📸 Capture Photo
                      </button>
                      <button type="button" onClick={()=>fileInputRef.current?.click()}
                        className="px-6 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#6B7FA3] hover:text-[#0A1F44] transition-all">
                        Upload
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={()=>setImage(null)}
                      className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#6B7FA3] hover:text-red-500 transition-colors">
                      Retake
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={()=>handleSubmit(true)} disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-black uppercase tracking-[0.4em] text-[#6B7FA3] hover:text-[#0A1F44] transition-all disabled:opacity-50">
                  Skip Photo →
                </button>
                <button type="button" onClick={()=>handleSubmit(false)} disabled={!image||isSubmitting}
                  className="flex-1 btn-primary py-4 text-[10px] font-black tracking-[0.4em] rounded-2xl disabled:opacity-40">
                  {isSubmitting?'Submitting...':'Submit Request →'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="text-center py-20 fade-up flex flex-col items-center gap-10">
              <div className="w-24 h-24 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <p className="vp-caption mb-4">Request dispatched</p>
                <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter uppercase leading-none text-[#0A1F44]">Check‑In<br/>Complete</h2>
              </div>
              <p className="text-[#6B7FA3] font-light text-sm leading-relaxed max-w-sm mx-auto">
                Your visit request has been submitted.<br/>The host employee will be notified shortly.
              </p>
              <Link href="/" className="btn-primary py-4 px-14 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px]">Return to Home</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
