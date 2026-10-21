import { sci, fmt } from '../i18n';
import { useSettings } from '../store/settings';
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { niceStep } from '../lib/canvas';
import { MathText, typesetsChildren } from './Tex';
import { SvgRuns } from './SvgRuns';

export interface Series {
  data: [number, number][];
  color: string;
  label?: string;
  width?: number;
  dash?: string;
  /** Draw points instead of a line. */
  scatter?: boolean;
  radius?: number;
  opacity?: number;
}

export interface ChartProps {
  series: Series[];
  height?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  xLabel?: string;
  yLabel?: string;
  xLog?: boolean;
  yLog?: boolean;
  invertY?: boolean;
  vlines?: { x: number; color: string; label?: string; dash?: string }[];
  hlines?: { y: number; color: string; label?: string; dash?: string }[];
  markers?: { x: number; y: number; color: string; r?: number; label?: string }[];
  bands?: { x0: number; x1: number; color: string; label?: string }[];
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  title?: string;
  legend?: boolean;
  onPointer?: (x: number | null) => void;
  children?: ReactNode;
  ariaLabel?: string;
}

const defFmt = (v: number) => {
  const a = Math.abs(v);
  if (a === 0) return '0';
  if (a >= 1e5 || a < 1e-3) return sci(v, 1);
  return fmt(+v.toPrecision(4), 4, useSettings.getState().lang);
};

function ticks(lo: number, hi: number, log: boolean, target: number): number[] {
  if (log) {
    const out: number[] = [];
    for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
      const v = 10 ** e;
      if (v >= lo * 0.999 && v <= hi * 1.001) out.push(v);
    }
    return out;
  }
  const s = niceStep(hi - lo, target);
  const out: number[] = [];
  for (let v = Math.ceil(lo / s) * s; v <= hi + s * 1e-9; v += s) out.push(Math.abs(v) < s * 1e-9 ? 0 : v);
  return out;
}

