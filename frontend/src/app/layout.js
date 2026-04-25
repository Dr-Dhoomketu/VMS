import { Outfit } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "700", "900"] });

export const metadata = {
  title: "VMS | Cinematic Visitor Management",
  description: "Premium Visitor Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-outfit antialiased overflow-x-hidden">
        {/* Theme Transition Curtain */}
        <div id="theme-curtain" className="fixed inset-0 bg-[#5c4033] z-[200] translate-x-[-100%] pointer-events-none"></div>

        {/* Background Animation Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="float-element top-10 left-[10%] w-32 h-32 border border-blue-500/30 theme-coffee:border-gray-300 rounded-full" />
          <div className="float-element top-[60%] left-[80%] w-48 h-48 border border-blue-500/30 theme-coffee:border-gray-300 rounded-lg" style={{ animationDelay: '-2s' }} />
          <div className="float-element top-[20%] left-[70%] w-16 h-16 bg-blue-500/10 theme-coffee:bg-gray-200 rounded-full" style={{ animationDelay: '-5s' }} />
        </div>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
