// Gedeelde roterende mandala voor de pagina-achtergrond (SSR-safe, geen window-toegang).
// Gebruikt door de mindfulness hub en de categorie-pagina's.

export default function Mandala() {
  const cx = 300, cy = 300;
  const petal = (angle: number, r1: number, r2: number) => {
    const a = (angle * Math.PI) / 180;
    const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;
    const f = (n: number) => n.toFixed(2);
    return `M ${f(x1)} ${f(y1)} Q ${f(cx + Math.cos(a + 0.14) * r2 * 0.9)} ${f(cy + Math.sin(a + 0.14) * r2 * 0.9)} ${f(x2)} ${f(y2)} Q ${f(cx + Math.cos(a - 0.14) * r2 * 0.9)} ${f(cy + Math.sin(a - 0.14) * r2 * 0.9)} ${f(x1)} ${f(y1)}`;
  };
  const ring1 = Array.from({ length: 24 }, (_, i) => petal(i * 15, 90, 150));
  const ring2 = Array.from({ length: 36 }, (_, i) => petal(i * 10, 210, 262));
  const dots = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    return { x: cx + Math.cos(a) * 180, y: cy + Math.sin(a) * 180 };
  });

  return (
    <div className="mandala-bg" aria-hidden="true">
      <div className="mandala">
        <svg viewBox="0 0 600 600" fill="none" stroke="rgba(212,180,138,0.5)" strokeWidth="1">
          {[90, 150, 210, 262].map((r) => (
            <circle key={r} cx={cx} cy={cy} r={r} />
          ))}
          {ring1.map((d, i) => <path key={`r1-${i}`} d={d} />)}
          {ring2.map((d, i) => <path key={`r2-${i}`} d={d} />)}
          {dots.map((p, i) => (
            <circle key={`d-${i}`} cx={p.x} cy={p.y} r={3} fill="rgba(212,180,138,0.55)" stroke="none" />
          ))}
        </svg>
      </div>
    </div>
  );
}
