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

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const hours   = Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0'));
  const minutes = Array.from({length:60},(_,i)=>String(i).padStart(2,'0'));
  const parsed  = value ? value.split(':') : null;
  const dispH   = parsed ? (parseInt(parsed[0])%12||12).toString() : '--';
  const dispM   = parsed ? parsed[1] : '--';
  const dispAP  = parsed ? (parseInt(parsed[0])>=12?'PM':'AM') : '--';
  const setTime = (h:string,m:string,ap:string) => {
    let hh = parseInt(h); if(ap==='PM'&&hh!==12) hh+=12; if(ap==='AM'&&hh===12) hh=0;
    onChange(`${String(hh).padStart(2,'0')}:${m}`);
  };
  const curH = parsed?(parseInt(parsed[0])%12||12).toString():'1';
  const curM = parsed?parsed[1]:'00';
  const curAP= parsed?(parseInt(parsed[0])>=12?'PM':'AM'):'AM';
  return (
    <div style={{ position:'relative' }}>
      <div onClick={()=>setOpen(!open)} style={{
        display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',padding:'12px 14px',
        border:'1.5px solid #E2E8F0',borderRadius:'10px',background:'#fff',
        fontSize:'0.875rem',color:'#0A1F44',userSelect:'none',
      }}>
        <svg style={{width:'14px',height:'14px',color:'#6B7FA3',flexShrink:0}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        {value ? `${dispH}:${dispM} ${dispAP}` : 'Select time'}
      </div>
      {open && (
        <div style={{
          position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:200,
          background:'#fff',borderRadius:'14px',border:'1px solid #E2E8F0',
          boxShadow:'0 16px 48px rgba(10,31,68,0.14)',padding:'16px',
          display:'flex',gap:'8px',
        }}>
          <div style={{display:'flex',flexDirection:'column',gap:'2px',maxHeight:'180px',overflowY:'auto'}}>
            <div style={{fontSize:'0.5rem',fontWeight:800,letterSpacing:'0.2em',color:'#6B7FA3',textTransform:'uppercase',padding:'0 6px',marginBottom:'4px'}}>HR</div>
            {hours.map(h=>(
              <button key={h} onClick={()=>setTime(h,curM,curAP)} style={{
                padding:'5px 12px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'0.82rem',fontWeight:600,
                background:curH===h?'#0A1F44':'transparent',color:curH===h?'#fff':'#0A1F44',
              }}>{h}</button>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'2px',maxHeight:'180px',overflowY:'auto'}}>
            <div style={{fontSize:'0.5rem',fontWeight:800,letterSpacing:'0.2em',color:'#6B7FA3',textTransform:'uppercase',padding:'0 6px',marginBottom:'4px'}}>MIN</div>
            {minutes.map(m=>(
              <button key={m} onClick={()=>setTime(curH,m,curAP)} style={{
                padding:'5px 12px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'0.82rem',fontWeight:600,
                background:curM===m?'#0A1F44':'transparent',color:curM===m?'#fff':'#0A1F44',
              }}>{m}</button>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
            <div style={{fontSize:'0.5rem',fontWeight:800,letterSpacing:'0.2em',color:'#6B7FA3',textTransform:'uppercase',padding:'0 6px',marginBottom:'4px'}}>AM/PM</div>
            {['AM','PM'].map(ap=>(
              <button key={ap} onClick={()=>setTime(curH,curM,ap)} style={{
                padding:'5px 12px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'0.82rem',fontWeight:700,
                background:curAP===ap?'#0A1F44':'transparent',color:curAP===ap?'#fff':'#0A1F44',
              }}>{ap}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CountryCodePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = COUNTRIES.find(c=>c.code===value&&c.name===COUNTRIES.find(x=>x.code===value)?.name) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.code.includes(search));
  return (
    <div style={{position:'relative',flexShrink:0}}>
      <button type="button" onClick={()=>setOpen(!open)} style={{
        display:'flex',alignItems:'center',gap:'4px',padding:'12px 10px',
        border:'1.5px solid #E2E8F0',borderRadius:'10px 0 0 10px',borderRight:'none',
        background:'#F8FAFC',cursor:'pointer',fontSize:'0.82rem',fontWeight:600,color:'#0A1F44',whiteSpace:'nowrap',
      }}>
        {selected.flag} {value}
        <svg style={{width:'10px',height:'10px',color:'#6B7FA3',marginLeft:'2px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:200,
          background:'#fff',borderRadius:'14px',border:'1px solid #E2E8F0',
          boxShadow:'0 16px 48px rgba(10,31,68,0.14)',width:'240px',overflow:'hidden',
        }}>
          <div style={{padding:'10px'}}>
            <input placeholder="Search country..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{fontSize:'0.8rem',padding:'8px 12px',borderRadius:'8px'}}/>
          </div>
          <div style={{maxHeight:'220px',overflowY:'auto'}}>
            {filtered.map((c,i)=>(
              <button key={i} type="button" onClick={()=>{onChange(c.code);setOpen(false);setSearch('');}} style={{
                width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'8px 14px',
                border:'none',background:'transparent',cursor:'pointer',textAlign:'left',
              }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#F8FAFC'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}
              >
                <span style={{fontSize:'1rem'}}>{c.flag}</span>
                <span style={{fontSize:'0.8rem',fontWeight:600,color:'#0A1F44',flex:1}}>{c.name}</span>
                <span style={{fontSize:'0.75rem',color:'#6B7FA3'}}>{c.code}</span>
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
    name:'',email:'',phone:'',gender:'',address:'',nationality:'',
    aadhar:'',meetWith:'',purpose:'',fromTime:'',duration:'',
  });
  const [photo, setPhoto] = useState<string|null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<File|null>(null);
  const [crop, setCrop] = useState({x:0,y:0});
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CropArea|null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(()=>{
    fetch(`${API_URL}/api/v1/users/employees`).then(r=>r.json()).then(d=>setEmployees(d)).catch(console.error);
  },[]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setFormData({...formData,[e.target.name]:e.target.value});

  const capturePhoto = useCallback(()=>{
    const img = webcamRef.current?.getScreenshot();
    if(img){setPhoto(img);setShowCamera(false);}
  },[]);

  const onCropComplete = useCallback((_:unknown,area:CropArea)=>setCroppedArea(area),[]);

  const confirmCrop = async ()=>{
    if(!photo||!croppedArea) return;
    const file = await getCroppedImg(photo,croppedArea);
    setCroppedPhoto(file);
    setPhoto(null);
  };

  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault(); setError(''); setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries({...formData,phone:`${countryCode}${formData.phone}`,badgeColor}).forEach(([k,v])=>payload.append(k,v));
      if(croppedPhoto) payload.append('photo',croppedPhoto);
      const res = await fetch(`${API_URL}/api/v1/visits/request`,{method:'POST',body:payload});
      if(res.ok) setStep(3);
      else {const d=await res.json();setError(d.message||'Submission failed');}
    } catch {setError('Connection failed');}
    finally{setIsSubmitting(false);}
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
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </span>
          Close
        </Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {step < 3 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
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

        {photo && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0A1F44', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Cropper image={photo} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} cropShape="round"/>
            </div>
            <div style={{ padding: '20px', display: 'flex', gap: '12px', justifyContent: 'center', background: '#0A1F44' }}>
              <button onClick={()=>setPhoto(null)} className="btn-vp-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>Retake</button>
              <button onClick={confirmCrop} className="btn-vp-primary">Use Photo</button>
            </div>
          </div>
        )}

        {showCamera && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0A1F44', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'user' }} style={{ borderRadius: '16px', maxWidth: '400px', width: '100%' }}/>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={()=>setShowCamera(false)} className="btn-vp-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
              <button onClick={capturePhoto} className="btn-vp-primary">Capture</button>
            </div>
          </div>
        )}

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
                <div className="col-span-2" style={{ gridColumn: '1/-1' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                    <button type="button" onClick={()=>setShowCamera(true)} style={{
                      width: '88px', height: '88px', borderRadius: '50%',
                      border: '2px dashed rgba(47,93,170,0.25)',
                      background: croppedPhoto ? 'none' : 'rgba(47,93,170,0.04)',
                      cursor: 'pointer', overflow: 'hidden', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {croppedPhoto ? (
                        <img src={URL.createObjectURL(croppedPhoto)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <svg style={{ width: '24px', height: '24px', color: '#6B7FA3', display: 'block', margin: '0 auto 4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span style={{ fontSize: '0.45rem', fontWeight: 700, color: '#6B7FA3', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Photo</span>
                        </div>
                      )}
                    </button>
                  </div>
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
                    {['#2F5DAA','#0A1F44','#1e7e34','#c0392b','#7d3c98','#b7950b','#1a5276','#117a65'].map(c=>(
                      <button key={c} type="button" onClick={()=>setBadgeColor(c)} style={{
                        width: '28px', height: '28px', borderRadius: '50%', background: c,
                        border: badgeColor===c ? `3px solid ${isLight(c)?'#333':'#fff'}` : '2px solid transparent',
                        cursor: 'pointer', outline: badgeColor===c ? `2px solid ${c}` : 'none', outlineOffset: '2px',
                      }}/>
                    ))}
                    <input type="color" value={badgeColor} onChange={e=>setBadgeColor(e.target.value)} style={{ width:'28px',height:'28px',padding:0,border:'1px solid #E2E8F0',borderRadius:'50%',cursor:'pointer',overflow:'hidden' }}/>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" onClick={()=>setStep(2)} className="btn-vp-primary" style={{ width: '100%', padding: '15px', justifyContent: 'center', fontSize: '0.7rem' }}>
              Continue to Visit Details →
            </button>
          </div>
        )}

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
                    {employees.map(e=><option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="vp-label">Purpose of Visit *</label>
                  <input required name="purpose" value={formData.purpose} onChange={handleChange} type="text" placeholder="Meeting, Interview, Delivery..."/>
                </div>
                <div>
                  <label className="vp-label">Check-In Time</label>
                  <TimePicker value={formData.fromTime} onChange={v=>setFormData(f=>({...f,fromTime:v}))}/>
                </div>
                <div>
                  <label className="vp-label">Duration</label>
                  <input name="duration" value={formData.duration} onChange={handleChange} type="text" placeholder="e.g. 1 hr"/>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={()=>setStep(1)} className="btn-vp-secondary" style={{ padding: '14px 24px', fontSize: '0.7rem' }}>← Back</button>
              <button type="submit" disabled={isSubmitting} className="btn-vp-primary" style={{ flex: 1, padding: '15px', justifyContent: 'center', fontSize: '0.7rem' }}>
                {isSubmitting ? 'Submitting...' : 'Submit Request →'}
              </button>
            </div>
          </form>
        )}

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
