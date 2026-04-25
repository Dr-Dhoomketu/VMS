'use client';
import Image from 'next/image';

export default function ValueTechLogo({ className = "w-auto h-12" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="Value Tech Services" 
        className="h-full w-auto object-contain brightness-100 theme-coffee:brightness-0 theme-coffee:opacity-80 dark:brightness-125"
      />
    </div>
  );
}
