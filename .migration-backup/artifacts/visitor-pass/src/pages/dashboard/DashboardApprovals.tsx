import { useEffect, useMemo, useState } from 'react';
import socket, { connectSocket } from '@/utils/socket';
import { API_URL } from '@/lib/api';
import QRCode from 'qrcode';

function QrCodeImage({ token }: { token: string }) {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    if (token) {
      QRCode.toDataURL(token, { width: 220, margin: 2, color: { dark: '#0A1F44', light: '#FFFFFF' } })
        .then(setDataUrl)
        .catch(() => {});
    }
  }, [token]);
  return dataUrl
    ? <img src={dataUrl} alt="QR" style={{ width: '100%', height: '100%', borderRadius: 6 }} />
    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#888', textAlign: 'center' }}>Generating…</div>;
}

interface Visit {
  _id: string;
  purpose: string;
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
  fromTime?: string;
  duration?: string;
  qrToken?: string;
  visitor?: { name: string; phone: string; email?: string; imageUrl?: string };
  meetWith?: { name: string; email?: string };
}

function fmt12(t: string | undefined) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function visitDate(v: Visit): Date {
  if (v.scheduledTime) return new Date(v.scheduledTime);
  return new Date(v.updatedAt);
}

function isPast(v: Visit): boolean {
  const d = visitDate(v);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const vDay = new Date(d); vDay.setHours(0, 0, 0, 0);
  return vDay < today;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function VisitorPass({ visit, past }: { visit: Visit; past?: boolean }) {
  const visitorId = `VMS-${visit._id?.slice(-6).toUpperCase()}`;
  const vd = visitDate(visit);
  const dateLabel = fmtDate(vd);
  const timeLabel = vd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{
      background: past ? 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)' : 'linear-gradient(135deg,#ffffff 0%,#f8fafc 50%,#ffffff 100%)',
      border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden',
      boxShadow: past ? 'none' : '0 4px 24px rgba(10,31,68,0.08)', position: 'relative',
      opacity: past ? 0.8 : 1,
    }}>
      <div style={{ height: 3, background: past ? '#CBD5E1' : 'linear-gradient(90deg,#0A1F44 0%,rgba(47,93,170,0.3) 100%)' }}/>
      <div style={{ background: past ? '#475569' : '#0A1F44', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>Visitor Management System</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', textTransform: 'uppercase' }}>Digital Gate Pass</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>Pass ID</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff' }}>{visitorId}</div>
        </div>
      </div>
      <div style={{ padding: 24, display: 'flex', gap: 20, background: past ? '#f8fafc' : '#ffffff' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 90, height: 110, borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {visit.visitor?.imageUrl
              ? <img src={`${API_URL}${visit.visitor.imageUrl}`} alt="visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : <div style={{ textAlign: 'center', padding: 8 }}><div style={{ fontSize: '1.8rem', marginBottom: 4 }}>👤</div><div style={{ fontSize: '0.45rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No Photo</div></div>
            }
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', background: past ? 'rgba(100,116,139,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${past ? 'rgba(100,116,139,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 6, padding: '3px 0', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: past ? '#64748b' : '#16a34a' }}>{past ? '✓ COMPLETED' : '✓ APPROVED'}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0A1F44', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 4 }}>{visit.visitor?.name || '—'}</div>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#6B7FA3', textTransform: 'uppercase', fontWeight: 800, marginBottom: 16 }}>Visitor</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
            {[
              { label: 'Meet With', value: visit.meetWith?.name || '—' },
              { label: 'Purpose', value: visit.purpose || '—' },
              { label: 'Phone', value: visit.visitor?.phone || '—' },
              { label: 'Date', value: dateLabel },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6B7FA3', fontWeight: 800, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
              </div>
            ))}
          </div>
          {(visit.fromTime || visit.duration) && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {visit.fromTime && <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#6B7FA3', textTransform: 'uppercase', fontWeight: 800 }}>From</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44' }}>{fmt12(visit.fromTime)}</div>
              </div>}
              {visit.duration && <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#6B7FA3', textTransform: 'uppercase', fontWeight: 800 }}>Duration</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44' }}>{visit.duration}</div>
              </div>}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 100, height: 100, background: '#fff', borderRadius: 12, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(10,31,68,0.08)' }}>
            {visit.qrToken
              ? <QrCodeImage token={visit.qrToken} />
              : <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.2rem' }}>🔲</div><div style={{ fontSize: '0.4rem', color: '#888', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No QR</div></div>
            }
          </div>
          <div style={{ fontSize: '0.45rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800, textAlign: 'center' }}>Scan at Gate</div>
        </div>
      </div>
      <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.5rem', color: '#6B7FA3', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>Approved {dateLabel} at {timeLabel}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[...Array(8)].map((_, i) => <div key={i} style={{ width: 4, height: 16, background: i % 2 === 0 ? '#0A1F44' : '#E2E8F0', borderRadius: 1 }}/>)}
          <div style={{ marginLeft: 8, fontSize: '0.5rem', fontFamily: 'monospace', color: '#6B7FA3', alignSelf: 'center' }}>{visitorId}</div>
        </div>
      </div>
    </div>
  );
}

function matchesSearch(v: Visit, q: string) {
  const s = q.toLowerCase();
  return (
    v.visitor?.name?.toLowerCase().includes(s) ||
    v.visitor?.phone?.includes(s) ||
    v.meetWith?.name?.toLowerCase().includes(s) ||
    v.purpose?.toLowerCase().includes(s) ||
    false
  );
}

function matchesDate(v: Visit, from: string, to: string) {
  if (!from && !to) return true;
  const d = visitDate(v);
  d.setHours(0, 0, 0, 0);
  if (from) { const f = new Date(from); f.setHours(0,0,0,0); if (d < f) return false; }
  if (to)   { const t = new Date(to);   t.setHours(0,0,0,0); if (d > t) return false; }
  return true;
}

export default function DashboardApprovals() {
  const [tab, setTab] = useState('pending');
  const [pendingVisits, setPendingVisits] = useState<Visit[]>([]);
  const [approvedVisits, setApprovedVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pastOpen, setPastOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    fetchPending();
    connectSocket(user);
    socket.on('new_visit', () => fetchPending());
    socket.on('new_visit_request', () => fetchPending());
    socket.on('approval_updates', () => { fetchPending(); if (tab === 'approved') fetchApproved(); });
    return () => { socket.off('new_visit'); socket.off('new_visit_request'); socket.off('approval_updates'); };
  }, []);

  useEffect(() => {
    if (tab === 'approved' && approvedVisits.length === 0) fetchApproved();
  }, [tab]);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/visits/pending`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setPendingVisits(data);
    } catch {} finally { setLoading(false); }
  };

  const fetchApproved = async () => {
    setApprovedLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/visits/approved`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setApprovedVisits(data);
    } catch {} finally { setApprovedLoading(false); }
  };

  const handleUpdate = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) { fetchPending(); if (status === 'Approved') { setTimeout(() => { setTab('approved'); fetchApproved(); }, 400); } }
    } catch {}
  };

  const filtered = useMemo(() => {
    return approvedVisits.filter(v => matchesSearch(v, search) && matchesDate(v, dateFrom, dateTo));
  }, [approvedVisits, search, dateFrom, dateTo]);

  const upcoming = useMemo(() => filtered.filter(v => !isPast(v)).sort((a, b) => visitDate(a).getTime() - visitDate(b).getTime()), [filtered]);
  const past     = useMemo(() => filtered.filter(v =>  isPast(v)).sort((a, b) => visitDate(b).getTime() - visitDate(a).getTime()), [filtered]);

  const hasFilters = search || dateFrom || dateTo;
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); };

  return (
    <div className="fade-up w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Approvals</h1>
        <p className="text-[#6B7FA3] text-sm">Review and authorize visitor access in real-time.</p>
      </div>

      <div className="flex gap-1 mb-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-1 w-fit">
        {[
          { key: 'pending',  label: 'Pending',  count: pendingVisits.length },
          { key: 'approved', label: 'Approved', count: approvedVisits.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="relative px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200"
            style={{ background: tab === t.key ? '#0A1F44' : 'transparent', color: tab === t.key ? '#fff' : '#6B7FA3' }}>
            {t.label}
            {t.count > 0 && <span style={{ marginLeft: 6, background: tab === t.key ? 'rgba(255,255,255,0.2)' : '#E2E8F0', color: tab === t.key ? '#fff' : '#6B7FA3', borderRadius: 9999, padding: '1px 7px', fontSize: '0.6rem', fontWeight: 900 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        loading ? (
          <div className="py-20 text-center"><div className="w-8 h-8 rounded-full border-2 border-[#E2E8F0] border-t-[#2F5DAA] animate-spin mx-auto mb-4"/><p className="text-[#6B7FA3] text-xs uppercase tracking-widest">Syncing live feed…</p></div>
        ) : pendingVisits.length === 0 ? (
          <div className="py-20 text-center border border-[#E2E8F0] bg-[#F8FAFC] rounded-3xl"><div className="text-4xl mb-4">✓</div><p className="text-[#6B7FA3] text-sm">No pending visitor requests.</p></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingVisits.map((visit) => (
              <div key={visit._id} className="vp-card p-8 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6"><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"/><span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Awaiting Decision</span></div>
                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E2E8F0] shrink-0">
                    {visit.visitor?.imageUrl
                      ? <img src={`${API_URL}${visit.visitor.imageUrl}`} className="w-full h-full object-cover" alt="visitor"/>
                      : <div className="w-full h-full bg-[#EEF3FB] flex items-center justify-center text-[#2F5DAA] text-sm font-black">{visit.visitor?.name?.charAt(0)}</div>
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-[#0A1F44] uppercase tracking-tight">{visit.visitor?.name}</h3>
                    <p className="text-[#2F5DAA] text-[10px] uppercase tracking-widest font-black mt-1">Host: {visit.meetWith?.name}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-[#6B7FA3]">Purpose: <span className="text-[#0A1F44] font-semibold">{visit.purpose}</span></p>
                      <p className="text-xs text-[#6B7FA3]">Phone: <span className="text-[#0A1F44] font-mono">{visit.visitor?.phone}</span></p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => handleUpdate(visit._id, 'Approved')} className="flex-1 btn-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">✓ Approve Access</button>
                  <button onClick={() => handleUpdate(visit._id, 'Rejected')} className="flex-1 bg-[#F8FAFC] hover:bg-red-50 text-[#6B7FA3] hover:text-red-500 border border-[#E2E8F0] hover:border-red-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">✕ Deny</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'approved' && (
        approvedLoading ? (
          <div className="py-20 text-center"><div className="w-8 h-8 rounded-full border-2 border-[#E2E8F0] border-t-[#2F5DAA] animate-spin mx-auto mb-4"/></div>
        ) : (
          <div>
            {/* ── Search + Date Filters ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#6B7FA3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search visitor, host, purpose…"
                  style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.78rem', fontWeight: 600, color: '#0A1F44', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                <svg style={{ width: 14, height: 14, color: '#6B7FA3', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ padding: '9px 10px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 600, color: '#0A1F44', outline: 'none', background: '#fff' }}/>
                <span style={{ fontSize: '0.7rem', color: '#6B7FA3', fontWeight: 700 }}>to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ padding: '9px 10px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 600, color: '#0A1F44', outline: 'none', background: '#fff' }}/>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} style={{ padding: '9px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.7rem', fontWeight: 800, color: '#6B7FA3', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Clear
                </button>
              )}
            </div>

            {/* ── Upcoming / Active passes ── */}
            {upcoming.length === 0 && !hasFilters ? (
              <div className="py-14 text-center border border-[#E2E8F0] bg-[#F8FAFC] rounded-3xl mb-8">
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>📅</div>
                <p className="text-[#6B7FA3] text-sm">No upcoming approved visits.</p>
              </div>
            ) : upcoming.length === 0 && hasFilters ? (
              <div className="py-14 text-center border border-[#E2E8F0] bg-[#F8FAFC] rounded-3xl mb-8">
                <p className="text-[#6B7FA3] text-sm">No results match your search.</p>
              </div>
            ) : (
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }}/>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0A1F44' }}>Upcoming — {upcoming.length} pass{upcoming.length !== 1 ? 'es' : ''}</span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {upcoming.map(v => <VisitorPass key={v._id} visit={v}/>)}
                </div>
              </div>
            )}

            {/* ── Past Approvals (collapsible) ── */}
            {past.length > 0 && (
              <div>
                <button
                  onClick={() => setPastOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', marginBottom: pastOpen ? 20 : 0, textAlign: 'left' }}
                >
                  <svg style={{ width: 14, height: 14, color: '#6B7FA3', transition: 'transform 0.2s', transform: pastOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6B7FA3' }}>Past Approvals</span>
                  <span style={{ marginLeft: 'auto', background: '#E2E8F0', color: '#6B7FA3', borderRadius: 9999, padding: '2px 10px', fontSize: '0.6rem', fontWeight: 900 }}>{past.length}</span>
                </button>
                {pastOpen && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {past.map(v => <VisitorPass key={v._id} visit={v} past/>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
