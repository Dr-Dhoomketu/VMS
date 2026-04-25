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

        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
