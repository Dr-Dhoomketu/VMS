import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { disconnectSocket } from '@/utils/socket';
import { usePermissions } from '@/hooks/usePermissions';

const PERM_KEY_MAP: Record<string, string> = {
  '/dashboard':               'view_dashboard',
  '/dashboard/approvals':     'approve_visits',
  '/dashboard/visitor':       'view_visitor_log',
  '/dashboard/scan':          'scan_qr',
  '/dashboard/department':    'manage_departments',
  '/dashboard/designation':   'manage_departments',
  '/dashboard/employee':      'manage_employees',
  '/dashboard/pre-visitor':   'manage_appointments',
  '/dashboard/administrator': 'manage_admins',
  '/dashboard/permissions':   'manage_admins',
};

const navLinks = [
  { name: 'Dashboard',    path: '/dashboard',               icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['Admin', 'Employee'] },
  { name: 'Approvals',    path: '/dashboard/approvals',     icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['Admin', 'Employee'] },
  { name: 'Visitor Log',  path: '/dashboard/visitor',       icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['Admin', 'Employee', 'Security'] },
  { name: 'Scan QR',      path: '/dashboard/scan',          icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', roles: ['Admin', 'Employee', 'Security'] },
  { name: 'Departments',  path: '/dashboard/department',    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['Admin'] },
  { name: 'Designations', path: '/dashboard/designation',   icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['Admin'] },
  { name: 'Employees',    path: '/dashboard/employee',      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['Admin'] },
  { name: 'Appointments', path: '/dashboard/pre-visitor',   icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['Admin'] },
  { name: 'Admins',       path: '/dashboard/administrator', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', roles: ['Admin'] },
  { name: 'Permissions',  path: '/dashboard/permissions',  icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', roles: ['Admin'] }
];

function VTSLogo() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #e8eef8 100%)',
      borderRadius: '10px',
      padding: '6px 10px',
      display: 'inline-flex',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    }}>
      <img
        src="/vts-logo.png"
        alt="VTS Infosoft"
        style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

function VTSLogoMini() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #dce6f5 100%)',
      borderRadius: '8px',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      width: '40px',
      height: '40px',
    }}>
      <img
        src="/vts-logo.png"
        alt="VTS"
        style={{ height: '28px', width: 'auto', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebarCollapsed', String(next)); } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    disconnectSocket();
    navigate('/');
  };

  const { permissions: livePerms } = usePermissions();
  const filteredLinks = navLinks.filter(link => {
    if (!user) return true;
    if (!link.roles.includes(user.role)) return false;
    if (user.role === 'Admin') return true;
    const permKey = PERM_KEY_MAP[link.path];
    if (!permKey) return true;
    const perm = livePerms.find(p => p.key === permKey);
    return perm ? (perm.roles[user.role] !== false) : true;
  });

  return (
    <aside style={{
      width: collapsed ? '64px' : '248px',
      background: 'linear-gradient(180deg, #0A1F44 0%, #0d2552 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      zIndex: 60,
      position: 'relative',
      overflow: 'visible',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 0,
        backgroundImage: 'radial-gradient(circle, rgba(47,93,170,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}/>
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '180px', height: '180px',
        background: 'radial-gradient(circle, rgba(47,93,170,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', overflow: 'hidden',
      }}/>

      {/* Logo + collapse toggle */}
      <div style={{
        padding: '0 12px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '68px',
        gap: '8px',
        overflow: 'hidden',
      }}>
        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <VTSLogo />
          </div>
        )}
        {collapsed && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <VTSLogoMini />
          </div>
        )}

        {/* Collapse button — only visible when expanded */}
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            title="Collapse sidebar"
            style={{
              width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <svg style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', position: 'relative', zIndex: 1, transition: 'padding 0.25s ease' }}>
        {!collapsed && (
          <p style={{ fontSize: '0.45rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0 12px', marginBottom: '8px', marginTop: '4px' }}>Navigation</p>
        )}
        {filteredLinks.map((link) => {
          const isActive = location === link.path;
          return (
            <Link key={link.name} href={link.path}
              title={collapsed ? link.name : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '10px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px',
                transition: 'all 0.2s ease', position: 'relative',
                textDecoration: 'none',
                background: isActive ? 'rgba(47,93,170,0.25)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
                border: isActive ? '1px solid rgba(47,93,170,0.4)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
            >
              {isActive && !collapsed && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '3px', height: '18px',
                  background: 'linear-gradient(180deg, #4A7FD4, #2F5DAA)',
                  borderRadius: '0 2px 2px 0',
                }}/>
              )}
              <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={link.icon}/>
              </svg>
              {!collapsed && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>{link.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1, transition: 'padding 0.25s ease' }}>
        {user && !collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '4px',
            background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2F5DAA, #4A7FD4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontSize: '0.75rem', fontWeight: 800,
            }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: '0.5rem', color: '#4A7FD4', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>{user.role}</p>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <div title={user.name} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2F5DAA, #4A7FD4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontSize: '0.75rem', fontWeight: 800,
            }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '10px',
            padding: collapsed ? '10px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '10px',
            color: 'rgba(255,255,255,0.4)', background: 'transparent',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {!collapsed && <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sign Out</span>}
        </button>
      </div>

      {/* Fixed expand button — always on screen when collapsed, avoids overflow clipping */}
      {collapsed && (
        <button
          onClick={toggleCollapse}
          title="Expand sidebar"
          style={{
            position: 'fixed',
            top: '50%',
            left: '64px',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '52px',
            background: 'linear-gradient(180deg, #1e3f75 0%, #0d2552 100%)',
            border: '1px solid rgba(74,127,212,0.4)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            boxShadow: '4px 0 14px rgba(0,0,0,0.3)',
            transition: 'background 0.2s, width 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'linear-gradient(180deg, #2F5DAA 0%, #1a3a6e 100%)';
            (e.currentTarget as HTMLElement).style.width = '22px';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'linear-gradient(180deg, #1e3f75 0%, #0d2552 100%)';
            (e.currentTarget as HTMLElement).style.width = '18px';
          }}
        >
          <svg style={{ width: '10px', height: '10px', color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </aside>
  );
}
