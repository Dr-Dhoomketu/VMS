'use client';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-[#000000] min-h-screen text-white font-sans selection:bg-white/20 dot-bg">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        {/* Cinematic Background Elements */}
        <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-blue-500/[0.03] rounded-full blur-[140px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-[320px] w-[50%] h-[50%] bg-purple-500/[0.03] rounded-full blur-[140px] -z-10 pointer-events-none"></div>

        {/* Centered Content Wrapper */}
        <div className="max-w-7xl mx-auto w-full p-12 lg:p-20">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
