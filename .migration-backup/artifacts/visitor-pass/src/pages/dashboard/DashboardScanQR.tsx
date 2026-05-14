import { useState } from 'react';
import { useLocation } from 'wouter';
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

export default function DashboardScanQR() {
  const [tokenInput, setTokenInput] = useState('');
  const [visit, setVisit] = useState<Visit | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [, navigate] = useLocation();

  const authToken = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const extractToken = (raw: string): string => {
    const trimmed = raw.trim();
    const match = trimmed.match(/\/scan\/([a-zA-Z0-9\-]+)/);
    if (match) return match[1];
    return trimmed;
  };

  const lookupVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = extractToken(tokenInput);
    if (!tok) return;
    setLookupLoading(true); setLookupError(''); setVisit(null); setActionMsg('');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/scan/${tok}`);
      if (res.ok) { const d = await res.json(); setVisit(d); }
      else setLookupError('No visit found for this QR code. Please check the token or URL and try again.');
    } catch { setLookupError('Connection error. Please try again.'); }
    finally { setLookupLoading(false); }
  };

  const resolvedToken = visit ? extractToken(tokenInput) : '';

  const doAction = async (endpoint: string, label: string) => {
    if (!authToken || !resolvedToken) return;
    setActionLoading(true); setActionMsg('');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${endpoint}/${resolvedToken}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || `${label} successful`);
        const refetch = await fetch(`${API_URL}/api/v1/visits/scan/${resolvedToken}`);
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
        const refetch = await fetch(`${API_URL}/api/v1/visits/scan/${resolvedToken}`);
        if (refetch.ok) setVisit(await refetch.json());
      } else setActionMsg(data.message || 'Action failed');
    } catch { setActionMsg('Network error. Please try again.'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
        <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '4px' }}>Gate Access</p>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0A1F44' }}>Scan / Look Up QR</h1>
        <p style={{ fontSize: '0.75rem', color: '#6B7FA3', marginTop: '2px' }}>Enter a visitor's QR token or paste the full scan URL to verify and manage their entry.</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {/* Lookup form */}
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
                  placeholder="Paste token or full URL from visitor's email QR code…"
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
                <li>Ask the visitor to show their approval email on their phone</li>
                <li>Copy the QR token from the email or paste the full <code style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '4px' }}>/scan/…</code> URL</li>
                <li>Click Look Up to see their details and take action</li>
              </ul>
            </div>
          </form>

          {lookupError && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
              {lookupError}
            </div>
          )}
        </div>

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
                  onClick={() => { setVisit(null); setTokenInput(''); setActionMsg(''); setLookupError(''); }}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'transparent', color: '#6B7FA3', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Look Up Another
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
