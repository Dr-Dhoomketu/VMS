export default function GeoBackground({ dark = false }: { dark?: boolean }) {
  const c = dark ? 'rgba(255,255,255,' : 'rgba(47,93,170,';

  const diamonds = [
    { size: 110, top: '6%',  left: '3%',   delay: 0,   dur: 9  },
    { size:  70, top: '12%', right: '8%',  delay: 1.5, dur: 11 },
    { size:  55, top: '55%', left: '1%',   delay: 3,   dur: 7.5 },
    { size:  90, bottom: '18%', right: '4%', delay: 0.8, dur: 10 },
    { size:  45, top: '38%', right: '22%', delay: 2.2, dur: 8  },
    { size:  65, bottom: '8%', left: '18%', delay: 4,  dur: 9.5 },
    { size:  40, top: '72%', right: '38%', delay: 1,   dur: 12 },
    { size:  80, top: '28%', left: '45%',  delay: 2.5, dur: 8  },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '55vw', height: '55vw',
        background: `radial-gradient(circle, ${c}0.07) 0%, transparent 70%)`,
        borderRadius: '50%',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-8%',
        width: '42vw', height: '42vw',
        background: `radial-gradient(circle, ${c}0.05) 0%, transparent 70%)`,
        borderRadius: '50%',
      }}/>

      {diamonds.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 'top' in d ? d.top : undefined,
          bottom: 'bottom' in d ? d.bottom : undefined,
          left: 'left' in d ? d.left : undefined,
          right: 'right' in d ? d.right : undefined,
          width: d.size, height: d.size,
          border: `1px solid ${c}0.1)`,
          transform: 'rotate(45deg)',
          animation: `geoFloat ${d.dur}s ease-in-out ${d.delay}s infinite`,
        }}/>
      ))}

      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 360, height: 360 }}>
        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%', animation: 'hexSpin 50s linear infinite' }}>
          <polygon points="50,2 93,27 93,73 50,98 7,73 7,27" stroke={`${c}0.07)`} strokeWidth="0.8" fill="none"/>
          <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" stroke={`${c}0.04)`} strokeWidth="0.5" fill="none"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: 280, height: 280 }}>
        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%', animation: 'hexSpin 65s linear 8s infinite reverse' }}>
          <polygon points="50,2 93,27 93,73 50,98 7,73 7,27" stroke={`${c}0.06)`} strokeWidth="0.8" fill="none"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', top: '30%', right: '18%', width: 180, height: 180 }}>
        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%', animation: 'hexSpin 40s linear 4s infinite' }}>
          <polygon points="50,2 93,27 93,73 50,98 7,73 7,27" stroke={`${c}0.05)`} strokeWidth="0.8" fill="none"/>
        </svg>
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, ${c}0.05) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }}/>

      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} fill="none">
        <line x1="4%" y1="14%" x2="22%" y2="38%" stroke={`${c}0.06)`} strokeWidth="1"/>
        <line x1="78%" y1="8%"  x2="96%" y2="32%" stroke={`${c}0.06)`} strokeWidth="1"/>
        <line x1="8%"  y1="68%" x2="28%" y2="92%" stroke={`${c}0.06)`} strokeWidth="1"/>
        <line x1="72%" y1="62%" x2="92%" y2="86%" stroke={`${c}0.06)`} strokeWidth="1"/>
        <line x1="40%" y1="5%"  x2="60%" y2="5%"  stroke={`${c}0.04)`} strokeWidth="1"/>
        <circle cx="4%"  cy="14%" r="3" fill={`${c}0.18)`}/>
        <circle cx="22%" cy="38%" r="3" fill={`${c}0.18)`}/>
        <circle cx="78%" cy="8%"  r="3" fill={`${c}0.18)`}/>
        <circle cx="96%" cy="32%" r="3" fill={`${c}0.18)`}/>
        <circle cx="8%"  cy="68%" r="3" fill={`${c}0.18)`}/>
        <circle cx="28%" cy="92%" r="3" fill={`${c}0.18)`}/>
        <circle cx="72%" cy="62%" r="3" fill={`${c}0.18)`}/>
        <circle cx="92%" cy="86%" r="3" fill={`${c}0.18)`}/>
        <circle cx="40%" cy="5%"  r="2" fill={`${c}0.12)`}/>
        <circle cx="60%" cy="5%"  r="2" fill={`${c}0.12)`}/>
      </svg>
    </div>
  );
}
