import { useEffect, useMemo, useState } from 'react';
import socket, { connectSocket } from '@/utils/socket';
import { API_URL } from '@/lib/api';
import QRCode from 'qrcode';

function QrCodeImage({ token }: { token: string }) {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    if (token) {
      const scanUrl = `${window.location.origin}/scan/${token}`;
      QRCode.toDataURL(scanUrl, { width: 220, margin: 2, color: { dark: '#0A1F44', light: '#FFFFFF' } })
        .then(setDataUrl).catch(() => {});
    }
  }, [token]);
  return dataUrl
    ? <img src={dataUrl} alt="QR" style={{ width: '100%', height: '100%', borderRadius: 6 }} />
    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#888', textAlign: 'center' }}>Generating…</div>;
}

interface DivertHistory { from?: { name: string }; to?: { name: string }; by?: { name: string }; reason?: string; at: string; }
interface Visit {
  _id: string; purpose: string; scheduledTime?: string; createdAt: string; updatedAt: string;
  fromTime?: string; duration?: string; qrToken?: string; isVariableEmployee?: boolean;
  visitor?: { name: string; phone: string; email?: string; imageUrl?: string; address?: string; gender?: string; aadhar?: string };
  meetWith?: { _id?: string; name: string; email?: string };
  meetWithDept?: { _id?: string; name: string };
  divertHistory?: DivertHistory[];
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
  const d = visitDate(v); const today = new Date(); today.setHours(0,0,0,0); const vDay = new Date(d); vDay.setHours(0,0,0,0); return vDay < today;
}
function fmtDate(d: Date) { return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

// Divert modal
interface DivertModalProps {
  visit: Visit;
  onClose: () => void;
  onDiverted: () => void;
}
function DivertModal({ visit, onClose, onDiverted }: DivertModalProps) {
  const [employees, setEmployees] = useState<{ _id: string; name: string; designation?: { name: string } }[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const deptId = visit.meetWith
    ? (visit.meetWith as any).department || null
    : visit.meetWithDept?._id || null;

  useEffect(() => {
    setLoading(true);
    const url = deptId
      ? `${API_URL}/api/v1/users/employees?department=${deptId}`
      : `${API_URL}/api/v1/users/employees`;
    fetch(url).then(r => r.json())
      .then(d => { setEmployees(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [deptId]);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    e._id !== visit.meetWith?._id
  );

  const handleDivert = async () => {
    if (!selectedEmp) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${visit._id}/divert`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toEmployeeId: selectedEmp, reason }),
      });
      if (res.ok) { onDiverted(); onClose(); }
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,31,68,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(10,31,68,0.2)', overflow: 'hidden' }}>
        <div style={{ background: '#0A1F44', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>Divert Visit</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{visit.visitor?.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {visit.meetWithDept && (
            <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700 }}>
              Department: {visit.meetWithDept.name}
            </div>
          )}
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6B7FA3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
            {deptId ? 'Reassign to another employee in this department' : 'Choose employee'}
          </div>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#2F5DAA'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 10, marginBottom: 14 }}>
            {loading && <div style={{ padding: 20, textAlign: 'center', color: '#A0AEC0', fontSize: '0.75rem' }}>Loading…</div>}
            {!loading && filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#A0AEC0', fontSize: '0.75rem' }}>No employees found</div>}
            {!loading && filtered.map((emp, idx) => (
              <button key={emp._id} type="button" onClick={() => setSelectedEmp(emp._id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: selectedEmp === emp._id ? 'rgba(47,93,170,0.07)' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (selectedEmp !== emp._id) (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                onMouseLeave={e => { if (selectedEmp !== emp._id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: selectedEmp === emp._id ? 'rgba(47,93,170,0.15)' : 'rgba(47,93,170,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#2F5DAA', flexShrink: 0 }}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0A1F44' }}>{emp.name}</div>
                </div>
                {selectedEmp === emp._id && <div style={{ marginLeft: 'auto', color: '#2F5DAA', fontWeight: 900, fontSize: '0.8rem' }}>✓</div>}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6B7FA3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Reason (optional)</div>
            <input type="text" placeholder="e.g. Out of office, better fit for this query…" value={reason} onChange={e => setReason(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#2F5DAA'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.72rem', fontWeight: 800, color: '#6B7FA3', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cancel</button>
            <button onClick={handleDivert} disabled={!selectedEmp || submitting}
              style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: selectedEmp ? '#0A1F44' : '#E2E8F0', fontSize: '0.72rem', fontWeight: 900, color: selectedEmp ? '#fff' : '#94A3B8', cursor: selectedEmp ? 'pointer' : 'not-allowed', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {submitting ? 'Diverting…' : '→ Divert Visit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitorPass({ visit, past, onDivert }: { visit: Visit; past?: boolean; onDivert?: (v: Visit) => void }) {
  const visitorId = `VMS-${visit._id?.slice(-6).toUpperCase()}`;
  const vd = visitDate(visit);
  const dateLabel = fmtDate(vd);
  const timeLabel = vd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const hostName = visit.meetWith?.name || (visit.isVariableEmployee ? `${visit.meetWithDept?.name || 'Dept'} — Variable` : '—');

  return (
    <div style={{
      background: past ? 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)' : 'linear-gradient(135deg,#ffffff 0%,#f8fafc 50%,#ffffff 100%)',
      border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden',
      boxShadow: past ? 'none' : '0 4px 24px rgba(10,31,68,0.08)', position: 'relative', opacity: past ? 0.8 : 1,
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
              ? <img src={visit.visitor.imageUrl.startsWith('data:') ? visit.visitor.imageUrl : `${API_URL}${visit.visitor.imageUrl}`} alt="visitor" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
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
              { label: 'Meet With', value: hostName },
              { label: 'Purpose', value: visit.purpose || '—' },
              { label: 'Phone', value: visit.visitor?.phone || '—' },
              { label: 'Date', value: dateLabel },
              ...(visit.visitor?.email ? [{ label: 'Email', value: visit.visitor.email }] : []),
              ...(visit.meetWithDept && visit.isVariableEmployee ? [{ label: 'Department', value: visit.meetWithDept.name }] : []),
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
          {/* Divert history */}
          {visit.divertHistory && visit.divertHistory.length > 0 && (
            <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#7C3AED', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Divert History</div>
              {visit.divertHistory.map((d, i) => (
                <div key={i} style={{ fontSize: '0.62rem', color: '#6B7FA3', marginBottom: 2 }}>
                  {d.from?.name || 'Dept'} → <strong style={{ color: '#0A1F44' }}>{d.to?.name}</strong>
                  {d.reason ? ` · ${d.reason}` : ''}
                </div>
              ))}
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
          {!past && onDivert && (
            <button onClick={() => onDivert(visit)} style={{ marginTop: 4, padding: '5px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.5rem', fontWeight: 800, color: '#6B7FA3', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
              ↪ Divert
            </button>
          )}
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
  return (v.visitor?.name?.toLowerCase().includes(s) || v.visitor?.phone?.includes(s) || v.meetWith?.name?.toLowerCase().includes(s) || v.meetWithDept?.name?.toLowerCase().includes(s) || v.purpose?.toLowerCase().includes(s) || false);
}
function matchesDate(v: Visit, from: string, to: string) {
  if (!from && !to) return true;
  const d = visitDate(v); d.setHours(0,0,0,0);
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
  const [divertVisit, setDivertVisit] = useState<Visit | null>(null);

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

  const filtered = useMemo(() => approvedVisits.filter(v => matchesSearch(v, search) && matchesDate(v, dateFrom, dateTo)), [approvedVisits, search, dateFrom, dateTo]);
  const upcoming = useMemo(() => filtered.filter(v => !isPast(v)).sort((a, b) => visitDate(a).getTime() - visitDate(b).getTime()), [filtered]);
  const past     = useMemo(() => filtered.filter(v =>  isPast(v)).sort((a, b) => visitDate(b).getTime() - visitDate(a).getTime()), [filtered]);
  const hasFilters = search || dateFrom || dateTo;
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); };

  return (
    <div className="fade-up w-full">
      {divertVisit && (
        <DivertModal
          visit={divertVisit}
          onClose={() => setDivertVisit(null)}
          onDiverted={() => { fetchApproved(); fetchPending(); }}
        />
      )}

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
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"/>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Awaiting Decision</span>
                  {visit.isVariableEmployee && (
                    <span style={{ marginLeft: 4, background: 'rgba(124,58,237,0.1)', color: '#7C3AED', borderRadius: 6, padding: '2px 8px', fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      Variable · {visit.meetWithDept?.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E2E8F0] shrink-0">
                    {visit.visitor?.imageUrl
                      ? <img src={visit.visitor.imageUrl.startsWith('data:') ? visit.visitor.imageUrl : `${API_URL}${visit.visitor.imageUrl}`} className="w-full h-full object-cover" alt="visitor"/>
                      : <div className="w-full h-full bg-[#EEF3FB] flex items-center justify-center text-[#2F5DAA] text-sm font-black">{visit.visitor?.name?.charAt(0)}</div>
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-[#0A1F44] uppercase tracking-tight">{visit.visitor?.name}</h3>
                    <p className="text-[#2F5DAA] text-[10px] uppercase tracking-widest font-black mt-1">
                      {visit.isVariableEmployee
                        ? <>Dept: <span style={{ color: '#7C3AED' }}>{visit.meetWithDept?.name || '—'}</span></>
                        : <>Host: {visit.meetWith?.name || '—'}</>
                      }
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-[#6B7FA3]">Purpose: <span className="text-[#0A1F44] font-semibold">{visit.purpose}</span></p>
                      <p className="text-xs text-[#6B7FA3]">Phone: <span className="text-[#0A1F44] font-mono">{visit.visitor?.phone}</span></p>
                      {visit.visitor?.email && <p className="text-xs text-[#6B7FA3]">Email: <span className="text-[#0A1F44]">{visit.visitor.email}</span></p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => handleUpdate(visit._id, 'Approved')} className="flex-1 btn-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {visit.isVariableEmployee ? '✓ Accept & Assign to Me' : '✓ Approve Access'}
                  </button>
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
            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#6B7FA3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitor, host, purpose…"
                  style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.78rem', fontWeight: 600, color: '#0A1F44', outline: 'none', background: '#fff', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                <svg style={{ width: 14, height: 14, color: '#6B7FA3', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '9px 10px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 600, color: '#0A1F44', outline: 'none', background: '#fff' }}/>
                <span style={{ fontSize: '0.7rem', color: '#6B7FA3', fontWeight: 700 }}>to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '9px 10px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 600, color: '#0A1F44', outline: 'none', background: '#fff' }}/>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} style={{ padding: '9px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.7rem', fontWeight: 800, color: '#6B7FA3', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Clear</button>
              )}
            </div>

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
                  {upcoming.map(v => <VisitorPass key={v._id} visit={v} onDivert={setDivertVisit}/>)}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <button onClick={() => setPastOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', marginBottom: pastOpen ? 20 : 0, textAlign: 'left' }}>
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
