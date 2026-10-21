/** Small decorative SVG illustrations for module cards (original artwork). */
const BG = (id: string, c1: string, c2: string) => (
  <>
    <defs>
      <radialGradient id={`g${id}`} cx="70%" cy="20%" r="90%">
        <stop offset="0" stopColor={c1} stopOpacity="0.35" />
        <stop offset="1" stopColor={c2} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="300" height="110" fill="var(--canvas-bg)" />
    <rect width="300" height="110" fill={`url(#g${id})`} />
    {Array.from({ length: 26 }, (_, i) => (
      <circle key={i} cx={(i * 97) % 300} cy={(i * 53) % 110} r={i % 5 === 0 ? 1.1 : 0.6} fill="#c8d2ff" opacity={0.25 + ((i * 7) % 10) / 20} />
    ))}
  </>
);

export function Thumb({ id }: { id: string }) {
  const art: Record<string, JSX.Element> = {
    a1: (<>{BG(id, '#fbbf24', '#000')}<ellipse cx="150" cy="92" rx="130" ry="18" fill="none" stroke="#f472b6" strokeOpacity=".6" /><path d="M40 92 Q150 -10 260 92" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" /><circle cx="175" cy="36" r="9" fill="#fde68a" /><circle cx="175" cy="36" r="18" fill="#fbbf24" opacity=".2" /></>),
    a3: (<>{BG(id, '#e5e7eb', '#000')}{[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const x = 28 + k * 35; const f = k / 8; return (<g key={k}><circle cx={x} cy="55" r="12" fill="#1f2433" /><path d={`M${x} 43 A12 12 0 0 ${f < 0.5 ? 1 : 0} ${x} 67 A${Math.abs(Math.cos(f * 2 * Math.PI)) * 12} 12 0 0 ${(f < 0.25 || f > 0.75) === f < 0.5 ? 0 : 1} ${x} 43`} fill="#e5e7eb" /></g>); })}</>),
    a4: (<>{BG(id, '#fbbf24', '#000')}<circle cx="80" cy="55" r="26" fill="#fcd34d" /><circle cx="94" cy="50" r="6" fill="#0b0f1f" /><path d="M130 40 H175 Q185 40 190 62 Q195 40 205 40 H280" fill="none" stroke="#5eead4" strokeWidth="2" /><path d="M130 85 Q160 65 190 85 T250 85 T280 80" fill="none" stroke="#a78bfa" strokeWidth="2" /></>),
    a5: (<>{BG(id, '#a78bfa', '#000')}<path d="M10 70 L40 30 Q55 40 70 75 L80 80 L105 30 Q120 40 135 75 L145 80 L170 30 Q185 40 200 75 L210 80 L235 30 Q250 40 265 75 L290 80" fill="none" stroke="#c4b5fd" strokeWidth="2" /></>),
    a6: (<>{BG(id, '#4ade80', '#000')}<circle cx="60" cy="55" r="12" fill="#fb923c" /><circle cx="60" cy="55" r="70" fill="none" stroke="#4ade80" strokeWidth="26" strokeOpacity=".22" /><circle cx="60" cy="55" r="40" fill="none" stroke="#f87171" strokeOpacity=".3" /><circle cx="60" cy="55" r="105" fill="none" stroke="#60a5fa" strokeOpacity=".3" /><circle cx="128" cy="40" r="4" fill="#60a5fa" /></>),
    b1: (<>{BG(id, '#60a5fa', '#000')}<ellipse cx="150" cy="55" rx="110" ry="38" fill="none" stroke="#7c9cff" strokeWidth="1.6" /><path d="M85 55 L240 40 A110 38 0 0 1 255 62 Z" fill="#7c9cff" opacity=".25" /><circle cx="85" cy="55" r="8" fill="#fbbf24" /><circle cx="250" cy="52" r="4" fill="#e8ecff" /></>),
    b2: (<>{BG(id, '#fb923c', '#000')}<circle cx="110" cy="60" r="7" fill="#fbbf24" /><circle cx="110" cy="60" r="35" fill="none" stroke="#60a5fa" strokeOpacity=".7" /><circle cx="110" cy="60" r="55" fill="none" stroke="#f87171" strokeOpacity=".7" /><path d="M145 60 A45 44 0 0 1 55 62" fill="none" stroke="#5eead4" strokeWidth="2" strokeDasharray="5 4" /></>),
    b3: (<>{BG(id, '#a78bfa', '#000')}{[30, 45, 60, 80].map((r, i) => <ellipse key={i} cx="150" cy="55" rx={r * 1.6} ry={r * 0.6} fill="none" stroke="#a78bfa" strokeOpacity={0.15 + i * 0.1} />)}<circle cx="120" cy="55" r="7" fill="#fbbf24" /><circle cx="200" cy="55" r="3" fill="#60a5fa" />{[[178, 55], [222, 55], [70, 55], [160, 20], [160, 90]].map(([x, y], i) => <path key={i} d={`M${x - 4} ${y}h8M${x} ${y - 4}v8`} stroke="#5eead4" strokeWidth="1.6" />)}</>),
    b4: (<>{BG(id, '#5eead4', '#000')}<path d="M60 55 C 90 10, 140 10, 150 55 S 210 100, 240 55 S 190 10, 150 55 S 90 100, 60 55" fill="none" stroke="#5eead4" strokeWidth="1.6" /><circle cx="60" cy="55" r="5" fill="#fbbf24" /><circle cx="150" cy="55" r="5" fill="#f472b6" /><circle cx="240" cy="55" r="5" fill="#7c9cff" /></>),
    c1: (<>{BG(id, '#38bdf8', '#000')}<rect x="60" y="20" width="40" height="4" fill="#cbd5ff" /><rect x="60" y="88" width="40" height="4" fill="#cbd5ff" /><path d="M80 88 L80 24" stroke="#fde68a" strokeWidth="2" /><rect x="180" y="20" width="40" height="4" fill="#cbd5ff" /><rect x="230" y="88" width="40" height="4" fill="#cbd5ff" /><path d="M200 24 L250 88" stroke="#fde68a" strokeWidth="2" /></>),
    c2: (<>{BG(id, '#38bdf8', '#000')}<path d="M150 105 L50 5 M150 105 L250 5" stroke="#fbbf24" strokeOpacity=".7" /><path d="M150 105 V5 M60 105 H240" stroke="#7c9cff" strokeOpacity=".6" /><path d="M150 105 L185 5 M150 105 L250 75" stroke="#5eead4" /><path d="M150 105 L200 50 L150 5" fill="none" stroke="#f472b6" strokeWidth="2" /></>),
    c4: (<>{BG(id, '#38bdf8', '#000')}{Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; const r = 10 + ((i * 37) % 40); return <circle key={i} cx={150 + Math.cos(a) * r * 1.6} cy={55 + Math.sin(a) * r * 0.9} r="1.4" fill={r < 25 ? '#93c5fd' : r < 40 ? '#fef3c7' : '#fca5a5'} />; })}</>),
    d1: (<>{BG(id, '#c084fc', '#000')}<circle cx="80" cy="120" r="70" fill="#1e3a8a" opacity=".8" /><circle cx="80" cy="120" r="105" fill="none" stroke="#c084fc" strokeDasharray="3 5" /><rect x="160" y="22" width="14" height="10" fill="#e8ecff" /><path d="M150 27h10M174 27h10" stroke="#7c9cff" strokeWidth="3" /></>),
    d2: (<>{BG(id, '#c084fc', '#000')}{[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} cx="150" cy="55" rx="70" ry="30" fill="none" stroke="#c084fc" strokeOpacity={0.25 + k * 0.1} transform={`rotate(${k * 25} 150 55) translate(18 0)`} />)}<circle cx="150" cy="55" r="7" fill="#000" stroke="#f472b6" /></>),
    d3: (<>{BG(id, '#fb923c', '#000')}<ellipse cx="150" cy="58" rx="120" ry="15" fill="none" stroke="#fdba74" strokeWidth="9" strokeOpacity=".75" /><circle cx="150" cy="55" r="27" fill="#000" stroke="#fed7aa" strokeWidth="2" /><path d="M123 55 A27 27 0 0 1 177 55" fill="none" stroke="#fde68a" strokeWidth="5" opacity=".8" /></>),
    d5: (<>{BG(id, '#5eead4', '#000')}<circle cx="150" cy="55" r="30" fill="none" stroke="#93c5fd" strokeWidth="5" strokeOpacity=".8" /><circle cx="150" cy="55" r="4" fill="#fbbf24" /></>),
    d8: (<>{BG(id, '#c084fc', '#000')}<path d="M20 100 C 60 40, 120 50, 160 45 S 260 15, 290 2" fill="none" stroke="#c084fc" strokeWidth="2" />{[40, 90, 140, 190, 240].map((x, i) => <circle key={i} cx={x} cy={90 - i * 16} r="2.5" fill="#e8ecff" />)}</>),
    e1: (<>{BG(id, '#4ade80', '#000')}<circle cx="40" cy="55" r="12" fill="#fbbf24" />{[30, 50, 75, 105, 150, 200, 240].map((r, i) => <circle key={i} cx="40" cy="55" r={r} fill="none" stroke="#7c9cff" strokeOpacity=".25" />)}{[[70, 55, '#b7b2a8'], [86, 46, '#e8c98a'], [112, 62, '#5aa2ff'], [142, 40, '#e2704a'], [188, 66, '#d9b38c'], [238, 52, '#e9d39b']].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={i > 3 ? 6 : 3} fill={c as string} />)}</>),
  };
  return (
    <svg viewBox="0 0 300 110" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {art[id] ?? BG(id, '#7c9cff', '#000')}
    </svg>
  );
}