export function LineChart(p: ChartProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.max(160, el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = p.height ?? 180;
  const yLabelChars = useMemo(() => {
    const lo = p.yDomain?.[0], hi = p.yDomain?.[1];
    let mx = 0;
    for (const s of p.series) for (const [, y] of s.data) if (Number.isFinite(y)) mx = Math.max(mx, Math.abs(y));
    if (lo !== undefined) mx = Math.max(mx, Math.abs(lo), Math.abs(hi ?? 0));
    return (p.yFormat ?? defFmt)(mx).length + 1;
  }, [p.series, p.yDomain, p.yFormat]);
  const m = { l: Math.max(46, 22 + yLabelChars * 6.6), r: 12, t: 10, b: p.xLabel ? 34 : 22 };
  const W = width;
  const iw = W - m.l - m.r, ih = H - m.t - m.b;

  const { xd, yd } = useMemo(() => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const s of p.series) for (const [x, y] of s.data) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (p.xLog && x <= 0) continue;
      if (p.yLog && y <= 0) continue;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    if (!Number.isFinite(x0)) { x0 = 0; x1 = 1; }
    if (!Number.isFinite(y0)) { y0 = 0; y1 = 1; }
    if (x0 === x1) { x0 -= 1; x1 += 1; }
    if (y0 === y1) { const d = Math.abs(y0) * 0.1 || 1; y0 -= d; y1 += d; }
    else if (!p.yLog) { const pad = (y1 - y0) * 0.06; y0 -= pad; y1 += pad; }
    return { xd: p.xDomain ?? [x0, x1], yd: p.yDomain ?? [y0, y1] };
  }, [p.series, p.xDomain, p.yDomain, p.xLog, p.yLog]);

  const sx = (x: number) => {
    const t = p.xLog ? (Math.log10(x) - Math.log10(xd[0])) / (Math.log10(xd[1]) - Math.log10(xd[0])) : (x - xd[0]) / (xd[1] - xd[0]);
    return m.l + t * iw;
  };
  const sy = (y: number) => {
    let t = p.yLog ? (Math.log10(y) - Math.log10(yd[0])) / (Math.log10(yd[1]) - Math.log10(yd[0])) : (y - yd[0]) / (yd[1] - yd[0]);
    if (p.invertY) t = 1 - t;
    return m.t + (1 - t) * ih;
  };
  const clampY = (v: number) => Math.max(m.t - 4, Math.min(m.t + ih + 4, v));
  const xt = ticks(Math.min(xd[0], xd[1]), Math.max(xd[0], xd[1]), !!p.xLog, Math.max(3, Math.floor(iw / 70)));
  const yt = ticks(Math.min(yd[0], yd[1]), Math.max(yd[0], yd[1]), !!p.yLog, Math.max(3, Math.floor(ih / 34)));
  const xf = p.xFormat ?? defFmt, yf = p.yFormat ?? defFmt;
  const clipId = useMemo(() => `clip${Math.random().toString(36).slice(2, 8)}`, []);

  const path = (s: Series) => {
    let d = '';
    let pen = false;
    for (const [x, y] of s.data) {
      if (!Number.isFinite(x) || !Number.isFinite(y) || (p.xLog && x <= 0) || (p.yLog && y <= 0)) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${sx(x).toFixed(1)},${clampY(sy(y)).toFixed(1)}`;
      pen = true;
    }
    return d;
  };

  return (
    <div className="chart" ref={wrap}>
      {p.legend !== false && p.series.some((s) => s.label) && (
        <div className="chart-legend">
          {p.series.filter((s) => s.label).map((s) => (
            <span key={s.label}><i style={{ background: s.color }} /><MathText text={s.label!} /></span>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        height={H}
        role="img"
        aria-label={p.ariaLabel ?? p.title}
        onPointerMove={p.onPointer ? (e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const t = (px - m.l) / iw;
          if (t < 0 || t > 1) return p.onPointer!(null);
          p.onPointer!(p.xLog ? 10 ** (Math.log10(xd[0]) + t * (Math.log10(xd[1]) - Math.log10(xd[0]))) : xd[0] + t * (xd[1] - xd[0]));
        } : undefined}
        onPointerLeave={p.onPointer ? () => p.onPointer!(null) : undefined}
      >
        <defs><clipPath id={clipId}><rect x={m.l} y={m.t} width={iw} height={ih} /></clipPath></defs>
        <g className="grid">
          {xt.map((v) => <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={m.t} y2={m.t + ih} />)}
          {yt.map((v) => <line key={`gy${v}`} x1={m.l} x2={m.l + iw} y1={sy(v)} y2={sy(v)} />)}
        </g>
        <g clipPath={`url(#${clipId})`}>
          {p.bands?.map((b, i) => (
            <rect key={i} x={sx(b.x0)} width={Math.max(0, sx(b.x1) - sx(b.x0))} y={m.t} height={ih} fill={b.color} />
          ))}
          {p.series.map((s, i) =>
            s.scatter ? (
              <g key={i} fill={s.color} opacity={s.opacity ?? 0.85}>
                {s.data.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y)).map(([x, y], j) => (
                  <circle key={j} cx={sx(x)} cy={sy(y)} r={s.radius ?? 2} />
                ))}
              </g>
            ) : (
              <path key={i} d={path(s)} fill="none" stroke={s.color} strokeWidth={s.width ?? 1.8} strokeDasharray={s.dash} opacity={s.opacity ?? 1} strokeLinejoin="round" />
            ),
          )}
          {p.vlines?.map((l, i) => (
            <g key={`v${i}`}>
              <line x1={sx(l.x)} x2={sx(l.x)} y1={m.t} y2={m.t + ih} stroke={l.color} strokeDasharray={l.dash ?? '4 4'} strokeWidth={1.2} />
              {l.label && <text x={sx(l.x) + 4} y={m.t + 11} style={{ fill: l.color }}><SvgRuns text={l.label} /></text>}
            </g>
          ))}
          {p.hlines?.map((l, i) => (
            <g key={`h${i}`}>
              <line x1={m.l} x2={m.l + iw} y1={sy(l.y)} y2={sy(l.y)} stroke={l.color} strokeDasharray={l.dash ?? '4 4'} strokeWidth={1.2} />
              {l.label && <text x={m.l + iw - 4} y={sy(l.y) - 4} textAnchor="end" style={{ fill: l.color }}><SvgRuns text={l.label} /></text>}
            </g>
          ))}
          {p.markers?.map((mk, i) => (
            <g key={`m${i}`}>
              <circle cx={sx(mk.x)} cy={clampY(sy(mk.y))} r={mk.r ?? 4.5} fill={mk.color} stroke="var(--canvas-bg)" strokeWidth={1.5} />
              {mk.label && <text x={sx(mk.x) + 7} y={clampY(sy(mk.y)) - 6} style={{ fill: mk.color }}><SvgRuns text={mk.label} /></text>}
            </g>
          ))}
        </g>
        <g className="axis">
          <line x1={m.l} x2={m.l + iw} y1={m.t + ih} y2={m.t + ih} />
          <line x1={m.l} x2={m.l} y1={m.t} y2={m.t + ih} />
        </g>
        {xt.map((v) => <text key={`tx${v}`} x={sx(v)} y={m.t + ih + 14} textAnchor="middle"><SvgRuns text={xf(v)} /></text>)}
        {yt.map((v) => <text key={`ty${v}`} x={m.l - 6} y={sy(v) + 3.5} textAnchor="end"><SvgRuns text={yf(v)} /></text>)}
        {p.xLabel && <text className="axis-title" x={m.l + iw / 2} y={H - 4} textAnchor="middle"><SvgRuns text={p.xLabel} /></text>}
        {p.yLabel && <text className="axis-title" transform={`translate(11 ${m.t + ih / 2}) rotate(-90)`} textAnchor="middle"><SvgRuns text={p.yLabel} /></text>}
        {p.children}
      </svg>
    </div>
  );
}

export function ChartCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="chart-card">
      {title && <h4><MathText text={title} /></h4>}
      {children}
    </div>
  );
}

// SVG overlays and chart cards may carry labels: let mathify() look inside them
typesetsChildren(LineChart, ChartCard);
