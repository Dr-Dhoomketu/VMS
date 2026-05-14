import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { API_URL } from '@/lib/api';
import GeoBackground from '@/components/GeoBackground';

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

export default function ScanPage() {
  const { token } = useParams<{ token: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const authToken = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canAct = !!authToken && !!user && ['Admin', 'Employee', 'Security'].includes(user.role);

  const loadVisit = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/v1/visits/scan/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => { setVisit(d); setLoading(false); })
      .catch(() => { setError('Invalid or expired gate pass. Please contact reception.'); setLoading(false); });
  };

  useEffect(() => { loadVisit(); }, [token]);

  const doAction = async (endpoint: string, label: string) => {
    if (!authToken) return;
    setActionLoading(true); setActionMsg('');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${endpoint}/${token}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) { setActionMsg(data.message || `${label} successful`); loadVisit(); }
      else setActionMsg(data.message || `${label} failed`);
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
      if (res.ok) { setActionMsg(data.message || `Visit ${status.toLowerCase()}`); loadVisit(); }
      else setActionMsg(data.message || 'Action failed');
    } catch { setActionMsg('Network error. Please try again.'); }
    finally { setActionLoading(false); }
  };

  const statusColor: Record<string, string> = {
    Approved: '#16a34a', Pending: '#d97706', Rejected: '#dc2626', CheckedOut: '#64748b', CheckedIn: '#2F5DAA',
  };
  const statusBg: Record<string, string> = {
    Approved: 'rgba(22,163,74,0.08)', Pending: 'rgba(217,119,6,0.08)', Rejected: 'rgba(220,38,38,0.08)', CheckedOut: 'rgba(100,116,139,0.08)', CheckedIn: 'rgba(47,93,170,0.08)',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', position: 'relative' }}>
      <GeoBackground />
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '60px',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(10,31,68,0.07)',
      }}>
        <img src="/vts-logo.svg" alt="VISITORPASS" style={{ height: '28px', objectFit: 'contain' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6B7FA3' }}>Gate Pass Verification</span>
          {user && (
            <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '3px 8px', background: 'rgba(47,93,170,0.08)', color: '#2F5DAA', borderRadius: '6px', border: '1px solid rgba(47,93,170,0.15)' }}>
              {user.name} · {user.role}
            </span>
          )}
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: 48, height: 48, border: '3px solid rgba(47,93,170,0.15)', borderTopColor: '#2F5DAA', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }}/>
              <p style={{ fontSize: '0.75rem', color: '#6B7FA3', fontWeight: 600 }}>Verifying gate pass…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div className="lux-card" style={{ padding: '48px 36px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(220,38,38,0.08)', border: '2px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg style={{ width: 32, height: 32, color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.02em', marginBottom: 12 }}>Invalid Pass</h2>
              <p style={{ fontSize: '0.82rem', color: '#6B7FA3', lineHeight: 1.7, marginBottom: 28 }}>{error}</p>
              <Link href="/">
                <button className="btn-vp-secondary" style={{ fontSize: '0.65rem', padding: '10px 24px' }}>← Back to Home</button>
              </Link>
            </div>
          )}

          {visit && (
            <div className="fade-up">
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: 6 }}>Digital Gate Pass</p>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#0A1F44' }}>Pass Verified</h1>
              </div>

              <div className="lux-card" style={{ padding: '28px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(47,93,170,0.15)', flexShrink: 0, background: 'rgba(47,93,170,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {visit.visitor?.imageUrl
                      ? <img src={visit.visitor.imageUrl.startsWith('data:') ? visit.visitor.imageUrl : `${API_URL}${visit.visitor.imageUrl}`} alt="visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      : <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2F5DAA' }}>{visit.visitor?.name?.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.01em', marginBottom: 2 }}>{visit.visitor?.name}</h2>
                    <p style={{ fontSize: '0.72rem', color: '#6B7FA3' }}>{visit.visitor?.phone}</p>
                    {visit.visitor?.email && <p style={{ fontSize: '0.65rem', color: '#6B7FA3' }}>{visit.visitor.email}</p>}
                  </div>
                  <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-block', padding: '5px 12px', borderRadius: 20,
                      fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: statusColor[visit.status] || '#64748b',
                      background: statusBg[visit.status] || 'rgba(100,116,139,0.08)',
                      border: `1px solid ${statusColor[visit.status] || '#64748b'}30`,
                    }}>{visit.status}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Meeting With', value: visit.meetWith?.name },
                    { label: 'Purpose', value: visit.purpose },
                    { label: 'Check-In Time', value: visit.fromTime || '—' },
                    { label: 'Duration', value: visit.duration || '—' },
                    { label: visit.scheduledTime ? 'Appointment Date' : 'Visit Date', value: new Date(visit.scheduledTime || visit.createdAt).toLocaleString() },
                    { label: 'Aadhar', value: visit.visitor?.aadhar ? `****${visit.visitor.aadhar.slice(-4)}` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #EEF1F6' }}>
                      <div style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A0AEC0', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A1F44' }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {visit.status === 'Approved' && (
                <div style={{ padding: '14px 20px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <svg style={{ width: 20, height: 20, color: '#16a34a', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700, margin: 0 }}>Visitor is approved. {canAct ? 'Click below to allow entry.' : 'Permit entry.'}</p>
                </div>
              )}
              {visit.status === 'CheckedIn' && (
                <div style={{ padding: '14px 20px', background: 'rgba(47,93,170,0.08)', border: '1px solid rgba(47,93,170,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <svg style={{ width: 20, height: 20, color: '#2F5DAA', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <p style={{ fontSize: '0.72rem', color: '#2F5DAA', fontWeight: 700, margin: 0 }}>Visitor is currently checked in and on premises.</p>
                </div>
              )}
              {visit.status === 'Pending' && (
                <div style={{ padding: '14px 20px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <svg style={{ width: 20, height: 20, color: '#d97706', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, margin: 0 }}>Awaiting host approval. {canAct ? 'You can approve below.' : 'Do not permit entry yet.'}</p>
                </div>
              )}
              {visit.status === 'Rejected' && (
                <div style={{ padding: '14px 20px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <svg style={{ width: 20, height: 20, color: '#dc2626', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                  <p style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700, margin: 0 }}>Visit request was declined. Entry not permitted.</p>
                </div>
              )}
              {visit.status === 'CheckedOut' && (
                <div style={{ padding: '14px 20px', background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <svg style={{ width: 20, height: 20, color: '#64748b', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                  </svg>
                  <p style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, margin: 0 }}>Visitor has already checked out.</p>
                </div>
              )}

              {actionMsg && (
                <div style={{ padding: '12px 16px', background: 'rgba(47,93,170,0.06)', border: '1px solid rgba(47,93,170,0.2)', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, color: '#2F5DAA', marginBottom: 12, textAlign: 'center' }}>
                  {actionMsg}
                </div>
              )}

              {canAct && !actionLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 4 }}>
                  {visit.status === 'Pending' && (user.role === 'Admin' || user.role === 'Employee') && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => doApproveReject('Approved')} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#16a34a', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em' }}>
                        Approve Visit
                      </button>
                      <button onClick={() => doApproveReject('Rejected')} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid rgba(220,38,38,0.3)', background: 'transparent', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em' }}>
                        Reject
                      </button>
                    </div>
                  )}
                  {visit.status === 'Approved' && (
                    <button onClick={() => doAction('checkin', 'Check-in')} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      Mark Checked In — Allow Entry
                    </button>
                  )}
                  {visit.status === 'CheckedIn' && (
                    <button onClick={() => doAction('checkout', 'Check-out')} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: '#64748b', color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
                      Mark Checked Out — Exit
                    </button>
                  )}
                  {canAct && (
                    <Link href="/dashboard">
                      <button style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'transparent', color: '#6B7FA3', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        ← Back to Dashboard
                      </button>
                    </Link>
                  )}
                </div>
              )}

              {canAct && actionLoading && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6B7FA3', fontSize: '0.75rem', fontWeight: 600 }}>Processing…</div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
