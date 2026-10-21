import { useEffect, useMemo, useRef, useState } from 'react';
import {
  UNION21_Z, UNION21_MU, UNION21_ERR, UNION21_N, muModel, chi2Sn, gridPosterior, flatLcdmFit, mockSn, metropolis, q0, DCHI2_2D,
  type SnData, type SnModel, type SnGrid,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Segmented, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { Tex } from '../../components/Tex';
import { useT, fix, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label, withAlpha, disk } from '../../lib/canvas';
import { LUTS } from '../../lib/colormap';
import { drawContour } from '../../lib/contour';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const REAL: SnData = { z: UNION21_Z, mu: UNION21_MU, err: UNION21_ERR, n: UNION21_N };
const SPACE: Record<SnModel, { r1: [number, number]; r2: [number, number]; n1: number; n2: number; s1: string; s2: string; c1: string; c2: string; start: [number, number] }> = {
  olcdm: { r1: [0, 1.2], r2: [0, 1.6], n1: 97, n2: 129, s1: 'Ω_m', s2: 'Ω_Λ', c1: 'Ωm', c2: 'ΩΛ', start: [1, 0] },
  wcdm: { r1: [0.05, 0.65], r2: [-2.2, -0.2], n1: 97, n2: 129, s1: 'Ω_m', s2: 'w', c1: 'Ωm', c2: 'w', start: [0.6, -0.4] },
};
const CL: { lvl: number; name: L; color: string }[] = [
  { lvl: DCHI2_2D[0], name: { vi: '68%', en: '68%' }, color: '#f8fafc' },
  { lvl: DCHI2_2D[1], name: { vi: '95%', en: '95%' }, color: '#cbd5e1' },
  { lvl: DCHI2_2D[2], name: { vi: '99,7%', en: '99.7%' }, color: '#64748b' },
];
// a smooth (decimated, z-sorted) z grid for model curves
const ZC = Array.from({ length: 120 }, (_, i) => 10 ** (-2 + (i / 119) * Math.log10(150)));
const MILNE = muModel('olcdm', 0, 0, ZC)!;
const MILNE_DATA = muModel('olcdm', 0, 0, UNION21_Z)!;

export default function InferenceModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [model, setModel] = useParam<SnModel>('m', 'olcdm');
  const [dataSrc, setDataSrc] = useParam<'real' | 'mock'>('data', 'real');
  const [mt1, setMt1] = useParam('mt1', 0.3, { min: 0, max: 1.2 });
  const [mtl, setMtl] = useParam('mtl', 0.7, { min: 0, max: 1.4 });
  const [mtw, setMtw] = useParam('mtw', -1, { min: -2, max: -0.3 });
  const mt2 = model === 'wcdm' ? mtw : mtl;
  const [mseed, setMseed] = useParam('ms', 1);
  const sp = SPACE[model];
  const [p1, setP1] = useParam('p1', sp.start[0]);
  const [p2, setP2] = useParam('p2', sp.start[1]);
  const [showGrid, setShowGrid] = useParam('grid', true);
  const [stepK, setStepK] = useParam('step', 1, { min: 0.1, max: 4 });
  const [rate, setRate] = useParam('rate', 30, { min: 2, max: 300 });
  const [playing, setPlaying] = useState(false);

  const data = useMemo(() => (dataSrc === 'mock' ? mockSn(REAL, model, mt1, mt2, mseed) : REAL), [dataSrc, model, mt1, mt2, mseed]);

  // ── progressive χ² grid (row chunks per frame) ──
  const [grid, setGrid] = useState<SnGrid | null>(null);
  const gridRef = useRef<SnGrid | null>(null);
  const [gridRows, setGridRows] = useState(0);
  useEffect(() => {
    const { r1, r2, n1, n2 } = sp, chi2 = new Float64Array(n1 * n2).fill(NaN), scratch = new Float64Array(data.n);
    let j = 0, cancelled = false, min = Infinity, best: [number, number] = [NaN, NaN];
    setGrid(null); setGridRows(0);
    const work = () => {
      if (cancelled) return;
      const t0 = performance.now();
      while (j < n2 && performance.now() - t0 < 12) {
        for (let i = 0; i < n1; i++) {
          const a = r1[0] + ((r1[1] - r1[0]) * i) / (n1 - 1), b = r2[0] + ((r2[1] - r2[0]) * j) / (n2 - 1);
          const c = chi2Sn(data, model, a, b, scratch).chi2;
          chi2[j * n1 + i] = c;
          if (c < min) { min = c; best = [a, b]; }
        }
        j++;
      }
      setGridRows(j);
      if (j < n2) requestAnimationFrame(work);
      else setGrid({ n1, n2, r1, r2, chi2, min, best });
    };
    const partial = { n1, n2, r1, r2, chi2, get min() { return min; }, get best() { return best; } };
    gridRef.current = partial as unknown as SnGrid;
    requestAnimationFrame(work);
    return () => { cancelled = true; };
  }, [data, model]); // eslint-disable-line react-hooks/exhaustive-deps
  const post = useMemo(() => (grid ? gridPosterior(grid, model) : null), [grid, model]);
  const flat = useMemo(() => (model === 'olcdm' ? flatLcdmFit(data) : null), [data, model]);

  // ── Metropolis chain ──
  const chainRef = useRef<{ s: ReturnType<typeof metropolis>; pts: number[]; last: { p: number[]; ok: boolean } | null } | null>(null);
  const resetChain = () => {
    const logp = (x: number[]) => {
      if (x[0] < sp.r1[0] || x[0] > sp.r1[1] || x[1] < sp.r2[0] || x[1] > sp.r2[1]) return -Infinity; // flat prior on the box
      return -0.5 * chi2Sn(data, model, x[0], x[1]).chi2;
    };
    const step = [0.03 * stepK * (sp.r1[1] - sp.r1[0]) / 1.2, 0.03 * stepK * (sp.r2[1] - sp.r2[0]) / 1.6];
    chainRef.current = { s: metropolis(logp, [p1, p2], step, 7 + mseed), pts: [], last: null };
  };
  useEffect(() => { resetChain(); }, [data, model, stepK]); // eslint-disable-line react-hooks/exhaustive-deps
  const acc = useRef(0);
  const [, setTick] = useState(0);
  const lastTick = useRef(0);
  useAnimationFrame((dt, now) => {
    if (playing && chainRef.current) {
      acc.current += dt * rate;
      let k = 0;
      while (acc.current >= 1 && k < 400) {
        acc.current -= 1; k++;
        const r = chainRef.current.s.next();
        chainRef.current.pts.push(r.x[0], r.x[1]);
        chainRef.current.last = { p: r.proposal, ok: r.accepted };
      }
    }
    redraw();
    if (now - lastTick.current > 150) { lastTick.current = now; setTick((x) => x + 1); }
  });

  const trial = useMemo(() => chi2Sn(data, model, p1, p2), [data, model, p1, p2]);
  const gmin = grid?.min ?? gridRef.current?.min ?? NaN;
  const dchi = trial.chi2 - gmin;
  const quality = Number.isFinite(dchi) ? Math.exp(-0.5 * Math.min(60, dchi) / 6) : 0;

  const chainStats = (() => {
    const c = chainRef.current;
    if (!c || c.pts.length < 40) return null;
    const burn = Math.floor(c.pts.length / 2 / 5) * 2, n = (c.pts.length - burn) / 2;
    let a = 0, b = 0, aa = 0, bb = 0;
    for (let i = burn; i < c.pts.length; i += 2) { a += c.pts[i]; b += c.pts[i + 1]; aa += c.pts[i] ** 2; bb += c.pts[i + 1] ** 2; }
    a /= n; b /= n;
    return { n: c.pts.length / 2, m1: a, m2: b, s1: Math.sqrt(Math.max(0, aa / n - a * a)), s2: Math.sqrt(Math.max(0, bb / n - b * b)), acc: c.s.acceptance };
  })();

  // layout shared between draw and click
  const L1 = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    const wide = w > 760;
    const pad = 46;
    const left = wide ? { x: pad + 6, y: 28, w: Math.min(w * 0.42, h - 80), h: h - 80 } : { x: pad + 6, y: 24, w: w - pad - 22, h: h * 0.48 - 40 };
    if (wide) left.w = Math.min(left.w, left.h * 0.9);
    L1.current = left;
    const X = (v: number) => left.x + ((v - sp.r1[0]) / (sp.r1[1] - sp.r1[0])) * left.w;
    const Y = (v: number) => left.y + left.h - ((v - sp.r2[0]) / (sp.r2[1] - sp.r2[0])) * left.h;
    const G = grid ?? gridRef.current;
    // likelihood heat map
    ctx.fillStyle = withAlpha(pal.fg, 0.03); ctx.fillRect(left.x, left.y, left.w, left.h);
    if (G && showGrid && Number.isFinite(G.min)) {
      const img = new ImageData(G.n1, G.n2), Lt = LUTS.cosmic;
      for (let j = 0; j < G.n2; j++) for (let i = 0; i < G.n1; i++) {
        const c = G.chi2[j * G.n1 + i], o = 4 * ((G.n2 - 1 - j) * G.n1 + i);
        if (Number.isNaN(c)) continue;
        if (!Number.isFinite(c)) { img.data[o] = 60; img.data[o + 1] = 20; img.data[o + 2] = 28; img.data[o + 3] = 200; continue; }
        const L = Math.exp(-0.5 * (c - G.min)), k = 3 * Math.round(Math.min(1, Math.sqrt(L)) * 255);
        img.data[o] = Lt[k]; img.data[o + 1] = Lt[k + 1]; img.data[o + 2] = Lt[k + 2]; img.data[o + 3] = 40 + 215 * Math.sqrt(L);
      }
      const oc = document.createElement('canvas'); oc.width = G.n1; oc.height = G.n2; oc.getContext('2d')!.putImageData(img, 0, 0);
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(oc, left.x, left.y, left.w, left.h); ctx.restore();
      if (grid) {
        const dch = grid.chi2.map((c) => c - grid.min);
        const map = (i: number, j: number): [number, number] => [left.x + (i / (grid.n1 - 1)) * left.w, left.y + left.h - (j / (grid.n2 - 1)) * left.h];
        for (const c of [...CL].reverse()) { ctx.strokeStyle = c.color; ctx.lineWidth = c.lvl < 3 ? 1.8 : 1.1; drawContour(ctx, dch, grid.n1, grid.n2, c.lvl, map); }
      }
    }
    // reference lines
    ctx.save(); ctx.beginPath(); ctx.rect(left.x, left.y, left.w, left.h); ctx.clip();
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
    if (model === 'olcdm') {
      ctx.strokeStyle = withAlpha(pal.teal, 0.9); ctx.beginPath(); ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(1.2), Y(-0.2)); ctx.stroke();
      ctx.strokeStyle = withAlpha(pal.warn, 0.9); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(1.2), Y(0.6)); ctx.stroke();
    } else {
      ctx.strokeStyle = withAlpha(pal.teal, 0.9); ctx.beginPath(); ctx.moveTo(X(sp.r1[0]), Y(-1)); ctx.lineTo(X(sp.r1[1]), Y(-1)); ctx.stroke();
      ctx.strokeStyle = withAlpha(pal.warn, 0.9); ctx.beginPath();
      for (let k = 0; k <= 60; k++) { const om = sp.r1[0] + ((sp.r1[1] - sp.r1[0]) * k) / 60, wq = -1 / (3 * (1 - om)); if (k) ctx.lineTo(X(om), Y(wq)); else ctx.moveTo(X(om), Y(wq)); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // chain
    const ch = chainRef.current;
    if (ch && ch.pts.length) {
      const n = ch.pts.length / 2;
      for (let k = 0; k < n; k++) {
        const age = (n - k) / n;
        ctx.fillStyle = withAlpha('#67e8f9', 0.15 + 0.6 * (1 - age) ** 3);
        ctx.fillRect(X(ch.pts[2 * k]) - 1.2, Y(ch.pts[2 * k + 1]) - 1.2, 2.4, 2.4);
      }
      const cx = X(ch.pts[2 * n - 2]), cy = Y(ch.pts[2 * n - 1]);
      if (ch.last && playing) {
        const px = X(ch.last.p[0]), py = Y(ch.last.p[1]);
        ctx.strokeStyle = ch.last.ok ? '#4ade80' : withAlpha('#f87171', 0.8); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
        disk(ctx, px, py, 2.5, ch.last.ok ? '#4ade80' : '#f87171');
      }
      disk(ctx, cx, cy, 4, '#67e8f9');
    }
    // markers: Planck, mock truth, best fit, trial
    if (model === 'olcdm') { ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.strokeRect(X(0.315) - 4, Y(0.685) - 4, 8, 8); }
    else { ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.strokeRect(X(0.315) - 4, Y(-1) - 4, 8, 8); }
    if (dataSrc === 'mock') label(ctx, '★', X(mt1), Y(mt2) + 6, '#fde047', { size: 18, align: 'center', halo: '#000' });
    if (grid) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; const bx = X(grid.best[0]), by = Y(grid.best[1]); ctx.beginPath(); ctx.moveTo(bx - 5, by); ctx.lineTo(bx + 5, by); ctx.moveTo(bx, by - 5); ctx.lineTo(bx, by + 5); ctx.stroke(); }
    const qc = `hsl(${Math.round(8 + 180 * quality)}, 85%, 62%)`;
    ctx.restore();
    glowRing(ctx, X(p1), Y(p2), qc);
    // axes
    ctx.strokeStyle = withAlpha(pal.fg, 0.35); ctx.lineWidth = 1; ctx.strokeRect(left.x, left.y, left.w, left.h);
    for (let k = 0; k <= 6; k++) { const v1 = sp.r1[0] + ((sp.r1[1] - sp.r1[0]) * k) / 6; label(ctx, fix(v1, 2, lang), X(v1), left.y + left.h + 14, pal.textDim, { size: 10, align: 'center', mono: true }); }
    for (let k = 0; k <= 8; k++) { const v2 = sp.r2[0] + ((sp.r2[1] - sp.r2[0]) * k) / 8; label(ctx, fix(v2, 1, lang), left.x - 6, Y(v2) + 3, pal.textDim, { size: 10, align: 'right', mono: true }); }
    label(ctx, sp.c1, left.x + left.w / 2, left.y + left.h + 32, pal.text, { size: 13, align: 'center', weight: 700 });
    label(ctx, `${sp.c2} ↑`, left.x - 6, left.y - 10, pal.text, { size: 13, align: 'right', weight: 700 });
    if (model === 'olcdm') {
      label(ctx, tx({ vi: 'phẳng (Ω_k = 0)', en: 'flat (Ω_k = 0)' }), X(0.82), Y(0.18) - 6, pal.teal, { size: 10.5, halo: pal.bg });
      label(ctx, tx({ vi: 'tăng tốc ↑ / giảm tốc ↓', en: 'accelerating ↑ / decelerating ↓' }), X(0.95), Y(0.475) + 14, pal.warn, { size: 10.5, align: 'center', halo: pal.bg });
      label(ctx, tx({ vi: 'không có Vụ Nổ Lớn', en: 'no Big Bang' }), X(0.08), Y(1.5), '#fca5a5', { size: 10.5, halo: pal.bg });
    } else {
      label(ctx, 'w = −1 (Λ)', X(sp.r1[1]) - 4, Y(-1) - 6, pal.teal, { size: 10.5, align: 'right', halo: pal.bg });
      label(ctx, tx({ vi: 'ranh giới tăng tốc', en: 'acceleration boundary' }), X(0.12), Y(-0.42), pal.warn, { size: 10.5, halo: pal.bg });
    }
    if (!grid) label(ctx, tx({ vi: `Đang quét χ²… ${Math.round((100 * gridRows) / sp.n2)}%`, en: `Scanning χ²… ${Math.round((100 * gridRows) / sp.n2)}%` }), left.x + 8, left.y + 16, pal.text, { size: 11, halo: pal.bg });

    // ── right: Hubble diagram + residuals vs an empty (Milne) universe ──
    const R = wide ? { x: left.x + left.w + 90, y: 28, w: w - (left.x + left.w + 90) - 18, h: h - 80 } : { x: pad + 6, y: h * 0.52 + 6, w: w - pad - 22, h: h * 0.48 - 40 };
    const top = { ...R, h: R.h * 0.5 - 8 }, bot = { ...R, y: R.y + R.h * 0.5 + 18, h: R.h * 0.5 - 18 };
    const lz0 = -2, lz1 = Math.log10(1.5);
    const zx = (z: number) => R.x + ((Math.log10(z) - lz0) / (lz1 - lz0)) * R.w;
    const muY = (m: number) => top.y + top.h - ((m - 32) / (46 - 32)) * top.h;
    const dY = (d: number) => bot.y + bot.h / 2 - (d / 0.9) * (bot.h / 2);
    for (const P of [top, bot]) { ctx.fillStyle = withAlpha(pal.fg, 0.03); ctx.fillRect(P.x, P.y, P.w, P.h); ctx.strokeStyle = withAlpha(pal.fg, 0.3); ctx.strokeRect(P.x, P.y, P.w, P.h); }
    for (const z of [0.01, 0.03, 0.1, 0.3, 1]) {
      ctx.strokeStyle = withAlpha(pal.fg, 0.07); ctx.beginPath(); ctx.moveTo(zx(z), top.y); ctx.lineTo(zx(z), bot.y + bot.h); ctx.stroke();
      label(ctx, fix(z, z < 0.1 ? 2 : 1, lang), zx(z), bot.y + bot.h + 14, pal.textDim, { size: 10, align: 'center', mono: true });
    }
    label(ctx, tx({ vi: 'dịch chuyển đỏ z', en: 'redshift z' }), R.x + R.w / 2, bot.y + bot.h + 32, pal.text, { size: 12.5, align: 'center', weight: 700 });
    for (const m of [34, 38, 42, 46]) label(ctx, String(m), R.x - 6, muY(m) + 3, pal.textDim, { size: 10, align: 'right', mono: true });
    for (const d of [-0.5, 0, 0.5]) { label(ctx, fix(d, 1, lang), R.x - 6, dY(d) + 3, pal.textDim, { size: 10, align: 'right', mono: true }); }
    ctx.strokeStyle = withAlpha(pal.fg, 0.25); ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(R.x, dY(0)); ctx.lineTo(R.x + R.w, dY(0)); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, tx({ vi: 'Môđun khoảng cách μ', en: 'Distance modulus μ' }), top.x + 8, top.y + 15, pal.text, { size: 11.5, weight: 700, halo: pal.bg });
    label(ctx, tx({ vi: 'μ − μ(vũ trụ rỗng): > 0 nghĩa là SN mờ hơn ⇒ tăng tốc', en: 'μ − μ(empty universe): > 0 means SNe are fainter ⇒ acceleration' }), bot.x + 8, bot.y + 15, pal.text, { size: 11.5, weight: 700, halo: pal.bg });
    // data (offset of the best fit removed so curves and points share the H0 = 70 scale)
    const off = trial.offset, bestOff = grid ? chi2Sn(data, model, grid.best[0], grid.best[1]).offset : off;
    ctx.save(); ctx.beginPath(); ctx.rect(R.x, top.y, R.w, bot.y + bot.h - top.y); ctx.clip();
    for (let i = 0; i < data.n; i++) {
      const x = zx(data.z[i]), y = muY(data.mu[i] - bestOff);
      ctx.strokeStyle = withAlpha(pal.textDim, 0.35); ctx.beginPath(); ctx.moveTo(x, muY(data.mu[i] - bestOff - data.err[i])); ctx.lineTo(x, muY(data.mu[i] - bestOff + data.err[i])); ctx.stroke();
      disk(ctx, x, y, 1.6, withAlpha(pal.fg, 0.75));
    }
    // binned residuals (inverse-variance weighted, 14 log-z bins)
    const NB = 14;
    for (let b = 0; b < NB; b++) {
      const lo = lz0 + ((lz1 - lz0) * b) / NB, hi = lz0 + ((lz1 - lz0) * (b + 1)) / NB;
      let sw = 0, sx = 0, sz = 0;
      for (let i = 0; i < data.n; i++) { const lz = Math.log10(data.z[i]); if (lz >= lo && lz < hi) { const wgt = 1 / data.err[i] ** 2; sw += wgt; sx += wgt * (data.mu[i] - bestOff - MILNE_DATA[i]); sz += wgt * lz; } }
      if (sw === 0) continue;
      const x = R.x + ((sz / sw - lz0) / (lz1 - lz0)) * R.w, y = dY(sx / sw), e = (1 / Math.sqrt(sw) / 0.9) * (bot.h / 2);
      ctx.strokeStyle = pal.fg; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y - e); ctx.lineTo(x, y + e); ctx.stroke();
      disk(ctx, x, y, 3.2, pal.fg);
    }
    // model curves
    const curve = (a: number, b: number, o: number, color: string, wdt: number, dash?: number[]) => {
      const m = muModel(model, a, b, ZC);
      if (!m) return;
      for (const [P, f] of [[top, (k: number) => muY(m[k] + o - bestOff)], [bot, (k: number) => dY(m[k] + o - bestOff - MILNE[k])]] as const) {
        void P;
        ctx.strokeStyle = color; ctx.lineWidth = wdt; ctx.setLineDash(dash ?? []); ctx.beginPath();
        ZC.forEach((z, k) => { const x = zx(z), y = f(k); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };
    if (grid) curve(grid.best[0], grid.best[1], bestOff, '#ffffff', 1.4, [6, 4]);
    if (ch && ch.pts.length) { const n = ch.pts.length / 2, a = ch.pts[2 * n - 2], b = ch.pts[2 * n - 1]; curve(a, b, chi2Sn(data, model, a, b).offset, withAlpha('#67e8f9', 0.85), 1.4); }
    curve(p1, p2, off, qc, 2.4);
    ctx.restore();
    // legend
    const lg: [string, string, number[]?][] = [[qc, tx({ vi: 'điểm thử (bấm vào mặt phẳng tham số)', en: 'trial point (click the parameter plane)' })], ['#ffffff', tx({ vi: 'khớp tốt nhất', en: 'best fit' }), [6, 4]], ['#67e8f9', tx({ vi: 'mẫu MCMC hiện tại', en: 'current MCMC sample' })]];
    lg.forEach(([c, s, d], k) => { const y = top.y + 36 + k * 15; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash(d ?? []); ctx.beginPath(); ctx.moveTo(top.x + 10, y - 3); ctx.lineTo(top.x + 32, y - 3); ctx.stroke(); ctx.setLineDash([]); label(ctx, s, top.x + 38, y, pal.textDim, { size: 10.5, halo: pal.bg }); });
  }, [grid, gridRows, showGrid, model, p1, p2, data, trial, pal, lang, tx, playing, dataSrc, mt1, mt2]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = (e.target as HTMLCanvasElement).getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, P = L1.current;
    if (x < P.x || x > P.x + P.w || y < P.y || y > P.y + P.h) return;
    setP1(+(sp.r1[0] + ((x - P.x) / P.w) * (sp.r1[1] - sp.r1[0])).toFixed(3));
    setP2(+(sp.r2[0] + ((P.y + P.h - y) / P.h) * (sp.r2[1] - sp.r2[0])).toFixed(3));
  };

  const verdict = !Number.isFinite(trial.chi2) ? tx({ vi: 'không vật lý (không có Vụ Nổ Lớn)', en: 'unphysical (no Big Bang)' })
    : dchi < DCHI2_2D[0] ? tx({ vi: 'trong vùng 68%', en: 'inside the 68% region' }) : dchi < DCHI2_2D[1] ? tx({ vi: 'trong vùng 95%', en: 'inside the 95% region' }) : dchi < DCHI2_2D[2] ? tx({ vi: 'trong vùng 99,7%', en: 'inside the 99.7% region' }) : tx({ vi: 'bị dữ liệu loại', en: 'ruled out by the data' });
  const pmText = (m: number, s: number, d = 3) => `${fix(m, d, lang)} ± ${fix(s, d, lang)}`;

  return (
    <SimLayout
      id="f8"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{sp.s1} = {fix(p1, 3, lang)} · {sp.s2} = {fix(p2, 3, lang)}</span> · χ² = {Number.isFinite(trial.chi2) ? fix(trial.chi2, 1, lang) : '∞'} · Δχ² = {Number.isFinite(dchi) ? fix(dchi, 1, lang) : '-'} · {verdict}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      onReset={() => { setPlaying(false); setP1(sp.start[0]); setP2(sp.start[1]); resetChain(); }}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>MCMC<small>{chainStats ? tx({ vi: `${chainStats.n} mẫu · chấp nhận ${fix(100 * chainStats.acc, 0, lang)}%`, en: `${chainStats.n} samples · acceptance ${fix(100 * chainStats.acc, 0, lang)}%` }) : tx({ vi: 'bấm chạy để lấy mẫu', en: 'press play to sample' })}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Dữ liệu & mô hình', en: 'Data & model' })} dot="var(--grpF)">
            <Segmented value={dataSrc} onChange={(v) => { setDataSrc(v); setPlaying(false); }} options={[{ value: 'real', label: tx({ vi: 'Union2.1 thật (580 SN Ia)', en: 'Real Union2.1 (580 SNe Ia)' }) }, { value: 'mock', label: tx({ vi: 'Giả lập (biết đáp án)', en: 'Mock (known answer)' }) }]} small />
            <Segmented value={model} onChange={(v) => { setModel(v); setPlaying(false); setP1(SPACE[v].start[0]); setP2(SPACE[v].start[1]); }} options={[{ value: 'olcdm', label: tx({ vi: 'ΛCDM có độ cong (Ω_m, Ω_Λ)', en: 'Curved ΛCDM (Ω_m, Ω_Λ)' }) }, { value: 'wcdm', label: tx({ vi: 'wCDM phẳng (Ω_m, w)', en: 'Flat wCDM (Ω_m, w)' }) }]} small />
            {dataSrc === 'mock' && <>
              <Slider label={tx({ vi: 'Đáp án thật: Ω_m', en: 'True Ω_m' })} value={mt1} min={0.05} max={1} step={0.01} onChange={setMt1} display={fix(mt1, 2, lang)} />
              {model === 'olcdm'
                ? <Slider label={tx({ vi: 'Đáp án thật: Ω_Λ', en: 'True Ω_Λ' })} value={mtl} min={0} max={1.4} step={0.01} onChange={setMtl} display={fix(mt2, 2, lang)} />
                : <Slider label={tx({ vi: 'Đáp án thật: w', en: 'True w' })} value={mtw} min={-2} max={-0.3} step={0.01} onChange={setMtw} display={fix(mt2, 2, lang)} />}
              <button className="btn small" onClick={() => setMseed(mseed + 1)}>🎲 {tx({ vi: 'Bộ nhiễu khác', en: 'New noise draw' })}</button>
            </>}
            <Toggle label={tx({ vi: 'Bản đồ χ² và vùng tin cậy (quét lưới)', en: 'χ² map and confidence regions (grid scan)' })} checked={showGrid} onChange={setShowGrid} />
            <div className="field-hint">{tx({ vi: 'Bấm vào mặt phẳng tham số bên trái để chọn một vũ trụ thử: đường cong của nó hiện ngay trên giản đồ Hubble.', en: 'Click the parameter plane on the left to pick a trial universe: its curve appears on the Hubble diagram.' })}</div>
          </Section>
          <Section title={tx({ vi: 'Chuỗi Markov (Metropolis)', en: 'Markov chain (Metropolis)' })}>
            <Slider label={tx({ vi: 'Độ dài bước đề xuất', en: 'Proposal step size' })} value={stepK} min={0.1} max={4} step={0.05} log onChange={setStepK} display={`× ${fix(stepK, 2, lang)}`} hint={tx({ vi: 'Bước nhỏ: chấp nhận nhiều nhưng đi chậm. Bước lớn: hay bị từ chối. Tối ưu ~ 25–50% chấp nhận.', en: 'Small steps: high acceptance but slow. Large steps: frequent rejection. Aim for ~25–50% acceptance.' })} />
            <Slider label={tx({ vi: 'Tốc độ (mẫu/giây)', en: 'Speed (samples/s)' })} value={rate} min={2} max={300} step={1} log onChange={setRate} display={fix(rate, 0, lang)} />
            <div className="row">
              <button className="btn small" onClick={() => setPlaying((x) => !x)}>{playing ? '⏸' : '▶'} {playing ? tx({ vi: 'Tạm dừng', en: 'Pause' }) : tx({ vi: 'Chạy chuỗi', en: 'Run chain' })}</button>
              <button className="btn small" onClick={() => { resetChain(); }}>↺ {tx({ vi: 'Bắt đầu lại từ điểm thử', en: 'Restart from trial point' })}</button>
            </div>
            {student && <div className="eq-box"><Tex display tex={'\\chi^2 = \\sum_i \\frac{\\left[\\mu_i - \\mu(z_i;\\boldsymbol\\theta) - \\mathcal M\\right]^2}{\\sigma_i^2}'} /><Tex display tex={'P_{\\rm accept} = \\min\\!\\left(1,\\ e^{-\\Delta\\chi^2/2}\\right)'} /></div>}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'χ² điểm thử', en: 'Trial χ²' })} v={Number.isFinite(trial.chi2) ? fix(trial.chi2, 1, lang) : '∞'} frame={`${tx({ vi: 'Δχ² so với tốt nhất', en: 'Δχ² vs best' })} = ${Number.isFinite(dchi) ? fix(dchi, 2, lang) : '-'}`} tone={dchi < DCHI2_2D[1] ? 'good' : 'bad'} />
              <Readout k={tx({ vi: 'Đánh giá', en: 'Verdict' })} v={verdict} />
              <Readout k={tx({ vi: 'Khớp tốt nhất', en: 'Best fit' })} v={grid ? `${fix(grid.best[0], 2, lang)}, ${fix(grid.best[1], 2, lang)}` : '…'} frame={grid ? `$\\chi^2_{\\min}$ =${fix(grid.min, 1, lang)} / ${data.n - 3} ${tx({ vi: 'bậc tự do', en: 'dof' })}` : undefined} tone="accent" />
              <Readout k={`${sp.s1} ${tx({ vi: '(biên)', en: '(marginal)' })}`} v={post ? pmText(post.mean[0], post.sd[0], 2) : '…'} />
              <Readout k={`${sp.s2} ${tx({ vi: '(biên)', en: '(marginal)' })}`} v={post ? pmText(post.mean[1], post.sd[1], 2) : '…'} />
              <Readout k={tx({ vi: 'Xác suất đang tăng tốc', en: 'Probability of acceleration' })} v={post ? (post.pAccel > 0.9999 ? (lang === 'vi' ? '> 99,99%' : '> 99.99%') : `${fix(100 * post.pAccel, 1, lang)}%`) : '…'} frame="$q_0 < 0$" />
              {flat && <Readout k={tx({ vi: 'Nếu ép phẳng: Ω_m', en: 'Forcing flatness: Ω_m' })} v={`${fix(flat.om, 3, lang)}`} frame={`${fix(flat.lo, 3, lang)} – ${fix(flat.hi, 3, lang)} (Δχ² = 1)`} />}
              <Readout k={tx({ vi: 'q₀ của điểm thử', en: 'Trial q₀' })} v={fix(q0(model, p1, p2), 3, lang)} frame={q0(model, p1, p2) < 0 ? tx({ vi: 'tăng tốc', en: 'accelerating' }) : tx({ vi: 'giảm tốc', en: 'decelerating' })} />
              {chainStats && <Readout k={tx({ vi: 'MCMC (bỏ 20% đầu)', en: 'MCMC (20% burn-in)' })} v={`${fix(chainStats.m1, 2, lang)}, ${fix(chainStats.m2, 2, lang)}`} frame={`σ = ${fix(chainStats.s1, 2, lang)}, ${fix(chainStats.s2, 2, lang)} · ${chainStats.n} ${tx({ vi: 'mẫu', en: 'samples' })}`} wide />}
            </Readouts>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} onClick={onClick} style={{ cursor: 'crosshair' }} role="img" aria-label={tx({ vi: 'Mặt phẳng tham số và giản đồ Hubble', en: 'Parameter plane and Hubble diagram' })} />
    </SimLayout>
  );
}

function glowRing(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 16);
  g.addColorStop(0, withAlpha(color, 0.55)); g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 6, 0, 2 * Math.PI); ctx.stroke();
}
