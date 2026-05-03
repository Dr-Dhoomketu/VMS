'use client';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        {/* Top nav bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 nav-glare">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#2F5DAA] pulse-blue" />
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#6B7FA3]">
              Live System
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#6B7FA3]">
              Connected
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto w-full p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
