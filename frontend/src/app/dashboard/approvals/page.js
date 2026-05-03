'use client';
import { useEffect, useState, useRef } from 'react';
import socket, { connectSocket } from '@/utils/socket';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Visitor Pass Card ─────────────────────────────────────────────────────────
function VisitorPass({ visit }) {
  const ref = useRef(null);
  const visitorId = `VMS-${visit._id?.slice(-6).toUpperCase()}`;
  const approvedDate = visit.updatedAt
    ? new Date(visit.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const approvedTime = visit.updatedAt
    ? new Date(visit.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';

  // Format times from HH:MM 24h to 12h display
  const fmt12 = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="group relative" ref={ref}>
      {/* Premium Visitor Pass */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(10,31,68,0.08)',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #0A1F44 0%, rgba(47,93,170,0.3) 100%)' }} />

        {/* Header strip */}
        <div style={{ background: '#0A1F44', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>Visitor Management System</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', textTransform: 'uppercase' }}>Digital Gate Pass</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>Pass ID</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff' }}>{visitorId}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', gap: 20, background: '#ffffff' }}>
          {/* Photo */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 90, height: 110, borderRadius: 12,
              border: '1px solid #E2E8F0',
              overflow: 'hidden', background: '#F8FAFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {visit.visitor?.imageUrl ? (
                <img src={`${API}${visit.visitor.imageUrl}`} alt="visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: 8 }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>👤</div>
                  <div style={{ fontSize: '0.45rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No Photo</div>
                </div>
              )}
            </div>
            {/* Status badge */}
            <div style={{
              marginTop: 8, textAlign: 'center', background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6,
              padding: '3px 0', fontSize: '0.5rem', fontWeight: 900,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: '#16a34a'
            }}>
              ✓ APPROVED
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0A1F44', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 4 }}>
              {visit.visitor?.name || '—'}
            </div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#6B7FA3', textTransform: 'uppercase', fontWeight: 800, marginBottom: 16 }}>
              Visitor
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {[
                { label: 'Meet With', value: visit.meetWith?.name || '—', sub: visit.meetWith?.email },
                { label: 'Purpose',   value: visit.purpose || '—' },
                { label: 'Phone',     value: visit.visitor?.phone || '—' },
                { label: 'Date',      value: approvedDate },
              ].map(({ label, value, sub }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6B7FA3', fontWeight: 800, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                  {sub && <div style={{ fontSize: '0.55rem', color: '#6B7FA3', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>}
                </div>
              ))}
            </div>

            {/* Time range */}
            {(visit.fromTime || visit.toTime) && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {visit.fromTime && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                    <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#6B7FA3', textTransform: 'uppercase', fontWeight: 800 }}>From</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44' }}>{fmt12(visit.fromTime)}</div>
                  </div>
                )}
                {visit.toTime && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                    <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#6B7FA3', textTransform: 'uppercase', fontWeight: 800 }}>To</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44' }}>{fmt12(visit.toTime)}</div>
                  </div>
                )}
                {visit.duration && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                    <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#6B7FA3', textTransform: 'uppercase', fontWeight: 800 }}>Duration</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44' }}>{visit.duration}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QR */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 100, height: 100, background: '#fff', borderRadius: 12, padding: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(10,31,68,0.08)'
            }}>
              {visit.qrToken ? (
                // Use a public QR API to render the token as QR
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(visit.qrToken)}&color=000000&bgcolor=FFFFFF`}
                  alt="QR Code"
                  style={{ width: '100%', height: '100%', borderRadius: 6 }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: '1.2rem' }}>🔲</div>
                <div style={{ fontSize: '0.4rem', color: '#888', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No QR</div>
              </div>
            </div>
            <div style={{ fontSize: '0.45rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800, textAlign: 'center' }}>Scan at Gate</div>
          </div>
        </div>

        {/* Footer strip */}
        <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.5rem', color: '#6B7FA3', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>
            Approved {approvedDate} at {approvedTime}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ width: 4, height: 16, background: i % 2 === 0 ? '#0A1F44' : '#E2E8F0', borderRadius: 1 }} />
            ))}
            <div style={{ marginLeft: 8, fontSize: '0.5rem', fontFamily: 'monospace', color: '#6B7FA3', alignSelf: 'center' }}>{visitorId}</div>
          </div>
        </div>

        {/* Decorative corner circles */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.015)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ApprovalsPage() {
  const [tab, setTab] = useState('pending');
  const [pendingVisits, setPendingVisits] = useState([]);
  const [approvedVisits, setApprovedVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    fetchPending();
    connectSocket(user);

    socket.on('new_visit', () => fetchPending());
    socket.on('new_visit_request', () => fetchPending());
    socket.on('approval_updates', () => { fetchPending(); if (tab === 'approved') fetchApproved(); });

    return () => {
      socket.off('new_visit');
      socket.off('new_visit_request');
      socket.off('approval_updates');
    };
  }, []);

  useEffect(() => {
    if (tab === 'approved' && approvedVisits.length === 0) fetchApproved();
  }, [tab]);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/visits/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPendingVisits(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchApproved = async () => {
    setApprovedLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/visits/approved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setApprovedVisits(data);
    } catch (err) { console.error(err); }
    finally { setApprovedLoading(false); }
  };

  const handleUpdate = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/v1/visits/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchPending();
        if (status === 'Approved') {
          // Switch to approved tab and refresh
          setTimeout(() => { setTab('approved'); fetchApproved(); }, 400);
        }
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fade-up w-full px-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Approvals</h1>
        <p className="text-gray-500 text-sm">Review and authorize visitor access in real-time.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-1 w-fit">
        {[
          { key: 'pending',  label: 'Pending',  count: pendingVisits.length },
          { key: 'approved', label: 'Approved', count: approvedVisits.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200"
            style={{
              background: tab === t.key ? '#0A1F44' : 'transparent',
              color: tab === t.key ? '#fff' : '#6B7FA3',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 6, background: tab === t.key ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                color: tab === t.key ? '#fff' : '#6B7FA3',
                borderRadius: 9999, padding: '1px 7px', fontSize: '0.6rem', fontWeight: 900
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── PENDING TAB ── */}
      {tab === 'pending' && (
        loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#E2E8F0] border-t-[#2F5DAA] animate-spin mx-auto mb-4" />
            <p className="text-[#6B7FA3] text-xs uppercase tracking-widest">Syncing live feed…</p>
          </div>
        ) : pendingVisits.length === 0 ? (
          <div className="py-20 text-center border border-[#E2E8F0] bg-[#F8FAFC] rounded-3xl">
            <div className="text-4xl mb-4">✓</div>
            <p className="text-[#6B7FA3] text-sm">No pending visitor requests.</p>
            <p className="text-[#6B7FA3] text-xs mt-1">All clear — nothing to approve right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingVisits.map((visit) => (
              <div key={visit._id} className="vp-card p-8 relative overflow-hidden group">
                {/* Pending request header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Awaiting Decision</span>
                </div>

                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E2E8F0] shrink-0">
                    {visit.visitor?.imageUrl ? (
                      <img src={`${API}${visit.visitor.imageUrl}`} className="w-full h-full object-cover" alt="visitor" />
                    ) : (
                      <div className="w-full h-full bg-[#EEF3FB] flex items-center justify-center text-[#2F5DAA] text-sm font-black">
                        {visit.visitor?.name?.charAt(0)}
                      </div>
                    )}
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
                  <button
                    onClick={() => handleUpdate(visit._id, 'Approved')}
                    className="flex-1 btn-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    ✓ Approve Access
                  </button>
                  <button
                    onClick={() => handleUpdate(visit._id, 'Rejected')}
                    className="flex-1 bg-[#F8FAFC] hover:bg-red-50 text-[#6B7FA3] hover:text-red-500 border border-[#E2E8F0] hover:border-red-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    ✕ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── APPROVED TAB ── */}
      {tab === 'approved' && (
        approvedLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#E2E8F0] border-t-[#2F5DAA] animate-spin mx-auto mb-4" />
            <p className="text-[#6B7FA3] text-xs uppercase tracking-widest">Loading passes…</p>
          </div>
        ) : approvedVisits.length === 0 ? (
          <div className="py-20 text-center border border-[#E2E8F0] bg-[#F8FAFC] rounded-3xl">
            <div className="text-4xl mb-4">🎫</div>
            <p className="text-[#6B7FA3] text-sm">No approved visits yet.</p>
            <p className="text-[#6B7FA3] text-xs mt-1">Approved visitor passes will appear here.</p>
          </div>
        ) : (
          <div>
            <p className="text-[#6B7FA3] text-xs uppercase tracking-widest mb-6 font-black">{approvedVisits.length} Active Pass{approvedVisits.length !== 1 ? 'es' : ''}</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {approvedVisits.map(visit => (
                <VisitorPass key={visit._id} visit={visit} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
