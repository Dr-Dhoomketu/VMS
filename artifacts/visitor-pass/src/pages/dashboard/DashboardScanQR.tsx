import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { API_URL } from '@/lib/api';

interface Visit {
  _id: string;
  purpose: string;
  status: string;
  fromTime?: string;
  duration?: string;
  scheduledTime?: string;
  createdAt: string;
  visitor?: { name: string; phone: string; email?: string; imageUrl?: string; aadhar?: string; gender?: string };
  meetWith?: { name: string; email?: string };
}

const statusColor: Record<string, string> = {
  Approved: '#16a34a', Pending: '#d97706', Rejected: '#dc2626', CheckedIn: '#2F5DAA', CheckedOut: '#64748b',
};
const statusBg: Record<string, string> = {
  Approved: 'rgba(22,163,74,0.08)', Pending: 'rgba(217,119,6,0.08)', Rejected: 'rgba(220,38,38,0.08)', CheckedIn: 'rgba(47,93,170,0.08)', CheckedOut: 'rgba(100,116,139,0.08)',
};

type Mode = 'manual' | 'camera';

export default function DashboardScanQR() {
  const [mode, setMode] = useState<Mode>('manual');
  const [tokenInput, setTokenInput] = useState('');
  const [visit, setVisit] = useState<Visit | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lastScanned, setLastScanned] = useState('');

  const webcamRef = useRef<Webcam>(null);
  const animFrameRef = useRef<number>(0);
  const scanningRef = useRef(false);

  const authToken = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const extractToken = (raw: string): string => {
    const trimmed = raw.trim();
    const match = trimmed.match(/\/scan\/([a-zA-Z0-9\-]+)/);
    if (match) return match[1];
    return trimmed;
  };

  const fetchVisit = async (tok: string) => {
    setLookupLoading(true); setLookupError(''); setVisit(null); setActionMsg('');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/scan/${tok}`);
      if (res.ok) { const d = await res.json(); setVisit(d); }
      else setLookupError('No visit found for this QR code. Check the token or URL and try again.');
    } catch { setLookupError('Connection error. Please try again.'); }
    finally { setLookupLoading(false); }
  };

  const lookupVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = extractToken(tokenInput);
    if (!tok) return;
    await fetchVisit(tok);
  };

  const resolvedToken = visit ? extractToken(tokenInput || lastScanned) : '';

  const scanFrame = useCallback(() => {
    if (!scanningRef.current) return;
    const webcam = webcamRef.current;
    if (!webcam) { animFrameRef.current = requestAnimationFrame(scanFrame); return; }

    const video = webcam.video;
    if (!video || video.readyState !== 4) { animFrameRef.current = requestAnimationFrame(scanFrame); return; }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { animFrameRef.current = requestAnimationFrame(scanFrame); return; }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });

    if (code?.data) {
      const tok = extractToken(code.data);
      if (tok) {
        scanningRef.current = false;
        setScanning(false);
        setLastScanned(tok);
        setTokenInput(tok);
        fetchVisit(tok);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, []);

  const startCamera = () => {
    setCameraError('');
    setScanning(true);
    scanningRef.current = true;
    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const stopCamera = () => {
    scanningRef.current = false;
    setScanning(false);
    cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => {
    return () => {
      scanningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const switchMode = (m: Mode) => {
    stopCamera();
    setMode(m);
    setVisit(null);
    setLookupError('');
    setActionMsg('');
    setTokenInput('');
    setLastScanned('');
  };

  const doAction = async (endpoint: string, label: string) => {
    const tok = resolvedToken || lastScanned;
    if (!authToken || !tok) return;
    setActionLoading(true); setActionMsg('');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${endpoint}/${tok}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || `${label} successful`);
        const refetch = await fetch(`${API_URL}/api/v1/visits/scan/${tok}`);
        if (refetch.ok) setVisit(await refetch.json());
      } else setActionMsg(data.message || `${label} failed`);
    } catch { setActionMsg('Network error. Please try again.'); }
    finally { setActionLoading(false); }
  };

  const doApproveReject = async (status: 'Approved' | 'Rejected') => {
    if (!authToken || !visit) return;
    setActionLoading(true); setActionMsg('');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${visit._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || `Visit ${status.toLowerCase()}`);
        const tok = resolvedToken || lastScanned;
        const refetch = await fetch(`${API_URL}/api/v1/visits/scan/${tok}`);
        if (refetch.ok) setVisit(await refetch.json());
      } else setActionMsg(data.message || 'Action failed');
    } catch { setActionMsg('Network error. Please try again.'); }
    finally { setActionLoading(false); }
  };

  const resetLookup = () => { setVisit(null); setTokenInput(''); setActionMsg(''); setLookupError(''); setLastScanned(''); };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
        <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '4px' }}>Gate Access</p>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0A1F44' }}>Scan / Look Up QR</h1>
        <p style={{ fontSize: '0.75rem', color: '#6B7FA3', marginTop: '2px' }}>Scan a visitor's QR code with camera or enter the token manually.</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['manual', 'camera'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                background: mode === m ? '#0A1F44' : '#F8FAFC',
                color: mode === m ? '#fff' : '#6B7FA3',
                outline: mode !== m ? '1px solid #E2E8F0' : 'none',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {m === 'camera' ? (
                <><svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/>
                </svg>Scan with Camera</>
              ) : (
                <><svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>Enter Manually</>
              )}
            </button>
          ))}
        </div>

        {/* Camera mode */}
        {mode === 'camera' && !visit && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(10,31,68,0.04)' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#0A1F44', aspectRatio: '4/3', marginBottom: '16px' }}>
              {scanning ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }}
                    onUserMediaError={() => { setCameraError('Camera access denied. Please allow camera permission and try again.'); stopCamera(); }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Scan overlay */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                      {/* Corner brackets */}
                      {[
                        { top: 0, left: 0, borderTop: '3px solid #4A9FE8', borderLeft: '3px solid #4A9FE8', borderRadius: '6px 0 0 0' },
                        { top: 0, right: 0, borderTop: '3px solid #4A9FE8', borderRight: '3px solid #4A9FE8', borderRadius: '0 6px 0 0' },
                        { bottom: 0, left: 0, borderBottom: '3px solid #4A9FE8', borderLeft: '3px solid #4A9FE8', borderRadius: '0 0 0 6px' },
                        { bottom: 0, right: 0, borderBottom: '3px solid #4A9FE8', borderRight: '3px solid #4A9FE8', borderRadius: '0 0 6px 0' },
                      ].map((style, i) => (
                        <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...style }} />
                      ))}
                      {/* Scan line */}
                      <div style={{
                        position: 'absolute', left: '6px', right: '6px', height: '2px',
                        background: 'linear-gradient(90deg, transparent, #4A9FE8, transparent)',
                        animation: 'scanline 1.5s ease-in-out infinite',
                        boxShadow: '0 0 8px rgba(74,159,232,0.8)',
                      }} />
                    </div>
                  </div>
                  <style>{`
                    @keyframes scanline {
                      0% { top: 10px; }
                      50% { top: calc(100% - 10px); }
                      100% { top: 10px; }
                    }
                  `}</style>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', gap: '16px', padding: '32px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,159,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 32, height: 32, color: '#4A9FE8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>Camera preview will appear here</p>
                </div>
              )}
            </div>

            {cameraError && (
              <div style={{ marginBottom: '14px', padding: '12px 16px', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                {cameraError}
              </div>
            )}

            {lookupLoading && (
              <div style={{ textAlign: 'center', padding: '14px', color: '#2F5DAA', fontSize: '0.78rem', fontWeight: 700 }}>
                QR code detected — looking up visitor…
              </div>
            )}

            {!scanning && !lookupLoading && (
              <button
                onClick={startCamera}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                Start Camera Scan
              </button>
            )}

            {scanning && (
              <button
                onClick={stopCamera}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: 'transparent', color: '#6B7FA3', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
              >
                Stop Camera
              </button>
            )}

            <div style={{ marginTop: '14px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #EEF1F6' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6B7FA3', marginBottom: '4px' }}>HOW TO USE</p>
              <ul style={{ fontSize: '0.7rem', color: '#94A3B8', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                <li>Click "Start Camera Scan" and allow camera access</li>
                <li>Hold the visitor's QR code up to the camera</li>
                <li>The pass will be looked up automatically when detected</li>
              </ul>
            </div>
          </div>
        )}

        {/* Manual mode */}
        {mode === 'manual' && !visit && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(10,31,68,0.04)' }}>
            <form onSubmit={lookupVisit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '8px' }}>
                  QR Token or Scan URL
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="Paste token or full URL from visitor's QR code…"
                    required
                    style={{ flex: 1, padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '0.82rem', color: '#0A1F44', outline: 'none' }}
                    onFocus={e => { e.target.style.borderColor = '#2F5DAA'; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                  />
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: lookupLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: lookupLoading ? 0.7 : 1 }}
                  >
                    {lookupLoading ? 'Looking up…' : 'Look Up →'}
                  </button>
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #EEF1F6' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6B7FA3', marginBottom: '6px' }}>HOW TO USE</p>
                <ul style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                  <li>Ask the visitor to show their approval email</li>
                  <li>Copy the QR token or paste the full <code style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '4px' }}>/scan/…</code> URL</li>
                  <li>Click Look Up to see their details</li>
                </ul>
              </div>
            </form>
            {lookupError && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                {lookupError}
              </div>
            )}
          </div>
        )}

        {/* Lookup error after camera scan */}
        {mode === 'camera' && !visit && lookupError && (
          <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600, marginBottom: '16px' }}>
            {lookupError}
            <button onClick={() => { setLookupError(''); startCamera(); }} style={{ marginLeft: '10px', padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* Visit details + actions */}
        {visit && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 2px 12px rgba(10,31,68,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(47,93,170,0.15)', flexShrink: 0, background: 'rgba(47,93,170,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {visit.visitor?.imageUrl
                  ? <img src={visit.visitor.imageUrl.startsWith('data:') ? visit.visitor.imageUrl : `${API_URL}${visit.visitor.imageUrl}`} alt="visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2F5DAA' }}>{visit.visitor?.name?.charAt(0)}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0A1F44', margin: '0 0 2px' }}>{visit.visitor?.name}</h3>
                <p style={{ fontSize: '0.72rem', color: '#6B7FA3', margin: 0 }}>{visit.visitor?.phone}</p>
              </div>
              <span style={{
                padding: '6px 14px', borderRadius: 20,
                fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: statusColor[visit.status] || '#64748b',
                background: statusBg[visit.status] || 'rgba(100,116,139,0.08)',
                border: `1px solid ${(statusColor[visit.status] || '#64748b')}30`,
              }}>{visit.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 20 }}>
              {[
                { label: 'Meeting With', value: visit.meetWith?.name },
                { label: 'Purpose', value: visit.purpose },
                { label: 'Time', value: visit.fromTime || '—' },
                { label: 'Duration', value: visit.duration || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #EEF1F6' }}>
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A0AEC0', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A1F44' }}>{value || '—'}</div>
                </div>
              ))}
            </div>

            {actionMsg && (
              <div style={{ padding: '12px 16px', background: 'rgba(47,93,170,0.06)', border: '1px solid rgba(47,93,170,0.2)', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, color: '#2F5DAA', marginBottom: 14, textAlign: 'center' }}>
                {actionMsg}
              </div>
            )}

            {!actionLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {visit.status === 'Pending' && (user?.role === 'Admin' || user?.role === 'Employee') && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => doApproveReject('Approved')} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#16a34a', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                      Approve Visit
                    </button>
                    <button onClick={() => doApproveReject('Rejected')} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid rgba(220,38,38,0.3)', background: 'transparent', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                      Reject
                    </button>
                  </div>
                )}
                {visit.status === 'Approved' && (
                  <button onClick={() => doAction('checkin', 'Check-in')} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Mark Checked In — Allow Entry
                  </button>
                )}
                {visit.status === 'CheckedIn' && (
                  <button onClick={() => doAction('checkout', 'Check-out')} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: '#64748b', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
                    Mark Checked Out — Exit
                  </button>
                )}
                {visit.status === 'Rejected' && (
                  <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                    This visit was rejected. No action available.
                  </div>
                )}
                {visit.status === 'CheckedOut' && (
                  <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(100,116,139,0.04)', border: '1px solid rgba(100,116,139,0.15)', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                    Visitor has already checked out.
                  </div>
                )}
                <button
                  onClick={resetLookup}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'transparent', color: '#6B7FA3', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  {mode === 'camera' ? 'Scan Another' : 'Look Up Another'}
                </button>
              </div>
            )}

            {actionLoading && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7FA3', fontSize: '0.75rem', fontWeight: 600 }}>Processing…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
