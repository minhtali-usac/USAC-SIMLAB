import { useMemo, useRef, useState } from 'react';
import {
  PLANCK18, ageAtZ, lookbackTimeGyr, comovingDistanceMpc, luminosityDistanceMpc, angularDiameterDistanceMpc, distanceModulus,
  scaleFactorHistory, omegaK, Ez, hubbleTimeGyr, cosmicFate, accelerationOnsetA, densityFractions, decelerationQ,
  recollapseBoundaryOL, noBigBangBoundaryOL, chi2Grid, DCHI2_2D, UNION21_Z, UNION21_MU, UNION21_ERR, UNION21_N, type Cosmology,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, type L } from '../../i18n';
import { useParam, setParams } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label, disk, withAlpha } from '../../lib/canvas';
import { drawContour } from '../../lib/contour';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';
import { refF } from '../visibility';

const OR_H2 = 4.18e-5; // Ωr h² (photons + 3.046 massless neutrinos), as in the sim-core Planck 2018 model
const PRESETS: Record<string, { name: L; short: L; H0: number; Om: number; OL: number; rad: boolean }> = {
  planck: { name: { vi: 'ΛCDM Planck 2018', en: 'ΛCDM Planck 2018' }, short: { vi: 'Planck', en: 'Planck' }, H0: 67.66, Om: 0.3111, OL: 1 - 0.3111 - OR_H2 / 0.6766 ** 2, rad: true }, // flat: ΩΛ = 1 − Ωm − Ωr
  eds: { name: { vi: 'Einstein-de Sitter (chỉ vật chất)', en: 'Einstein-de Sitter (matter only)' }, short: { vi: 'EdS', en: 'EdS' }, H0: 67.66, Om: 1, OL: 0, rad: false },
  open: { name: { vi: 'Vũ trụ mở Ωm = 0,3', en: 'Open universe Ωm = 0.3' }, short: { vi: 'Mở', en: 'Open' }, H0: 67.66, Om: 0.3, OL: 0, rad: false },
  closed: { name: { vi: 'Vũ trụ đóng Ωm = 3 (co lại)', en: 'Closed Ωm = 3 (recollapse)' }, short: { vi: 'Đóng', en: 'Closed' }, H0: 67.66, Om: 3, OL: 0, rad: false },
  desitter: { name: { vi: 'de Sitter (chỉ Λ)', en: 'de Sitter (Λ only)' }, short: { vi: 'de Sitter', en: 'de Sitter' }, H0: 67.66, Om: 0, OL: 1, rad: false },
  bounce: { name: { vi: 'Vũ trụ “nảy” Ωm = 0,3, ΩΛ = 2 (không có Vụ Nổ Lớn)', en: '“Bounce” Ωm = 0.3, ΩΛ = 2 (no Big Bang)' }, short: { vi: 'Nảy', en: 'Bounce' }, H0: 67.66, Om: 0.3, OL: 2, rad: false },
};
/** Colours of the four components (radiation, matter, curvature, Λ). */
const COMP = { r: '#f472b6', m: '#60a5fa', k: '#34d399', L: '#fbbf24' } as const;
const COMP_NAME: Record<keyof typeof COMP, L> = {
  r: { vi: 'bức xạ', en: 'radiation' }, m: { vi: 'vật chất', en: 'matter' }, k: { vi: 'độ cong', en: 'curvature' }, L: { vi: 'hằng số vũ trụ Λ', en: 'cosmological constant Λ' },
};
// Ωm–ΩΛ plane (Ωr = 0): bounds of the diagram and boundaries computed once from the roots of E²(a)
const PX: [number, number] = [0, 3], PY: [number, number] = [-0.6, 3];
let BOUNDS: { om: number[]; rec: number[]; bb: number[] } | null = null;
const planeBounds = () => {
  if (BOUNDS) return BOUNDS;
  const om = Array.from({ length: 61 }, (_, i) => 0.0001 + (3 * i) / 60);
  return (BOUNDS = { om, rec: om.map(recollapseBoundaryOL), bb: om.map(noBigBangBoundaryOL) });
};
const UNION21 = { z: UNION21_Z, mu: UNION21_MU, err: UNION21_ERR, n: UNION21_N };

type Hist = ReturnType<typeof scaleFactorHistory>;
const histFor = (c: Cosmology): Hist => scaleFactorHistory(c, cosmicFate(c).bigBang ? 60 : 100, 900);
function aAtT(h: Hist, t: number) {
  const p = h.points;
  if (!p.length) return 1;
  if (t <= p[0].t) return p[0].a;
  let lo = 0, hi = p.length - 1;
  if (t >= p[hi].t) return p[hi].a;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m].t < t) lo = m; else hi = m; }
  const f = (t - p[lo].t) / (p[hi].t - p[lo].t);
  return p[lo].a + f * (p[hi].a - p[lo].a);
}

