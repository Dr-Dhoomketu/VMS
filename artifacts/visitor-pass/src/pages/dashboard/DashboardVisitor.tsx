import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

interface Visit {
  _id: string; purpose: string; createdAt: string; status: string;
  checkoutTime?: string; scheduledTime?: string; isVariableEmployee?: boolean;
  visitor?: { name: string; phone?: string; email?: string; aadhar?: string; address?: string; gender?: string; imageUrl?: string };
  meetWith?: { _id?: string; name: string; email?: string };
  meetWithDept?: { _id?: string; name: string };
}

interface DivertModalProps {
  visit: Visit;
  onClose: () => void;
  onDiverted: () => void;
}

function DivertModal({ visit, onClose, onDiverted }: DivertModalProps) {
  const [employees, setEmployees] = useState<{ _id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const deptId = visit.meetWithDept?._id || null;

  useEffect(() => {
    setLoading(true);
    const url = deptId
      ? `${API_URL}/api/v1/users/employees?department=${deptId}`
      : `${API_URL}/api/v1/users/employees`;
    fetch(url).then(r => r.json())
      .then(d => { setEmployees(Array.isArray(d) ? d.filter((e: any) => e._id !== visit.meetWith?._id) : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [deptId]);

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

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
          {deptId && (
            <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700 }}>
              Department: {visit.meetWithDept?.name}
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
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none', background: selectedEmp === emp._id ? 'rgba(47,93,170,0.07)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (selectedEmp !== emp._id) (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                onMouseLeave={e => { if (selectedEmp !== emp._id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(47,93,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#2F5DAA', flexShrink: 0 }}>{emp.name.charAt(0)}</div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0A1F44' }}>{emp.name}</span>
                {selectedEmp === emp._id && <div style={{ marginLeft: 'auto', color: '#2F5DAA', fontWeight: 900 }}>✓</div>}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6B7FA3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Reason (optional)</div>
            <input type="text" placeholder="e.g. Out of office, better fit…" value={reason} onChange={e => setReason(e.target.value)}
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

interface ExpandedRowProps { visit: Visit; onCheckout: (id: string) => void; onDivert: (v: Visit) => void; userRole: string; }
function ExpandedRow({ visit, onCheckout, onDivert, userRole }: ExpandedRowProps) {
  const v = visit;
  return (
    <tr>
      <td colSpan={9} style={{ padding: 0 }}>
        <div style={{ margin: '0 24px 12px', padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px 24px' }}>
          {v.visitor?.address && (
            <div><div style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8', fontWeight: 800, marginBottom: 2 }}>Address</div><div style={{ fontSize: '0.78rem', color: '#0A1F44' }}>{v.visitor.address}</div></div>
          )}
          {v.visitor?.gender && (
            <div><div style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8', fontWeight: 800, marginBottom: 2 }}>Gender</div><div style={{ fontSize: '0.78rem', color: '#0A1F44', textTransform: 'capitalize' }}>{v.visitor.gender}</div></div>
          )}
          {v.visitor?.email && (
            <div><div style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8', fontWeight: 800, marginBottom: 2 }}>Email</div><div style={{ fontSize: '0.78rem', color: '#0A1F44' }}>{v.visitor.email}</div></div>
          )}
          {v.meetWithDept && (
            <div><div style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8', fontWeight: 800, marginBottom: 2 }}>Department</div><div style={{ fontSize: '0.78rem', color: v.isVariableEmployee ? '#7C3AED' : '#0A1F44' }}>{v.meetWithDept.name}{v.isVariableEmployee ? ' (Variable)' : ''}</div></div>
          )}
          {v.visitor?.aadhar && (
            <div><div style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8', fontWeight: 800, marginBottom: 2 }}>Aadhar</div><div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#0A1F44' }}>{v.visitor.aadhar}</div></div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', gridColumn: 'span 2' }}>
            {v.status === 'Approved' && (
              <>
                <button onClick={() => onCheckout(v._id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ✕ Check Out
                </button>
                <button onClick={() => onDivert(v)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid rgba(47,93,170,0.3)', background: 'rgba(47,93,170,0.05)', fontSize: '0.65rem', fontWeight: 800, color: '#2F5DAA', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ↪ Divert
                </button>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function DashboardVisitor() {
  const [visitors, setVisitors] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [divertVisit, setDivertVisit] = useState<Visit | null>(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUserRole(JSON.parse(u).role || '');
  }, []);

  useEffect(() => { fetchVisitors(); }, [filters]);

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/v1/visits?`;
      if (filters.status) url += `status=${filters.status}&`;
      if (filters.startDate) url += `startDate=${filters.startDate}&`;
      if (filters.endDate) url += `endDate=${filters.endDate}&`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setVisitors(data);
    } catch {} finally { setLoading(false); }
  };

  const handleCheckout = async (id: string) => {
    if (!confirm('Proceed with Check-out for this visitor?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${id}/checkout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchVisitors();
    } catch {}
  };

  const statusColors: Record<string, string> = {
    Approved: '#16a34a', Pending: '#d97706', Rejected: '#dc2626', CheckedOut: '#6B7FA3',
  };

  return (
    <div className="fade-up w-full">
      {divertVisit && (
        <DivertModal visit={divertVisit} onClose={() => setDivertVisit(null)} onDiverted={fetchVisitors} />
      )}

      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase mb-1 text-[#0A1F44]">Visitor Log</h1>
          <p className="text-[#6B7FA3] text-xs">Comprehensive record of all visit events.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#6B7FA3]">Status</label>
            <select className="text-xs p-2 bg-white border border-[#E2E8F0] rounded-xl text-[#0A1F44]" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Active</option>
              <option value="CheckedOut">Checked Out</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#6B7FA3]">From</label>
            <input type="date" className="text-xs p-2 bg-white border border-[#E2E8F0] rounded-xl text-[#0A1F44]" onChange={e => setFilters({ ...filters, startDate: e.target.value })}/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#6B7FA3]">To</label>
            <input type="date" className="text-xs p-2 bg-white border border-[#E2E8F0] rounded-xl text-[#0A1F44]" onChange={e => setFilters({ ...filters, endDate: e.target.value })}/>
          </div>
        </div>
      </div>

      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead><tr>
            <th className="px-4 py-4 text-left w-8"/>
            <th className="px-4 py-4 text-left">Visitor</th>
            <th className="px-4 py-4 text-left">Phone</th>
            <th className="px-4 py-4 text-left">Meeting With</th>
            <th className="px-4 py-4 text-left">Department</th>
            <th className="px-4 py-4 text-left">Purpose</th>
            <th className="px-4 py-4 text-left">Check-In</th>
            <th className="px-4 py-4 text-left">Check-Out</th>
            <th className="px-4 py-4 text-left">Status</th>
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={9} className="py-12 text-center text-gray-500 italic">Accessing records…</td></tr>
              : visitors.length === 0
              ? <tr><td colSpan={9} className="py-12 text-center text-gray-500 italic">No visitor records found.</td></tr>
              : visitors.flatMap(v => {
                const isExpanded = expanded === v._id;
                const rows = [(
                  <tr key={v._id} className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => setExpanded(isExpanded ? null : v._id)}>
                    <td className="px-4 py-4 text-center">
                      <svg style={{ width: 12, height: 12, color: '#94A3B8', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                      </svg>
                    </td>
                    <td className="px-4 py-4">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: 'rgba(47,93,170,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {v.visitor?.imageUrl
                            ? <img src={v.visitor.imageUrl.startsWith('data:') ? v.visitor.imageUrl : `${API_URL}${v.visitor.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                            : <span style={{ color: '#2F5DAA', fontSize: '0.75rem', fontWeight: 800 }}>{v.visitor?.name?.charAt(0)}</span>
                          }
                        </div>
                        <span className="text-[#0A1F44] font-bold uppercase tracking-wide text-sm">{v.visitor?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#6B7FA3] text-[11px] font-mono">{v.visitor?.phone || '—'}</td>
                    <td className="px-4 py-4 text-[#6B7FA3] text-sm">
                      {v.isVariableEmployee
                        ? <span style={{ color: '#7C3AED', fontWeight: 700, fontSize: '0.75rem' }}>Variable Employee</span>
                        : v.meetWith?.name || <span className="text-[#C4C9D4]">—</span>
                      }
                    </td>
                    <td className="px-4 py-4 text-[#6B7FA3] text-sm">
                      {v.meetWithDept?.name || <span className="text-[#C4C9D4]">—</span>}
                    </td>
                    <td className="px-4 py-4 text-[#6B7FA3] text-xs uppercase tracking-widest">{v.purpose}</td>
                    <td className="px-4 py-4 text-[#6B7FA3] text-[11px]">
                      {v.scheduledTime
                        ? <><span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2F5DAA', marginRight: 4 }}>Appt</span>{new Date(v.scheduledTime).toLocaleDateString()}</>
                        : new Date(v.createdAt).toLocaleString()
                      }
                    </td>
                    <td className="px-4 py-4 text-[#6B7FA3] text-[11px]">{v.checkoutTime ? new Date(v.checkoutTime).toLocaleString() : <span className="text-[#C4C9D4]">—</span>}</td>
                    <td className="px-4 py-4">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 9999, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: `${statusColors[v.status] || '#6B7FA3'}15`, color: statusColors[v.status] || '#6B7FA3', border: `1px solid ${statusColors[v.status] || '#6B7FA3'}30` }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColors[v.status] || '#6B7FA3' }}/>
                        {v.status === 'Approved' ? 'Active' : v.status}
                      </span>
                    </td>
                  </tr>
                )];
                if (isExpanded) {
                  rows.push(<ExpandedRow key={`${v._id}-exp`} visit={v} onCheckout={handleCheckout} onDivert={setDivertVisit} userRole={userRole}/>);
                }
                return rows;
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
