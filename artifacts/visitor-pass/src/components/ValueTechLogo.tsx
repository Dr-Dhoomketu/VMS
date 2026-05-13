export default function ValueTechLogo({ className = 'h-10 w-auto', inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <img
      src="/vts-logo.png"
      alt="VISITORPASS"
      className={`object-contain ${className} ${inverted ? 'brightness-0 invert' : ''}`}
      style={{ width: 'auto' }}
    />
  );
}