export default function CosmologyModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [preset, setPreset] = useParam('preset', 'planck');
  const P = PRESETS[preset] ?? PRESETS.planck;
  const [H0, setH0] = useParam('H0', P.H0, { min: 40, max: 100 });
  const [Om, setOm] = useParam('Om', P.Om, { min: 0, max: 3 });
  const [OL, setOL] = useParam('OL', P.OL, { min: -0.6, max: 3 });
  const [rad, setRad] = useParam('rad', P.rad);
  const [z, setZ] = useParam('z', 1, { min: 0, max: 20 });
  const [showSn, setShowSn] = useParam('sn', false);
  const [playing, setPlaying] = useState(true);
  void setPreset;
  const cosmo: Cosmology = useMemo(() => ({ H0, Om, OL, Or: rad ? OR_H2 / (H0 / 100) ** 2 : 0 }), [H0, Om, OL, rad]);
  const fate = useMemo(() => cosmicFate(cosmo), [cosmo]);
  const hist = useMemo(() => histFor(cosmo), [cosmo]);
  const refs = useMemo(() => Object.entries(PRESETS).filter(([k]) => k !== 'bounce').map(([k, p]) => ({ k, h: histFor({ H0: p.H0, Om: p.Om, OL: p.OL, Or: p.rad ? OR_H2 / (p.H0 / 100) ** 2 : 0 }) })), []);
  const bounds = useMemo(planeBounds, []);
  const snGrid = useMemo(() => (showSn ? chi2Grid(UNION21, 'olcdm', [0, 1.2], [0, 1.6], 49, 65) : null), [showSn]);

  const age = fate.bigBang ? ageAtZ(cosmo) : Infinity;
  const tH = hubbleTimeGyr(H0);
  const tNow = hist.age; // time of today on the history's axis (Big Bang at 0, or start of the integration window)
  const tEnd = hist.points.length ? hist.points[hist.points.length - 1].t : 60;
  const aAcc = accelerationOnsetA(cosmo);
  const aEq = cosmo.Or > 0 && Om > 0 ? cosmo.Or / Om : null;
  const aML = Om > 0 && OL > 0 ? Math.cbrt(Om / OL) : null;
  const q0 = decelerationQ(cosmo, 1);
  const tCrunch = fate.recollapse && fate.bigBang && tEnd < 59.9 ? tEnd : null;

  const tRef = useRef(Math.min(tNow, tEnd));
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  const geo = useRef({ x0: 0, y0: 0, w: 1, h: 1 });

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    const narrow = w < 760;
    const A = narrow ? { x: 0, y: 0, w, h: h * 0.46 } : { x: 0, y: 0, w: w * 0.58, h };
    const B = narrow ? { x: 0, y: h * 0.46, w, h: h * 0.3 } : { x: w * 0.58, y: 0, w: w * 0.42, h: h * 0.56 };
    const C = narrow ? { x: 0, y: h * 0.76, w, h: h * 0.24 } : { x: w * 0.58, y: h * 0.56, w: w * 0.42, h: h * 0.44 };
    const tc = tRef.current, ac = aAtT(hist, tc);

    // ── A: expansion history a(t) ──
    {
      const m = { l: 46, r: 16, t: 34, b: 38 };
      const X0 = A.x + m.l, X1 = A.x + A.w - m.r, Y0 = A.y + A.h - m.b, Y1 = A.y + m.t;
      const tMax = Math.max(tEnd, tNow + 1);
      const aTop = Math.min(5, Math.max(1.6, 1.08 * Math.max(...hist.points.filter((p) => p.t <= tMax).map((p) => p.a))));
      const X = (tt: number) => X0 + ((X1 - X0) * tt) / tMax, Y = (a: number) => Y0 - ((Y0 - Y1) * a) / aTop;
      // background: dominant component at each time
      for (let px = Math.floor(X0); px < X1; px += 2) {
        const tt = ((px - X0) / (X1 - X0)) * tMax, a = aAtT(hist, tt);
        if (a <= 0 || tt > tEnd) continue;
        const f = densityFractions(cosmo, a);
        const dom = (Object.keys(COMP) as (keyof typeof COMP)[]).reduce((best, k) => (Math.abs(f[k]) > Math.abs(f[best]) ? k : best), 'm');
        ctx.fillStyle = withAlpha(COMP[dom], 0.07); ctx.fillRect(px, Y1, 2, Y0 - Y1);
      }
      // axes and grid
      ctx.strokeStyle = withAlpha(pal.fg, 0.12); ctx.lineWidth = 1;
      const tStep = tMax > 120 ? 40 : tMax > 60 ? 20 : 10;
      for (let tt = 0; tt <= tMax + 1e-9; tt += tStep) { ctx.beginPath(); ctx.moveTo(X(tt), Y0); ctx.lineTo(X(tt), Y1); ctx.stroke(); label(ctx, fix(fate.bigBang ? tt : tt - tNow, 0, lang), X(tt), Y0 + 14, pal.textFaint, { size: 10, align: 'center', mono: true }); }
      for (let a = 0; a <= aTop + 1e-9; a += aTop > 3 ? 1 : 0.5) { ctx.beginPath(); ctx.moveTo(X0, Y(a)); ctx.lineTo(X1, Y(a)); ctx.stroke(); label(ctx, fix(a, 1, lang), X0 - 6, Y(a), pal.textFaint, { size: 10, align: 'right', mono: true }); }
      label(ctx, fate.bigBang ? tx({ vi: 'thời gian từ Vụ Nổ Lớn (tỉ năm)', en: 'time since the Big Bang (Gyr)' }) : tx({ vi: 'thời gian tính từ hôm nay (tỉ năm)', en: 'time from today (Gyr)' }), (X0 + X1) / 2, Y0 + 28, pal.textDim, { size: 11, align: 'center' });
      label(ctx, 'a(t)', X0 - 34, Y1 - 14, pal.textDim, { size: 12, weight: 700 });
      // a = 1 (today)
      ctx.setLineDash([3, 4]); ctx.strokeStyle = withAlpha(pal.fg, 0.3); ctx.beginPath(); ctx.moveTo(X0, Y(1)); ctx.lineTo(X1, Y(1)); ctx.stroke(); ctx.setLineDash([]);
      // reference models
      ctx.save(); ctx.beginPath(); ctx.rect(X0, Y1, X1 - X0, Y0 - Y1); ctx.clip();
      for (const r of refs) {
        if (r.k === preset && Math.abs(PRESETS[r.k].Om - Om) < 1e-9 && Math.abs(PRESETS[r.k].OL - OL) < 1e-9) continue;
        const shift = fate.bigBang && r.h.hasBigBang ? 0 : tNow - r.h.age; // align "today" when the axis is relative
        ctx.strokeStyle = withAlpha(pal.fg, 0.22); ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.beginPath();
        r.h.points.forEach((p, i) => { const x = X(p.t + shift), y = Y(p.a); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
        const last = r.h.points.filter((p) => p.t + shift <= tMax).pop();
        if (last) label(ctx, tx(PRESETS[r.k].short), Math.min(X(last.t + shift), X1 - 4), Y(last.a) - 8, withAlpha(pal.fg, 0.45), { size: 10, align: 'right' });
      }
      // Hubble-time tangent at today: slope H0 meets a = 0 at t0 − 1/H0
      ctx.strokeStyle = withAlpha(pal.teal, 0.6); ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(X(tNow - tH), Y(0)); ctx.lineTo(X(tNow + 0.35 * tH), Y(1.35)); ctx.stroke(); ctx.setLineDash([]);
      // selected model
      ctx.strokeStyle = pal.gr; ctx.lineWidth = 2.6; ctx.beginPath();
      hist.points.forEach((p, i) => { const x = X(p.t), y = Y(p.a); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
      ctx.restore();
      if (tNow - tH > 0) label(ctx, tx({ vi: '1/H₀ trước hôm nay', en: '1/H₀ before today' }), X(tNow - tH) + 4, Y(0) - 10, pal.teal, { size: 10 });
      // markers
      const mark = (tt: number, a: number, col: string, txt: string, dy = -12, align: CanvasTextAlign = 'center') => {
        if (tt < 0 || tt > tMax) return;
        disk(ctx, X(tt), Y(a), 4, col); label(ctx, txt, X(tt), Y(a) + dy, col, { size: 10.5, weight: 700, align, halo: pal.bg });
      };
      const tOfA = (aa: number) => { for (let i = 1; i < hist.points.length; i++) { const p0 = hist.points[i - 1], p1 = hist.points[i]; if ((p0.a - aa) * (p1.a - aa) <= 0 && p1.t > p0.t) return p0.t + ((aa - p0.a) / (p1.a - p0.a || 1)) * (p1.t - p0.t); } return NaN; };
      if (aAcc && aAcc < aTop) { const ta = tOfA(aAcc); if (Number.isFinite(ta)) mark(ta, aAcc, COMP.L, `${tx({ vi: 'bắt đầu tăng tốc', en: 'acceleration begins' })} (z = ${fix(1 / aAcc - 1, 2, lang)})`, 14, 'left'); }
      mark(tNow, 1, pal.fg, tx({ vi: 'hôm nay', en: 'today' }));
      if (fate.aMax && fate.bigBang) { const tm = tOfA(fate.aMax * 0.99999); if (Number.isFinite(tm)) mark(tm, fate.aMax, '#93c5fd', `a_max = ${fix(fate.aMax, 3, lang)}`); }
      if (tCrunch) mark(tCrunch, 0, '#f87171', tx({ vi: 'Vụ Co Lớn', en: 'Big Crunch' }), -12, 'right');
      if (fate.bigBang) label(ctx, tx({ vi: 'Vụ Nổ Lớn', en: 'Big Bang' }), X(0) + 4, Y(0) - 10, pal.textDim, { size: 10 });
      if (fate.aMin) { const p = hist.points.reduce((b, q) => (q.a < b.a ? q : b), hist.points[0]); mark(p.t, p.a, '#f87171', `${tx({ vi: 'nảy tại', en: 'bounce at' })} a = ${fix(fate.aMin, 3, lang)}`, -12, 'left'); }
      // cursor
      if (tc <= tEnd) {
        ctx.strokeStyle = withAlpha(pal.accent, 0.8); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(tc), Y0); ctx.lineTo(X(tc), Y1); ctx.stroke();
        disk(ctx, X(tc), Y(ac), 5, pal.accent);
      }
      // expansion inset: a comoving lattice of galaxies and a light wave, both stretched by a(t)
      const bx = X0 + 10, by = Y1 + 6, bs = Math.min(118, (X1 - X0) * 0.24);
      ctx.fillStyle = withAlpha(pal.bg, 0.85); ctx.strokeStyle = withAlpha(pal.fg, 0.18); ctx.fillRect(bx, by, bs, bs + 30); ctx.strokeRect(bx, by, bs, bs + 30);
      const sp = (bs / 6) * Math.min(1.9, Math.max(0.12, ac));
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bs, bs); ctx.clip();
      for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) disk(ctx, bx + bs / 2 + i * sp, by + bs / 2 + j * sp, 2, i === 0 && j === 0 ? pal.teal : '#c4b5fd');
      ctx.restore();
      const lam = 10 * Math.min(2.4, Math.max(0.25, ac));
      ctx.strokeStyle = ac < 1 ? '#93c5fd' : '#fca5a5'; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let x = 0; x <= bs - 8; x++) { const yy = by + bs + 12 + 5 * Math.sin((2 * Math.PI * x) / lam); if (x) ctx.lineTo(bx + 4 + x, yy); else ctx.moveTo(bx + 4 + x, yy); }
      ctx.stroke();
      label(ctx, tx({ vi: 'khoảng cách và bước sóng ∝ a', en: 'distances and wavelengths ∝ a' }), bx + 4, by + bs + 25, pal.textFaint, { size: 9 });
      // header
      const zc = ac > 0 && ac < 1 ? ` · z = ${fix(1 / ac - 1, 2, lang)}` : '';
      label(ctx, `${fate.bigBang ? `t = ${fix(tc, 2, lang)}` : `t − t₀ = ${fix(tc - tNow, 2, lang)}`} ${tx({ vi: 'tỉ năm', en: 'Gyr' })} · a = ${fix(ac, 3, lang)}${zc}`, X0, A.y + 14, pal.fg, { size: 12.5, mono: true, weight: 600 });
    }

    // ── B: the Ωm–ΩΛ plane ──
    {
      const m = { l: 40, r: 12, t: 26, b: 30 };
      const X0 = B.x + m.l, X1 = B.x + B.w - m.r, Y0 = B.y + B.h - m.b, Y1 = B.y + m.t;
      geo.current = { x0: X0, y0: Y0, w: X1 - X0, h: Y0 - Y1 };
      const X = (om: number) => X0 + ((X1 - X0) * (om - PX[0])) / (PX[1] - PX[0]), Y = (ol: number) => Y0 - ((Y0 - Y1) * (ol - PY[0])) / (PY[1] - PY[0]);
      ctx.save(); ctx.beginPath(); ctx.rect(X0, Y1, X1 - X0, Y0 - Y1); ctx.clip();
      ctx.fillStyle = withAlpha(pal.fg, 0.03); ctx.fillRect(X0, Y1, X1 - X0, Y0 - Y1);
      // accelerating region (above ΩΛ = Ωm/2)
      ctx.fillStyle = withAlpha(COMP.L, 0.07); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(3), Y(1.5)); ctx.lineTo(X(3), Y1); ctx.lineTo(X(0), Y1); ctx.fill();
      // no Big Bang region
      ctx.fillStyle = 'rgba(248,113,113,0.20)'; ctx.beginPath(); ctx.moveTo(X(0), Y(1));
      bounds.om.forEach((om, i) => ctx.lineTo(X(om), Y(bounds.bb[i]))); ctx.lineTo(X(3), Y1 - 2); ctx.lineTo(X(0), Y1 - 2); ctx.fill();
      // recollapse region
      ctx.fillStyle = 'rgba(96,165,250,0.18)'; ctx.beginPath(); ctx.moveTo(X(0), Y(0));
      bounds.om.forEach((om, i) => ctx.lineTo(X(om), Y(bounds.rec[i]))); ctx.lineTo(X(3), Y0 + 2); ctx.lineTo(X(0), Y0 + 2); ctx.fill();
      // grid
      ctx.strokeStyle = withAlpha(pal.fg, 0.08);
      for (let om = 0; om <= 3; om += 0.5) { ctx.beginPath(); ctx.moveTo(X(om), Y0); ctx.lineTo(X(om), Y1); ctx.stroke(); }
      for (let ol = -0.5; ol <= 3; ol += 0.5) { ctx.beginPath(); ctx.moveTo(X0, Y(ol)); ctx.lineTo(X1, Y(ol)); ctx.stroke(); }
      // flat line and q0 = 0 line
      ctx.strokeStyle = withAlpha(pal.fg, 0.75); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(1.6), Y(-0.6)); ctx.stroke();
      ctx.strokeStyle = COMP.L; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(3), Y(1.5)); ctx.stroke(); ctx.setLineDash([]);
      // SN Ia confidence regions (F8, Union2.1)
      if (snGrid) {
        const map = (i: number, j: number): [number, number] => [X((1.2 * i) / (snGrid.n1 - 1)), Y((1.6 * j) / (snGrid.n2 - 1))];
        const dch = snGrid.chi2.map((c) => c - snGrid.min);
        ctx.fillStyle = 'rgba(255,255,255,0.0)';
        DCHI2_2D.forEach((lvl, k) => { ctx.strokeStyle = ['#f8fafc', '#cbd5e1', '#94a3b8'][k]; ctx.lineWidth = k ? 1.1 : 1.8; drawContour(ctx, dch, snGrid.n1, snGrid.n2, lvl, map); ctx.stroke(); });
      }
      ctx.restore();
      // labels
      const lab = (s: string, om: number, ol: number, col: string, align: CanvasTextAlign = 'left') => label(ctx, s, X(om), Y(ol), col, { size: 10, align, halo: pal.bg });
      lab(tx({ vi: 'Không có Vụ Nổ Lớn', en: 'No Big Bang' }), 0.08, 2.75, '#fca5a5');
      lab(tx({ vi: 'Co lại (Vụ Co Lớn)', en: 'Recollapse (Big Crunch)' }), 2.95, -0.45, '#93c5fd', 'right');
      lab(tx({ vi: 'Giãn nở mãi mãi', en: 'Expands forever' }), 2.95, 0.6, withAlpha(pal.fg, 0.6), 'right');
      lab(tx({ vi: 'phẳng Ω_k = 0', en: 'flat Ω_k = 0' }), 1.32, -0.2, pal.fg);
      lab(tx({ vi: 'mở', en: 'open' }), 0.12, 0.62, withAlpha(pal.fg, 0.6)); lab(tx({ vi: 'đóng', en: 'closed' }), 1.1, 0.75, withAlpha(pal.fg, 0.6));
      lab(tx({ vi: 'tăng tốc ↑ / giảm tốc ↓ (q₀ = 0)', en: 'accelerating ↑ / decelerating ↓ (q₀ = 0)' }), 2.95, 1.62, COMP.L, 'right');
      for (let om = 0; om <= 3; om += 1) label(ctx, fix(om, 0, lang), X(om), Y0 + 12, pal.textFaint, { size: 10, align: 'center', mono: true });
      for (let ol = 0; ol <= 3; ol += 1) label(ctx, fix(ol, 0, lang), X0 - 6, Y(ol), pal.textFaint, { size: 10, align: 'right', mono: true });
      label(ctx, 'Ω_m', X1, Y0 + 22, pal.textDim, { size: 11, align: 'right', weight: 700 });
      label(ctx, 'Ω_Λ', X0 - 30, Y1 - 12, pal.textDim, { size: 11, weight: 700 });
      label(ctx, tx({ vi: 'Hình học, số phận và gia tốc (bấm để chọn)', en: 'Geometry, fate and acceleration (click to choose)' }), B.x + 8, B.y + 12, pal.textDim, { size: 11, weight: 700 });
      for (const [k, p] of Object.entries(PRESETS)) { disk(ctx, X(p.Om), Y(p.OL), 2.5, withAlpha(pal.fg, 0.55)); label(ctx, tx(p.short), X(p.Om) + 5, Y(p.OL) + 9, withAlpha(pal.fg, 0.5), { size: 9 }); void k; }
      const cx = X(Math.min(3, Math.max(0, Om))), cy = Y(Math.min(3, Math.max(-0.6, OL)));
      ctx.strokeStyle = pal.gr; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 2 * Math.PI); ctx.stroke(); disk(ctx, cx, cy, 3, pal.gr);
    }

    // ── C: density parameters Ω_i(a) ──
    {
      const m = { l: 40, r: 12, t: 26, b: 30 };
      const X0 = C.x + m.l, X1 = C.x + C.w - m.r, Y0 = C.y + C.h - m.b, Y1 = C.y + m.t;
      const LA: [number, number] = [-5, 1];
      let fLo = -0.25, fHi = 1.05;
      for (let i = 0; i <= 120; i++) { const a = 10 ** (LA[0] + ((LA[1] - LA[0]) * i) / 120); if ((fate.aMin && a < fate.aMin) || (fate.aMax && a > fate.aMax)) continue; const f = densityFractions(cosmo, a); fLo = Math.min(fLo, f.k, f.L); fHi = Math.max(fHi, f.m, f.r, f.L, f.k); }
      const yr: [number, number] = [Math.max(-4, fLo - 0.05), Math.min(5, fHi + 0.05)];
      const X = (la: number) => X0 + ((X1 - X0) * (la - LA[0])) / (LA[1] - LA[0]), Y = (v: number) => Y0 - ((Y0 - Y1) * (v - yr[0])) / (yr[1] - yr[0]);
      const laLo = fate.aMin ? Math.log10(fate.aMin) : LA[0], laHi = fate.aMax ? Math.log10(fate.aMax) : LA[1];
      ctx.strokeStyle = withAlpha(pal.fg, 0.08);
      for (let la = LA[0]; la <= LA[1]; la++) { ctx.beginPath(); ctx.moveTo(X(la), Y0); ctx.lineTo(X(la), Y1); ctx.stroke(); label(ctx, `10${['⁻⁵', '⁻⁴', '⁻³', '⁻²', '⁻¹', '⁰', '¹'][la + 5]}`, X(la), Y0 + 12, pal.textFaint, { size: 10, align: 'center' }); }
      for (const v of yr[1] - yr[0] > 2.5 ? [-2, -1, 0, 1, 2, 3, 4].filter((x) => x >= yr[0] && x <= yr[1]) : [0, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(X0, Y(v)); ctx.lineTo(X1, Y(v)); ctx.stroke(); label(ctx, fix(v, 1, lang), X0 - 6, Y(v), pal.textFaint, { size: 10, align: 'right', mono: true }); }
      for (const k of Object.keys(COMP) as (keyof typeof COMP)[]) {
        ctx.strokeStyle = COMP[k]; ctx.lineWidth = 2; ctx.beginPath(); let started = false;
        for (let i = 0; i <= 240; i++) {
          const la = LA[0] + ((LA[1] - LA[0]) * i) / 240;
          if (la < laLo || la > laHi) { started = false; continue; }
          const f = densityFractions(cosmo, 10 ** la)[k];
          const x = X(la), y = Y(Math.max(yr[0], Math.min(yr[1], f)));
          if (started) ctx.lineTo(x, y); else { ctx.moveTo(x, y); started = true; }
        }
        ctx.stroke();
      }
      // today and cursor
      ctx.setLineDash([3, 4]); ctx.strokeStyle = withAlpha(pal.fg, 0.4); ctx.beginPath(); ctx.moveTo(X(0), Y0); ctx.lineTo(X(0), Y1); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, tx({ vi: 'hôm nay', en: 'today' }), X(0) + 3, Y1 + 6, pal.textDim, { size: 9.5 });
      if (ac > 0) { const la = Math.log10(ac); if (la >= LA[0] && la <= LA[1]) { ctx.strokeStyle = pal.accent; ctx.beginPath(); ctx.moveTo(X(la), Y0); ctx.lineTo(X(la), Y1); ctx.stroke(); } }
      label(ctx, tx({ vi: 'Tỉ phần mật độ Ω_i(a)', en: 'Density fractions Ω_i(a)' }), C.x + 8, C.y + 12, pal.textDim, { size: 11, weight: 700 });
      let lx = C.x + C.w - 10;
      for (const k of (['L', 'k', 'm', 'r'] as (keyof typeof COMP)[])) { const s = tx(COMP_NAME[k]).replace('hằng số vũ trụ ', '').replace('cosmological constant ', ''); label(ctx, s, lx, C.y + 12, COMP[k], { size: 10, align: 'right', weight: 700 }); ctx.font = '700 10px sans-serif'; lx -= ctx.measureText(s).width + 12; }
      label(ctx, 'a', X1, Y0 + 22, pal.textDim, { size: 11, align: 'right', weight: 700 });
    }
  }, [pal, hist, refs, bounds, snGrid, cosmo, fate, tx, lang, Om, OL, preset, tNow, tEnd, tH, aAcc, tCrunch]);

  useAnimationFrame((dt, now) => {
    if (playing) { tRef.current += (dt * Math.max(tEnd, 20)) / 14; if (tRef.current > tEnd) tRef.current = fate.bigBang ? 0.05 : 0; }
    redraw();
    if (now - lastUi.current > 150) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = (e.target as HTMLCanvasElement).getBoundingClientRect(), g = geo.current;
    const om = PX[0] + ((e.clientX - r.left - g.x0) / g.w) * (PX[1] - PX[0]), ol = PY[0] + ((g.y0 - (e.clientY - r.top)) / g.h) * (PY[1] - PY[0]);
    if (om < -0.02 || om > 3.02 || ol < -0.62 || ol > 3.02) return;
    setParams({ Om: Math.max(0, Math.min(3, Math.round(om * 1000) / 1000)), OL: Math.max(-0.6, Math.min(3, Math.round(ol * 1000) / 1000)), rad: false });
  };

  const zOk = !fate.aMin || 1 / (1 + z) > fate.aMin;
  const DC = zOk ? comovingDistanceMpc(cosmo, z) : NaN, DL = zOk ? luminosityDistanceMpc(cosmo, z) : NaN, DA = zOk ? angularDiameterDistanceMpc(cosmo, z) : NaN;
  const distChart = useMemo(() => {
    const dc: [number, number][] = [], dl: [number, number][] = [], da: [number, number][] = [];
    for (let k = 1; k <= 80; k++) {
      const zz = 10 ** (-2 + (k / 80) * 3);
      if (fate.aMin && 1 / (1 + zz) < fate.aMin) break;
      dc.push([zz, comovingDistanceMpc(cosmo, zz) / 1000]); dl.push([zz, luminosityDistanceMpc(cosmo, zz) / 1000]); da.push([zz, angularDiameterDistanceMpc(cosmo, zz) / 1000]);
    }
    return { dc, dl, da };
  }, [cosmo, fate]);
  const fateText = !fate.bigBang
    ? tx({ vi: fate.aMin ? `Không có Vụ Nổ Lớn: giãn nở bắt đầu từ một cú “nảy” tại a = ${fix(fate.aMin, 3, lang)}` : 'Không có Vụ Nổ Lớn ở thời điểm hữu hạn', en: fate.aMin ? `No Big Bang: expansion starts from a bounce at a = ${fix(fate.aMin, 3, lang)}` : 'No Big Bang at a finite time' })
    : fate.recollapse
      ? tx({ vi: `Giãn nở tới a_max = ${fix(fate.aMax!, 3, lang)} rồi co lại`, en: `Expands to a_max = ${fix(fate.aMax!, 3, lang)} and then recollapses` })
      : tx({ vi: 'Giãn nở mãi mãi', en: 'Expands forever' });

  return (
    <SimLayout
      id="d8"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{Number.isFinite(age) ? <>t₀ = {fix(age, 3, lang)} {tx({ vi: 'tỉ năm', en: 'Gyr' })}</> : tx({ vi: 'không có Vụ Nổ Lớn', en: 'no Big Bang' })}</span> · Ω_k = {fix(omegaK(cosmo), 4, lang)} · q₀ = {fix(q0, 3, lang)} · {fateText}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>{tx({ vi: 'Dòng thời gian vũ trụ', en: 'Cosmic timeline' })}<small>{tx({ vi: 'con trỏ cam chạy dọc a(t); hai khung bên phải đánh dấu cùng thời điểm', en: 'the orange cursor runs along a(t); the right panels mark the same moment' })}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Mô hình vũ trụ', en: 'Cosmological model' })} dot="var(--grpD)">
            <Select value={preset} onChange={(v) => setParams({ preset: v, H0: null, Om: null, OL: null, rad: null })} options={Object.entries(PRESETS).map(([k, p]) => ({ value: k, label: tx(p.name) }))} />
            <Slider label="H₀" value={H0} min={40} max={100} step={0.01} onChange={setH0} display={`${fix(H0, 2, lang)} km/s/Mpc`} />
            <Slider label="Ω_m" value={Om} min={0} max={3} step={0.001} onChange={setOm} display={fix(Om, 4, lang)} />
            <Slider label="Ω_Λ" value={OL} min={-0.6} max={3} step={0.001} onChange={setOL} display={fix(OL, 4, lang)} />
            <Toggle label={tx({ vi: 'Tính bức xạ Ω_r', en: 'Include radiation Ω_r' })} checked={rad} onChange={setRad} />
            <Toggle label={tx({ vi: `Hiện vùng tin cậy từ siêu tân tinh Ia (Union2.1${refF(', mô-đun F8')})`, en: `Show SN Ia confidence regions (Union2.1${refF(', module F8')})` })} checked={showSn} onChange={setShowSn} />
            <div className="field-hint">{tx({ vi: 'Bấm vào mặt phẳng Ω_m-Ω_Λ để chọn một vũ trụ. Vùng đỏ: không có Vụ Nổ Lớn; vùng xanh: vũ trụ sẽ co lại; vùng vàng: đang tăng tốc. Các biên tính với Ω_r = 0.', en: 'Click the Ω_m-Ω_Λ plane to choose a universe. Red: no Big Bang; blue: the universe will recollapse; yellow: accelerating today. Boundaries assume Ω_r = 0.' })}</div>
          </Section>
          <Section title={tx({ vi: 'Lịch sử và số phận', en: 'History and fate' })}>
            <Readouts>
              <Readout k={tx({ vi: 'Tuổi vũ trụ t₀', en: 'Age t₀' })} v={Number.isFinite(age) ? fix(age, 3, lang) : tx({ vi: 'không có Vụ Nổ Lớn', en: 'no Big Bang' })} unit={Number.isFinite(age) ? tx({ vi: 'tỉ năm', en: 'Gyr' }) : ''} tone="accent" />
              <Readout k={tx({ vi: 'Thời gian Hubble 1/H₀', en: 'Hubble time 1/H₀' })} v={fix(tH, 3, lang)} unit={tx({ vi: 'tỉ năm', en: 'Gyr' })} frame={Number.isFinite(age) ? `t₀ H₀ = ${fix(age / tH, 3, lang)}` : undefined} />
              <Readout k="Ω_k" v={fix(omegaK(cosmo), 5, lang)} frame={Math.abs(omegaK(cosmo)) < 1e-4 ? tx({ vi: 'phẳng', en: 'flat' }) : omegaK(cosmo) > 0 ? tx({ vi: 'mở (cong âm)', en: 'open (negative curvature)' }) : tx({ vi: 'đóng (cong dương)', en: 'closed (positive curvature)' })} />
              <Readout k={tx({ vi: 'Tham số giảm tốc q₀', en: 'Deceleration q₀' })} v={fix(q0, 3, lang)} tone={q0 < 0 ? 'good' : undefined} frame={q0 < 0 ? tx({ vi: 'đang tăng tốc', en: 'accelerating' }) : tx({ vi: 'đang giảm tốc', en: 'decelerating' })} />
              <Readout k={tx({ vi: 'Bắt đầu tăng tốc', en: 'Acceleration begins' })} v={aAcc && (!fate.aMax || aAcc < fate.aMax) ? (aAcc < 1 ? `z = ${fix(1 / aAcc - 1, 3, lang)}` : `a = ${fix(aAcc, 3, lang)}`) : '-'} frame={aAcc && aAcc >= 1 ? tx({ vi: 'trong tương lai', en: 'in the future' }) : undefined} />
              <Readout k={tx({ vi: 'Vật chất = bức xạ', en: 'Matter = radiation' })} v={aEq ? `z = ${fmt(1 / aEq - 1, 4, lang)}` : '-'} frame={aEq ? undefined : tx({ vi: 'bật Ω_r', en: 'enable Ω_r' })} />
              <Readout k={tx({ vi: 'Vật chất = Λ', en: 'Matter = Λ' })} v={aML ? (aML < 1 ? `z = ${fix(1 / aML - 1, 3, lang)}` : `a = ${fix(aML, 3, lang)}`) : '-'} />
              <Readout k={tx({ vi: 'Số phận', en: 'Fate' })} v={tCrunch ? `${tx({ vi: 'Co Lớn ở', en: 'Crunch at' })} ${fix(tCrunch, 1, lang)} ${tx({ vi: 'tỉ năm', en: 'Gyr' })}` : fate.recollapse ? tx({ vi: 'co lại', en: 'recollapse' }) : fate.bigBang ? tx({ vi: 'giãn nở mãi', en: 'expands forever' }) : tx({ vi: 'nảy', en: 'bounce' })} wide />
            </Readouts>
          </Section>
          <Section title={tx({ vi: 'Thiên hà ở dịch chuyển đỏ z', en: 'A galaxy at redshift z' })}>
            <Slider label="z" value={z} min={0} max={20} step={0.01} onChange={setZ} display={fix(z, 2, lang)} />
            {zOk ? (
              <Readouts>
                <Readout k={tx({ vi: 'Thời gian nhìn lại', en: 'Look-back time' })} v={Number.isFinite(age) ? fix(lookbackTimeGyr(cosmo, z), 3, lang) : '-'} unit={tx({ vi: 'tỉ năm', en: 'Gyr' })} />
                <Readout k={tx({ vi: 'Tuổi vũ trụ khi phát', en: 'Age at emission' })} v={Number.isFinite(age) ? fix(ageAtZ(cosmo, z), 3, lang) : '-'} unit={tx({ vi: 'tỉ năm', en: 'Gyr' })} />
                <Readout k="a = 1/(1+z)" v={fix(1 / (1 + z), 4, lang)} />
                <Readout k="H(z)" v={fmt(H0 * Ez(cosmo, z), 4, lang)} unit="km/s/Mpc" />
                <Readout k={tx({ vi: 'D đồng chuyển động', en: 'Comoving D_C' })} v={fmt(DC / 1000, 4, lang)} unit="Gpc" />
                <Readout k={tx({ vi: 'D độ sáng', en: 'Luminosity D_L' })} v={fmt(DL / 1000, 4, lang)} unit="Gpc" />
                <Readout k={tx({ vi: 'D đường kính góc', en: 'Angular-diameter D_A' })} v={fmt(DA / 1000, 4, lang)} unit="Gpc" />
                <Readout k={tx({ vi: 'Môđun khoảng cách μ', en: 'Distance modulus μ' })} v={z > 0 ? fix(distanceModulus(cosmo, z), 2, lang) : '-'} unit="mag" />
              </Readouts>
            ) : <div className="warn-box">{tx({ vi: 'Trong vũ trụ này, a chưa bao giờ nhỏ hơn a_min, nên không có ánh sáng nào đến từ dịch chuyển đỏ lớn như vậy.', en: 'In this universe a never fell below a_min, so no light arrives from such a high redshift.' })}</div>}
          </Section>
          <Section title={tx({ vi: 'Biểu đồ', en: 'Charts' })}>
            {student && (
              <ChartCard title={tx({ vi: 'Khoảng cách theo z', en: 'Distances vs z' })}>
                <LineChart height={180} xLog yLog xLabel="z" yLabel="Gpc" series={[{ data: distChart.dl, color: pal.sun, label: 'D_L' }, { data: distChart.dc, color: pal.teal, label: 'D_C' }, { data: distChart.da, color: pal.horizon, label: 'D_A' }]} vlines={z > 0.01 ? [{ x: z, color: pal.accent }] : []} />
              </ChartCard>
            )}
            {student && <div className="eq-box"><Tex display tex={'H^2 = H_0^2\\left[\\Omega_r a^{-4} + \\Omega_m a^{-3} + \\Omega_k a^{-2} + \\Omega_\\Lambda\\right]'} /><Tex display tex={'q = \\frac{\\Omega_r a^{-4} + \\tfrac12\\Omega_m a^{-3} - \\Omega_\\Lambda}{H^2/H_0^2}'} /></div>}
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} onClick={onClick} style={{ cursor: 'crosshair' }} role="img" aria-label={tx({ vi: 'Lịch sử giãn nở a(t), mặt phẳng (Ωm, ΩΛ) và tỉ phần mật độ', en: 'Expansion history a(t), the (Ωm, ΩΛ) plane and density fractions' })} />
    </SimLayout>
  );
}
