'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import socket, { disconnectSocket } from '@/utils/socket';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const navLinks = [
    { name: 'Dashboard',    path: '/dashboard',                icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['Admin'] },
    { name: 'Approvals',    path: '/dashboard/approvals',      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['Admin', 'Employee'] },
    { name: 'Departments',  path: '/dashboard/department',     icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['Admin'] },
    { name: 'Designations', path: '/dashboard/designation',    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['Admin'] },
    { name: 'Employees',    path: '/dashboard/employee',       icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['Admin'] },
    { name: 'Visitor Log',  path: '/dashboard/visitor',        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['Admin'] },
    { name: 'Appointments', path: '/dashboard/pre-visitor',    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['Admin'] },
    { name: 'Admins',       path: '/dashboard/administrator',  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', roles: ['Admin'] }
  ];

  const handleLogout = () => {
    localStorage.clear();
    disconnectSocket();
    router.push('/');
  };

  const filteredLinks = navLinks.filter(link => !user || link.roles.includes(user.role));

  return (
    <aside className="w-[240px] bg-[#0A1F44] min-h-screen flex flex-col shrink-0 z-[60]">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <Image src="/vts-logo.png" alt="VISITORPASS" width={120} height={36}
          className="h-8 w-auto object-contain brightness-0 invert" style={{ width: 'auto' }} priority/>
        <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 mt-2">
          Management Portal
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25 px-3 mb-3">Navigation</p>
        {filteredLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link key={link.name} href={link.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full"/>
              )}
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={link.icon}/>
              </svg>
              <span className="text-xs font-semibold">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-5 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span className="text-xs font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
