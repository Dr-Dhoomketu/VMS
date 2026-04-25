'use client';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-[#000000] min-h-screen text-white font-sans selection:bg-blue-500/30">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        {/* Cinematic Background Elements */}
        <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-[300px] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        {/* Centered Content Wrapper - Using mx-auto for absolute centering */}
        <div className="max-w-6xl mx-auto w-full p-12 lg:p-16 flex flex-col items-center">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
