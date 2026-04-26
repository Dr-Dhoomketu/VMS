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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.2) 100%)' }} />

        {/* Header strip */}
        <div style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#888', fontWeight: 800 }}>Visitor Management System</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#000', textTransform: 'uppercase' }}>Digital Gate Pass</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', fontWeight: 800 }}>Pass ID</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, fontFamily: 'monospace', color: '#000' }}>{visitorId}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', gap: 20 }}>
          {/* Photo */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 90, height: 110, borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.1)',
              overflow: 'hidden', background: 'rgba(255,255,255,0.04)',
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
              marginTop: 8, textAlign: 'center', background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6,
              padding: '3px 0', fontSize: '0.5rem', fontWeight: 900,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: '#22c55e'
            }}>
              ✓ APPROVED
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 4 }}>
              {visit.visitor?.name || '—'}
            </div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: 16 }}>
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
                  <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#555', fontWeight: 800, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                  {sub && <div style={{ fontSize: '0.55rem', color: '#444', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>}
                </div>
              ))}
            </div>

            {/* Time range */}
            {(visit.fromTime || visit.toTime) && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {visit.fromTime && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                    <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase', fontWeight: 800 }}>From</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{fmt12(visit.fromTime)}</div>
                  </div>
                )}
                {visit.toTime && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                    <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase', fontWeight: 800 }}>To</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{fmt12(visit.toTime)}</div>
                  </div>
                )}
                {visit.duration && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '5px 10px', flex: 1 }}>
                    <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase', fontWeight: 800 }}>Duration</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{visit.duration}</div>
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
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 30px rgba(255,255,255,0.05)'
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
        <div style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.5rem', color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>
            Approved {approvedDate} at {approvedTime}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ width: 4, height: 16, background: i % 2 === 0 ? '#333' : '#222', borderRadius: 1 }} />
            ))}
            <div style={{ marginLeft: 8, fontSize: '0.5rem', fontFamily: 'monospace', color: '#444', alignSelf: 'center' }}>{visitorId}</div>
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
      <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 w-fit">
        {[
          { key: 'pending',  label: 'Pending',  count: pendingVisits.length },
          { key: 'approved', label: 'Approved', count: approvedVisits.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200"
            style={{
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#000' : '#555',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 6, background: tab === t.key ? '#000' : 'rgba(255,255,255,0.1)',
                color: tab === t.key ? '#fff' : '#666',
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
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-xs uppercase tracking-widest">Syncing live feed…</p>
          </div>
        ) : pendingVisits.length === 0 ? (
          <div className="py-20 text-center border border-white/5 bg-white/[0.02] rounded-3xl">
            <div className="text-4xl mb-4">✓</div>
            <p className="text-gray-500 text-sm">No pending visitor requests.</p>
            <p className="text-gray-600 text-xs mt-1">All clear — nothing to approve right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingVisits.map((visit) => (
              <div key={visit._id} className="holographic-glass p-8 border border-white/5 bg-white/[0.03] rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Pending request header */}
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em]">Awaiting Decision</span>
                </div>

                <div className="flex gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                    {visit.visitor?.imageUrl ? (
                      <img src={`${API}${visit.visitor.imageUrl}`} className="w-full h-full object-cover" alt="visitor" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-[8px] text-gray-500 uppercase font-black">No Photo</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{visit.visitor?.name}</h3>
                    <p className="text-blue-400 text-[10px] uppercase tracking-widest font-black mt-1">Host: {visit.meetWith?.name}</p>
                    <div className="mt-4 space-y-1">
                      <p className="text-xs text-gray-400">Purpose: <span className="text-gray-200 font-semibold">{visit.purpose}</span></p>
                      <p className="text-xs text-gray-400">Phone: <span className="text-gray-200 font-mono">{visit.visitor?.phone}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 relative z-10">
                  <button
                    onClick={() => handleUpdate(visit._id, 'Approved')}
                    className="flex-1 btn-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                  >
                    ✓ Approve Access
                  </button>
                  <button
                    onClick={() => handleUpdate(visit._id, 'Rejected')}
                    className="flex-1 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-white/5 hover:border-red-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
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
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-xs uppercase tracking-widest">Loading passes…</p>
          </div>
        ) : approvedVisits.length === 0 ? (
          <div className="py-20 text-center border border-white/5 bg-white/[0.02] rounded-3xl">
            <div className="text-4xl mb-4">🎫</div>
            <p className="text-gray-500 text-sm">No approved visits yet.</p>
            <p className="text-gray-600 text-xs mt-1">Approved visitor passes will appear here.</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-6 font-black">{approvedVisits.length} Active Pass{approvedVisits.length !== 1 ? 'es' : ''}</p>
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
