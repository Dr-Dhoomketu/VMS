'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import GlassCard from '@/components/GlassCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';

const VIDEO_CONSTRAINTS = {
  width: 720,
  height: 480,
  facingMode: 'user',
};

export default function CheckInPage() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', gender: '', address: '',
    meetWith: '', purpose: '', scheduledTime: '', visitorStatus: '',
    fromTime: '', toTime: '', duration: ''
  });
  const [webcamLoading, setWebcamLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users/employees');
      const data = await res.json();
      if (res.ok) setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useGSAP(() => {
    gsap.from('.fade-up', {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    });

    // Cinematic Parallax Mouse Effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 30;
      const yPos = (clientY / window.innerHeight - 0.5) * 30;

      gsap.to(".parallax-bg-container > div", {
        x: xPos,
        y: yPos,
        duration: 2,
        ease: "power2.out",
        stagger: 0.1
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, { scope: containerRef, dependencies: [step] });

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setImage(imageSrc);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (skipPhoto = false) => {
    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) form.append(key, formData[key]);
      });

      if (image && !skipPhoto) {
        const resBlob = await fetch(image);
        const blob = await resBlob.blob();
        form.append('webcamImage', blob, 'visitor_photo.jpg');
      }

      const res = await fetch('http://localhost:5000/api/v1/visits/request', {
        method: 'POST',
        body: form,
      });

      if (res.ok) {
        setStep(3);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit. Please check the server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Background Glows (Corporate Premium) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none parallax-bg-container">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/10 theme-coffee:bg-gray-400/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gray-500/10 theme-coffee:bg-gray-500/5 rounded-full blur-[120px]" />
      </div>

      <Link href="/" className="absolute top-10 left-10 z-50 w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-gray-500 hover:text-white shadow-2xl backdrop-blur-md">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </Link>

      <GlassCard className="w-full max-w-4xl relative z-10" hoverEffect={false}>

        {/* ── STEP 1: Registration Form ── */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-12 fade-up p-4">
            <div className="text-center">
              <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 text-white">Visitor Registration</h1>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-bold">Phase 01: Identification & Details</p>
            </div>

            <div className="space-y-10">
              {/* Personal Information */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-500 theme-coffee:bg-gray-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 theme-coffee:text-gray-600 mb-8">PERSONAL INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Full Name <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Email Address</label>
                    <input type="email" className="w-full"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Phone Number <span className="text-red-500">*</span></label>
                    <input required type="tel" className="w-full"
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g. 555-0123" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Gender</label>
                    <select className="w-full"
                      value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                      <option value="">-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Address</label>
                    <input type="text" className="w-full"
                      value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street, City, State" />
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-600 theme-coffee:bg-gray-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 theme-coffee:text-gray-600 mb-8">VISIT DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Meet With <span className="text-red-500">*</span></label>
                    <select required className="w-full" value={formData.meetWith} onChange={e => setFormData({ ...formData, meetWith: e.target.value })}>
                      <option value="">-- Select Employee or Team --</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Purpose <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full"
                      value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} placeholder="e.g. Interview, Meeting" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Date</label>
                    <input type="date" className="w-full"
                      value={formData.scheduledTime} onChange={e => setFormData({ ...formData, scheduledTime: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Status</label>
                    <select className="w-full" value={formData.visitorStatus} onChange={e => setFormData({ ...formData, visitorStatus: e.target.value })}>
                      <option value="">-- Select --</option>
                      <option value="New">New Visitor</option>
                      <option value="Returning">Returning Visitor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">From Time</label>
                    <input type="time" className="w-full"
                      value={formData.fromTime} onChange={e => setFormData({ ...formData, fromTime: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">To Time</label>
                    <input type="time" className="w-full"
                      value={formData.toTime} onChange={e => setFormData({ ...formData, toTime: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black">Duration (Hours)</label>
                    <input type="text" className="w-full"
                      value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 1.5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn-primary py-5 px-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-gray-500/10">
                Continue to Photo →
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Photo Capture ── */}
        {step === 2 && (
          <div className="space-y-12 fade-up text-center p-4 min-h-[600px] flex flex-col justify-center">
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 text-white">Photo Identity</h1>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-bold">Phase 02: Verification Capture</p>
            </div>

            {/* Webcam / Preview area */}
            <div className="mx-auto w-full max-w-xl bg-black/60 theme-coffee:bg-gray-100 rounded-[2.5rem] border border-white/10 theme-coffee:border-gray-300 relative overflow-hidden aspect-video flex items-center justify-center shadow-2xl">
              {image ? (
                <img src={image} alt="captured" className="w-full h-full object-cover" />
              ) : webcamError ? (
                /* Camera access denied / unavailable */
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <svg className="w-12 h-12 text-red-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Camera Unavailable</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-wider">{webcamError}</p>
                </div>
              ) : (
                <>
                  {webcamLoading && !webcamError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                      <div className="w-10 h-10 rounded-full border-2 border-gray-500/30 border-t-gray-500 animate-spin" />
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Starting camera…</p>
                    </div>
                  )}
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={VIDEO_CONSTRAINTS}
                    className="w-full h-full object-cover"
                    onUserMedia={() => { setIsWebcamReady(true); setWebcamError(null); setWebcamLoading(false); }}
                    onUserMediaError={(err) => {
                      setIsWebcamReady(false);
                      setWebcamLoading(false);
                      setWebcamError(err?.message || 'Permission denied. Please allow camera access.');
                    }}
                  />
                </>
              )}
              {!image && !webcamError && (
                <div className="absolute inset-0 border-2 border-gray-500/20 rounded-[2.5rem] animate-pulse pointer-events-none" />
              )}
            </div>

            <div className="flex flex-col gap-4 items-center">
              {!image ? (
                <div className="flex gap-4 flex-wrap justify-center">
                  {/* Take picture — disabled if camera not ready or errored */}
                  <button
                    onClick={capture}
                    disabled={!isWebcamReady || !!webcamError}
                    className="btn-primary py-5 px-12 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-gray-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Take Picture
                  </button>
                  {/* Upload as alternative */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 py-5 px-12 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all"
                  >
                    Upload File
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              ) : (
                <div className="flex gap-4 flex-wrap justify-center">
                  <button onClick={() => setImage(null)} className="text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] px-10 transition-all">
                    Retake / Change
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSubmit(false)}
                    className="btn-primary py-5 px-12 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-gray-500/10"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Registration'}
                  </button>
                </div>
              )}

              {/* Skip photo option */}
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="text-gray-600 hover:text-gray-400 text-[9px] uppercase tracking-[0.3em] font-bold transition-all mt-2"
              >
                Skip Photo & Submit →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <div className="text-center py-20 fade-up">
            <div className="w-28 h-28 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/10">
              <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-6 text-white leading-none">
              Registration<br />Complete
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold max-w-sm mx-auto mb-16 leading-relaxed">
              Your security request has been dispatched. Please wait in the lounge while the host reviews your access credentials.
            </p>
            <Link href="/" className="btn-primary py-5 px-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-gray-500/10">
              Return to Terminal
            </Link>
          </div>
        )}

      </GlassCard>
    </main>
  );
}
