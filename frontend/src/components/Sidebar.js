'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import socket, { disconnectSocket } from '@/utils/socket';
import ValueTechLogo from './ValueTechLogo';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['Admin'] },
    { name: 'Approvals', path: '/dashboard/approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['Admin', 'Employee'] },
    { name: 'Departments', path: '/dashboard/department', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['Admin'] },
    { name: 'Designations', path: '/dashboard/designation', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['Admin'] },
    { name: 'Employees', path: '/dashboard/employee', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['Admin'] },
    { name: 'Visitor Log', path: '/dashboard/visitor', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['Admin'] },
    { name: 'Appointments', path: '/dashboard/pre-visitor', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['Admin'] },
    { name: 'Admins', path: '/dashboard/administrator', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', roles: ['Admin'] }
  ];

  const handleLogout = () => {
    localStorage.clear();
    disconnectSocket();
    router.push('/');
  };

  const filteredLinks = navLinks.filter(link => !user || link.roles.includes(user.role));

  return (
    <aside className="w-80 bg-[#050505] border-r border-white/5 min-h-screen flex flex-col shrink-0 z-[60] shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="p-12 flex flex-col items-center relative z-10">
        <ValueTechLogo className="h-14 w-auto mb-4" />
        <div className="h-[1px] w-12 bg-white/10 mt-6"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-8 flex flex-col gap-1 px-8 relative z-10">
        <p className="caption px-5 mb-4 text-[9px]">Navigation Menu</p>
        {filteredLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.name} 
              href={link.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 relative group ${isActive ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'}`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              )}
              <svg className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-white' : 'group-hover:text-white opacity-40 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={link.icon} />
              </svg>
              <span className={`font-bold text-[10px] uppercase tracking-[0.25em] transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>{link.name}</span>
            </Link>
          )
        })}
      </div>

      <div className="p-8 border-t border-white/5 relative z-10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 w-full rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <svg className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="font-bold text-[9px] uppercase tracking-[0.3em]">System Logout</span>
        </button>
      </div>
    </aside>
  );
}
