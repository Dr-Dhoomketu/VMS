import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import socket, { connectSocket } from '@/utils/socket';
import { API_URL } from '@/lib/api';

const adminStatCards = [
  { key:'total',      label:'Total Visits',  sub:'All Time',     color:'#2F5DAA', bg:'rgba(47,93,170,0.08)',   bar:'#2F5DAA' },
  { key:'today',      label:'Today',         sub:'Live Traffic', color:'#0A1F44', bg:'rgba(10,31,68,0.06)',    bar:'#0A1F44' },
  { key:'checkedIn',  label:'On Premise',    sub:'Active Now',   color:'#16a34a', bg:'rgba(22,163,74,0.08)',   bar:'#16a34a' },
  { key:'checkedOut', label:'Checked Out',   sub:'Cleared',      color:'#6B7FA3', bg:'rgba(107,127,163,0.08)', bar:'#6B7FA3' },
  { key:'preVisitor', label:'Scheduled',     sub:'Pre-Booked',   color:'#7C3AED', bg:'rgba(124,58,237,0.08)',  bar:'#7C3AED' },
];

interface Stats { total:number; today:number; checkedIn:number; checkedOut:number; preVisitor:number; }
interface Visit {
  _id:string; purpose:string; createdAt:string; status:string;
  visitor?:{name:string;email?:string;imageUrl?:string};
  meetWith?:{name:string};
  meetWithDept?:{name:string};
  isVariableEmployee?:boolean;
}
interface Colleague { _id:string; name:string; designation?:{name:string}; }

