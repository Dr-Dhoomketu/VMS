'use client';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen font-sans selection:bg-blue-500/30 bg-black theme-coffee:bg-[#fbfbfd] text-white theme-coffee:text-[#1d1d1f] transition-colors duration-500">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        {/* Cinematic Background Elements */}
        <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-[300px] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        {/* Centered Content Wrapper */}
        <div className="max-w-6xl mx-auto w-full p-12 lg:p-16 flex flex-col items-center">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
