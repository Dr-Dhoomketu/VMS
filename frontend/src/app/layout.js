import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "900"] });

export const metadata = {
  title: "VISITORPASS | Enterprise Visitor Management",
  description: "The next generation of visitor management. Intelligent. Secure. Enterprise-grade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased overflow-x-hidden bg-white text-[#0A1F44]`}>
        {children}
      </body>
    </html>
  );
}
