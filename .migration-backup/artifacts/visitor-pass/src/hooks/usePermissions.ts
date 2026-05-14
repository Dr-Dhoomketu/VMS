import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import socket from '@/utils/socket';

export interface Permission {
  key: string;
  label: string;
  description: string;
  roles: Record<string, boolean>;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  { key: 'approve_visits',      label: 'Approve / Reject Visits',     description: '', roles: { Admin: true, Employee: true,  Security: false } },
  { key: 'view_visitor_log',    label: 'View Visitor Log',             description: '', roles: { Admin: true, Employee: false, Security: true } },
  { key: 'checkout_visitor',    label: 'Check-out Visitors',           description: '', roles: { Admin: true, Employee: false, Security: true } },
  { key: 'manage_employees',    label: 'Manage Employees',             description: '', roles: { Admin: true, Employee: false, Security: false } },
  { key: 'manage_departments',  label: 'Manage Departments',           description: '', roles: { Admin: true, Employee: false, Security: false } },
  { key: 'view_dashboard',      label: 'View Dashboard & Stats',       description: '', roles: { Admin: true, Employee: true,  Security: true } },
  { key: 'manage_appointments', label: 'Manage Appointments',          description: '', roles: { Admin: true, Employee: true,  Security: false } },
  { key: 'manage_admins',       label: 'Manage Administrators',        description: '', roles: { Admin: true, Employee: false, Security: false } },
  { key: 'scan_qr',             label: 'QR Code Scanning',             description: '', roles: { Admin: true, Employee: true,  Security: true } },
  { key: 'export_data',         label: 'Export Reports',               description: '', roles: { Admin: true, Employee: false, Security: false } },
];

let cachedPermissions: Permission[] | null = null;

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>(cachedPermissions ?? DEFAULT_PERMISSIONS);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/settings/permissions`);
        if (res.ok) {
          const data = await res.json();
          cachedPermissions = data;
          setPermissions(data);
        }
      } catch {}
    };
    load();

    const handler = (updated: Permission[]) => {
      cachedPermissions = updated;
      setPermissions(updated);
    };
    socket.on('permissions_updated', handler);
    return () => { socket.off('permissions_updated', handler); };
  }, []);

  const hasPermission = (key: string, role: string): boolean => {
    if (role === 'Admin') return true;
    const perm = permissions.find(p => p.key === key);
    return perm ? (perm.roles[role] !== false) : true;
  };

  return { permissions, hasPermission };
}