export default function DashboardHome() {
  const [, navigate] = useLocation();
  const [stats, setStats]       = useState<Stats>({ total:0, today:0, checkedIn:0, checkedOut:0, preVisitor:0 });
  const [visitors, setVisitors] = useState<Visit[]>([]);
  const [pending, setPending]   = useState<Visit[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading]   = useState(true);
  const [user, setUser]         = useState<{ _id:string; name:string; role:string; department?:string }|null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const u = JSON.parse(userStr);
    setUser(u);
    if (u.role === 'Admin') fetchStats();
    fetchVisitors();
    fetchPending();
    if (u.role === 'Employee' && u.department) fetchColleagues(u._id, u.department);
    connectSocket(u);
    socket.on('visit_updated', () => { if (u.role === 'Admin') fetchStats(); fetchVisitors(); });
    socket.on('new_visit', () => { if (u.role === 'Admin') fetchStats(); fetchPending(); });
    socket.on('new_visit_request', fetchPending);
    return () => { socket.off('visit_updated'); socket.off('new_visit'); socket.off('new_visit_request', fetchPending); };
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/visits/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setStats(data);
    } catch {}
  };
  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/visits?status=Approved`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setVisitors(data);
    } catch {} finally { setLoading(false); }
  };
  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/visits/pending`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (res.ok) setPending(data);
    } catch {}
  };
  const fetchColleagues = async (myId: string, deptId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/employees?department=${deptId}`);
      const data = await res.json();
      if (Array.isArray(data)) setColleagues(data.filter((e: Colleague) => e._id !== myId));
    } catch {}
  };

  const handleCheckout = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/visits/${id}/checkout`, { method:'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { fetchStats(); fetchVisitors(); }
    } catch {}
  };

  const isEmployee = user?.role === 'Employee';

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'28px', paddingBottom:'24px', borderBottom:'1px solid #E2E8F0' }}>
        <div>
          <p style={{ fontSize:'0.55rem', fontWeight:800, letterSpacing:'0.35em', textTransform:'uppercase', color:'#2F5DAA', marginBottom:'6px' }}>
            {isEmployee ? 'My Portal' : 'Operations Center'}
          </p>
          <h1 style={{ fontSize:'1.8rem', fontWeight:900, letterSpacing:'-0.03em', color:'#0A1F44' }}>
            {isEmployee ? 'My Dashboard' : 'System Overview'}
          </h1>
          <p style={{ fontSize:'0.82rem', color:'#6B7FA3', marginTop:'4px' }}>
            {isEmployee ? 'Your active visitors, pending approvals and department colleagues.' : 'Real-time monitoring of facility access and visitor flow.'}
          </p>
        </div>
        {user && (
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:'0.5rem', textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:800, color:'#6B7FA3', marginBottom:'4px' }}>Signed in as</p>
            <p style={{ fontSize:'0.875rem', fontWeight:700, color:'#0A1F44' }}>{user.name}</p>
            <p style={{ fontSize:'0.6rem', color:'#2F5DAA', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em' }}>{user.role}</p>
          </div>
        )}
      </div>

      {/* Admin stat cards */}
      {!isEmployee && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'14px', marginBottom:'28px' }}>
          {adminStatCards.map(({ key, label, sub, color, bg, bar }) => (
            <div key={key} style={{ background:'#fff', borderRadius:'16px', border:'1px solid rgba(10,31,68,0.06)', boxShadow:'0 2px 12px rgba(10,31,68,0.04)', overflow:'hidden' }}>
              <div style={{ height:'3px', background:`linear-gradient(90deg,${bar},transparent)` }}/>
              <div style={{ padding:'20px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                  <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:color }}/>
                </div>
                <div style={{ fontSize:'1.8rem', fontWeight:900, color:'#0A1F44', letterSpacing:'-0.03em', lineHeight:1 }}>{(stats as Record<string,number>)[key] ?? 0}</div>
                <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#0A1F44', marginTop:'6px' }}>{label}</div>
                <div style={{ fontSize:'0.55rem', fontWeight:700, color:'#6B7FA3', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:'3px' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee stat cards */}
      {isEmployee && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'28px' }}>
          {[
            { label:'Active Visitors',    value:visitors.length, sub:'On Premise Now',      color:'#16a34a', bg:'rgba(22,163,74,0.08)',  bar:'#16a34a' },
            { label:'Pending Approvals',  value:pending.length,  sub:'Awaiting Decision',    color:'#d97706', bg:'rgba(217,119,6,0.08)', bar:'#d97706' },
            { label:'Dept Colleagues',    value:colleagues.length, sub:'Same Department',    color:'#2F5DAA', bg:'rgba(47,93,170,0.08)',  bar:'#2F5DAA' },
          ].map(({ label, value, sub, color, bg, bar }) => (
            <div key={label} style={{ background:'#fff', borderRadius:'16px', border:'1px solid rgba(10,31,68,0.06)', boxShadow:'0 2px 12px rgba(10,31,68,0.04)', overflow:'hidden' }}>
              <div style={{ height:'3px', background:`linear-gradient(90deg,${bar},transparent)` }}/>
              <div style={{ padding:'20px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                  <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:color }}/>
                </div>
                <div style={{ fontSize:'1.8rem', fontWeight:900, color:'#0A1F44', letterSpacing:'-0.03em', lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#0A1F44', marginTop:'6px' }}>{label}</div>
                <div style={{ fontSize:'0.55rem', fontWeight:700, color:'#6B7FA3', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:'3px' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending approvals quick-cards — employee only */}
      {isEmployee && pending.length > 0 && (
        <div style={{ marginBottom:'28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#d97706', animation:'pulse 2s ease-in-out infinite' }}/>
            <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#0A1F44' }}>Pending Approvals</h2>
            <span style={{ background:'rgba(217,119,6,0.1)', color:'#d97706', borderRadius:9999, padding:'1px 8px', fontSize:'0.6rem', fontWeight:900 }}>{pending.length}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'12px' }}>
            {pending.slice(0,4).map(v => (
              <div key={v._id} style={{ background:'#fff', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'14px 16px', boxShadow:'0 2px 8px rgba(10,31,68,0.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(217,119,6,0.08)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:800, color:'#d97706' }}>
                    {v.visitor?.name?.charAt(0)}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#0A1F44', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.visitor?.name}</div>
                    <div style={{ fontSize:'0.6rem', color:'#6B7FA3' }}>{v.purpose}</div>
                  </div>
                  {v.isVariableEmployee && (
                    <span style={{ marginLeft:'auto', background:'rgba(124,58,237,0.1)', color:'#7C3AED', borderRadius:6, padding:'2px 6px', fontSize:'0.5rem', fontWeight:900, textTransform:'uppercase', whiteSpace:'nowrap' }}>Variable</span>
                  )}
                </div>
                <a href="/dashboard/approvals" style={{ marginTop:'10px', display:'block', textAlign:'center', padding:'6px', borderRadius:'8px', background:'#0A1F44', color:'#fff', fontSize:'0.6rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', textDecoration:'none' }}>Review →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Department Colleagues Section — Employee only ── */}
      {isEmployee && (
        <div style={{ marginBottom:'28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
            <svg style={{ width:'16px', height:'16px', color:'#2F5DAA' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#0A1F44' }}>My Department</h2>
            <span style={{ background:'rgba(47,93,170,0.08)', color:'#2F5DAA', borderRadius:9999, padding:'1px 8px', fontSize:'0.6rem', fontWeight:900 }}>{colleagues.length} colleague{colleagues.length !== 1 ? 's' : ''}</span>
          </div>
          {colleagues.length === 0 ? (
            <div style={{ padding:'24px', background:'#F8FAFC', borderRadius:'16px', border:'1px solid #E2E8F0', textAlign:'center', color:'#94A3B8', fontSize:'0.78rem' }}>
              No other employees found in your department.
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px' }}>
              {colleagues.map(col => (
                <div key={col._id} style={{ background:'#fff', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'16px', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 2px 8px rgba(10,31,68,0.04)', transition:'box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(47,93,170,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(10,31,68,0.04)'; }}
                >
                  <div style={{ width:'42px', height:'42px', borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#2F5DAA,#4A7FD4)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.85rem', fontWeight:800 }}>
                    {col.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#0A1F44', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{col.name}</div>
                    {col.designation && (
                      <div style={{ fontSize:'0.58rem', color:'#6B7FA3', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(col.designation as any).name || col.designation}</div>
                    )}
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', marginTop:'5px', display:'inline-block' }} title="Online"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active visitors table */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div>
          <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#0A1F44' }}>{isEmployee ? 'My Active Visitors' : 'Active Visitors'}</h2>
          <p style={{ fontSize:'0.72rem', color:'#6B7FA3', marginTop:'3px' }}>Currently on premises</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'pulse 2s ease-in-out infinite' }}/>
          <span style={{ fontSize:'0.55rem', fontWeight:800, color:'#6B7FA3', textTransform:'uppercase', letterSpacing:'0.2em' }}>Live</span>
        </div>
      </div>
      <div className="dark-table-container">
        <table className="dark-table w-full">
          <thead><tr>
            <th>Visitor</th>
            <th>Meeting With</th>
            {isEmployee && <th>Department</th>}
            <th>Purpose</th>
            <th>Check-In</th>
            <th>Status</th>
            <th style={{ textAlign:'center' }}>Action</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isEmployee ? 7 : 6} style={{ textAlign:'center', padding:'48px', color:'#6B7FA3', fontSize:'0.875rem' }}>Loading...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan={isEmployee ? 7 : 6} style={{ textAlign:'center', padding:'48px', color:'#6B7FA3', fontSize:'0.875rem' }}>No active visitors on premises.</td></tr>
            ) : visitors.map(v => (
              <tr key={v._id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'34px', height:'34px', borderRadius:'50%', overflow:'hidden', background:'rgba(47,93,170,0.08)', flexShrink:0 }}>
                      {v.visitor?.imageUrl
                        ? <img src={v.visitor.imageUrl.startsWith('data:') ? v.visitor.imageUrl : `${API_URL}${v.visitor.imageUrl}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#2F5DAA', fontSize:'0.75rem', fontWeight:800 }}>{v.visitor?.name?.charAt(0)}</div>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#0A1F44' }}>{v.visitor?.name}</p>
                      <p style={{ fontSize:'0.7rem', color:'#6B7FA3' }}>{v.visitor?.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize:'0.875rem', color:'#0A1F44', fontWeight:500 }}>
                  {v.isVariableEmployee ? <span style={{ color:'#7C3AED', fontWeight:700, fontSize:'0.78rem' }}>Variable Employee</span> : v.meetWith?.name || '—'}
                </td>
                {isEmployee && <td style={{ fontSize:'0.78rem', color:'#6B7FA3' }}>{v.meetWithDept?.name || '—'}</td>}
                <td style={{ fontSize:'0.875rem', color:'#6B7FA3' }}>{v.purpose}</td>
                <td style={{ fontSize:'0.78rem', color:'#6B7FA3' }}>{new Date(v.createdAt).toLocaleTimeString()}</td>
                <td><span className="badge badge-approved">Active</span></td>
                <td style={{ textAlign:'center' }}>
                  <button onClick={() => handleCheckout(v._id)}
                    style={{ fontSize:'0.72rem', fontWeight:700, color:'#dc2626', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}>
                    Check Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
