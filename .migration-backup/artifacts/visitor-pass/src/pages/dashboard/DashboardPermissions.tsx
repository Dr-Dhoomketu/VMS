import { useState } from 'react';

interface Permission {
  key: string;
  label: string;
  description: string;
  roles: Record<string, boolean>;
}

const defaultPermissions: Permission[] = [
  { key: 'approve_visits', label: 'Approve / Reject Visits', description: 'Allow role to approve or reject pending visitor requests', roles: { Admin: true, Employee: true, Security: false } },
  { key: 'view_visitor_log', label: 'View Visitor Log', description: 'Access to the full visitor log and history', roles: { Admin: true, Employee: false, Security: true } },
  { key: 'checkout_visitor', label: 'Check-out Visitors', description: 'Mark visitors as checked out from the premises', roles: { Admin: true, Employee: false, Security: true } },
  { key: 'manage_employees', label: 'Manage Employees', description: 'Create, edit and deactivate employee accounts', roles: { Admin: true, Employee: false, Security: false } },
  { key: 'manage_departments', label: 'Manage Departments', description: 'Create and manage department and designation records', roles: { Admin: true, Employee: false, Security: false } },
  { key: 'view_dashboard', label: 'View Dashboard & Stats', description: 'Access real-time stats and operations dashboard', roles: { Admin: true, Employee: false, Security: false } },
  { key: 'manage_appointments', label: 'Manage Appointments', description: 'View and manage pre-scheduled visitor appointments', roles: { Admin: true, Employee: true, Security: false } },
  { key: 'manage_admins', label: 'Manage Administrators', description: 'Create and manage admin accounts', roles: { Admin: true, Employee: false, Security: false } },
  { key: 'scan_qr', label: 'QR Code Scanning', description: 'Scan visitor QR codes at entry/exit points', roles: { Admin: true, Employee: false, Security: true } },
  { key: 'export_data', label: 'Export Reports', description: 'Export visitor logs and reports', roles: { Admin: true, Employee: false, Security: false } },
];

const ROLES = ['Admin', 'Employee', 'Security'];

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  Admin: { bg: 'rgba(10,31,68,0.06)', text: '#0A1F44', border: 'rgba(10,31,68,0.15)' },
  Employee: { bg: 'rgba(47,93,170,0.06)', text: '#2F5DAA', border: 'rgba(47,93,170,0.2)' },
  Security: { bg: 'rgba(124,58,237,0.06)', text: '#7c3aed', border: 'rgba(124,58,237,0.2)' },
};

export default function DashboardPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [saved, setSaved] = useState(false);

  const toggle = (key: string, role: string) => {
    if (role === 'Admin') return;
    setPermissions(prev => prev.map(p =>
      p.key === key ? { ...p, roles: { ...p.roles, [role]: !p.roles[role] } } : p
    ));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
        <div>
          <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '6px' }}>Access Control</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0A1F44' }}>Role Permissions</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7FA3', marginTop: '4px' }}>Configure which roles can access each feature. Admin permissions cannot be changed.</p>
        </div>
        <button onClick={handleSave} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px', borderRadius: '12px',
          background: saved ? '#16a34a' : '#0A1F44', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}>
          {saved ? (
            <>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              Saved
            </>
          ) : (
            <>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Role legend */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {ROLES.map(role => (
          <div key={role} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '999px',
            background: roleColors[role].bg, border: `1px solid ${roleColors[role].border}`,
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: roleColors[role].text }}/>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: roleColors[role].text }}>{role}</span>
            {role === 'Admin' && <span style={{ fontSize: '0.6rem', color: roleColors[role].text, opacity: 0.6 }}>· Full access (locked)</span>}
          </div>
        ))}
      </div>

      {/* Permissions matrix */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(10,31,68,0.08)', overflow: 'hidden', boxShadow: '0 2px 16px rgba(10,31,68,0.04)' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 130px)', background: '#0A1F44', padding: '14px 24px', gap: '12px' }}>
          <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Feature / Permission</span>
          {ROLES.map(role => (
            <div key={role} style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: roleColors[role].bg === 'rgba(10,31,68,0.06)' ? '#4A7FD4' : roleColors[role].text === '#2F5DAA' ? '#7BA5E8' : '#c4b5fd' }}>
                {role}
              </span>
            </div>
          ))}
        </div>

        {/* Permission rows */}
        {permissions.map((perm, idx) => (
          <div key={perm.key} style={{
            display: 'grid', gridTemplateColumns: '1fr repeat(3, 130px)',
            padding: '18px 24px', gap: '12px', alignItems: 'center',
            background: idx % 2 === 0 ? '#ffffff' : '#FAFBFD',
            borderBottom: idx < permissions.length - 1 ? '1px solid rgba(10,31,68,0.04)' : 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4F7FC'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#ffffff' : '#FAFBFD'; }}
          >
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A1F44', marginBottom: '3px' }}>{perm.label}</p>
              <p style={{ fontSize: '0.68rem', color: '#6B7FA3', lineHeight: 1.4 }}>{perm.description}</p>
            </div>
            {ROLES.map(role => {
              const enabled = perm.roles[role];
              const isAdmin = role === 'Admin';
              return (
                <div key={role} style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => toggle(perm.key, role)}
                    disabled={isAdmin}
                    title={isAdmin ? 'Admin always has full access' : undefined}
                    style={{
                      width: '44px', height: '24px', borderRadius: '999px', border: 'none',
                      background: enabled ? (isAdmin ? '#0A1F44' : '#2F5DAA') : '#E2E8F0',
                      cursor: isAdmin ? 'not-allowed' : 'pointer',
                      position: 'relative', transition: 'all 0.2s',
                      opacity: isAdmin ? 0.7 : 1,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: enabled ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}/>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.68rem', color: '#A0AEC0', marginTop: '16px', textAlign: 'center' }}>
        Changes are stored in local configuration. Connect to your backend to persist permissions across sessions.
      </p>
    </div>
  );
}
