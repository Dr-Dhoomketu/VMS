'use client';
import Image from 'next/image';

export default function ValueTechLogo({ className = 'h-10 w-auto', inverted = false }) {
  return (
    <Image
      src="/vts-logo.png"
      alt="VISITORPASS"
      width={160}
      height={48}
      priority
      className={`object-contain ${className} ${inverted ? 'brightness-0 invert' : ''}`}
      style={{ width: 'auto' }}
    />
  );
}
