/** Canvas 2D drawing helpers shared by simulators. */
import type { Palette } from './hooks';
import { mathRuns, RUN_SCALE, RUN_SHIFT } from './mathRuns';

export function clear(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Real Milky Way panorama (ESO/S. Brunier, CC BY 4.0) used as a decorative sky backdrop.
 * Loaded once; canvases redraw when it arrives (event "usac-bg-ready").
 */
let skyImg: HTMLImageElement | null = null;
let skyReady = false;
function sky(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!skyImg) {
    skyImg = new Image();
    skyImg.decoding = 'async';
    skyImg.onload = () => { skyReady = true; window.dispatchEvent(new Event('usac-bg-ready')); };
    skyImg.src = `${import.meta.env.BASE_URL}img/milkyway.jpg`;
  }
  return skyReady ? skyImg : null;
}

/**
 * Decorative sky backdrop: a crop of the real Milky Way panorama (dimmed so the physics
 * stays readable), topped with a few procedural stars. Labelled decorative in model cards.
 */
export function drawBackgroundStars(ctx: CanvasRenderingContext2D, w: number, h: number, pal: Palette, seed = 7, density = 1) {
  if (pal.light) return;
  const img = sky();
  if (img) {
    // pick a seed-dependent window of the 2:1 panorama, scaled to cover the canvas
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(w / (iw * 0.55), h / (ih * 0.9));
    const sw = w / scale, sh = h / scale;
    const sx = ((seed * 0.137) % 1) * Math.max(0, iw - sw);
    const sy = Math.max(0, (ih - sh) / 2 + ((seed * 0.071) % 1 - 0.5) * (ih - sh) * 0.6);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(img, sx, Math.min(sy, ih - sh), sw, sh, 0, 0, w, h);
    ctx.restore();
    // vignette keeps the centre readable
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(5,6,10,0.55)');
    g.addColorStop(1, 'rgba(5,6,10,0.15)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const n = Math.floor(((w * h) / (img ? 9000 : 2600)) * density);
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, m = rnd();
    const a = 0.15 + 0.6 * m * m;
    ctx.fillStyle = `rgba(${200 + 55 * rnd()},${210 + 45 * rnd()},255,${a})`;
    const r = m > 0.97 ? 1.3 : m > 0.85 ? 0.9 : 0.6;
    ctx.fillRect(x, y, r, r);
  }
}

const imgCache = new Map<string, HTMLImageElement>();
/** Shared image loader for canvas drawing; returns null until loaded (then fires "usac-bg-ready"). */
export function photo(name: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let im = imgCache.get(name);
  if (!im) {
    im = new Image();
    im.decoding = 'async';
    im.onload = () => window.dispatchEvent(new Event('usac-bg-ready'));
    im.src = `${import.meta.env.BASE_URL}img/${name}`;
    imgCache.set(name, im);
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}

/** Draw a photographed disk (Moon/Earth…) cropped to a circle. `zoom` crops the photo margin. */
export function photoDisk(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, r: number, zoom = 1, rotate = 0): boolean {
  const im = photo(name);
  if (!im) return false;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  const s = Math.min(im.naturalWidth, im.naturalHeight) / zoom;
  ctx.drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, -r, -r, 2 * r, 2 * r);
  ctx.restore();
  return true;
}

export function glowDisk(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow = 3) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * glow);
  g.addColorStop(0, color);
  g.addColorStop(1 / glow, color);
  g.addColorStop(Math.min(1, 1.6 / glow), withAlpha(color, 0.25));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * glow, 0, Math.PI * 2);
  ctx.fill();
}

export function disk(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Accepts #rgb/#rrggbb/rgb()/rgba() and returns rgba with alpha. */
export function withAlpha(color: string, a: number): string {
  const c = color.trim();
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
    const n = parseInt(hex.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(',').map((x) => x.trim());
    return `rgba(${r},${g},${b},${a})`;
  }
  return c;
}

export function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width = 2, head = 8) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4));
  ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4));
  ctx.closePath();
  ctx.fill();
}

/** Canvas text label. Subscripts/superscripts (T_eff, Ω_Λ, σ₈, 10⁻⁹, a^1.5) are drawn as real shifted, smaller text. */
export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, opts: { align?: CanvasTextAlign; base?: CanvasTextBaseline; size?: number; weight?: number; mono?: boolean; halo?: string } = {}) {
  const size = opts.size ?? 12;
  const font = (px: number) => `${opts.weight ?? 500} ${px}px ${opts.mono ? "'JetBrains Mono', monospace" : "'Be Vietnam Pro', system-ui, sans-serif"}`;
  ctx.font = font(size);
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = opts.base ?? 'middle';
  const halo = opts.halo ?? (typeof document !== 'undefined' && document.documentElement.dataset.theme !== 'light' ? 'rgba(4,5,9,0.75)' : undefined);
  const runs = mathRuns(text);
  const draw = (t: string, px: number, py: number) => {
    if (halo) {
      ctx.strokeStyle = halo;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.strokeText(t, px, py);
    }
    ctx.fillStyle = color;
    ctx.fillText(t, px, py);
  };
  if (runs.length === 1 && runs[0].k === 'n') { draw(runs[0].t, x, y); return; }
  // lay the runs out left-to-right from the aligned start
  const widths = runs.map((r) => { ctx.font = font(size * RUN_SCALE[r.k]); return ctx.measureText(r.t).width; });
  const total = widths.reduce((a, b) => a + b, 0);
  const align = opts.align ?? 'left';
  const rtl = getComputedDirection(ctx) === 'rtl';
  const atEnd = align === 'right' || (align === 'end' && !rtl) || (align === 'start' && rtl);
  let cx = align === 'center' ? x - total / 2 : atEnd ? x - total : x;
  ctx.textAlign = 'left';
  runs.forEach((r, i) => {
    ctx.font = font(size * RUN_SCALE[r.k]);
    draw(r.t, cx, y + RUN_SHIFT[r.k] * size);
    cx += widths[i];
  });
  ctx.font = font(size);
  ctx.textAlign = align;
}

function getComputedDirection(ctx: CanvasRenderingContext2D): string {
  return ctx.direction === 'inherit' ? (typeof document !== 'undefined' ? document.documentElement.dir || 'ltr' : 'ltr') : ctx.direction;
}

/** "Nice" tick step for an axis span. */
export function niceStep(span: number, target = 6): number {
  const raw = span / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  const f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}

/** Draw a polyline from arrays of screen points. */
export function polyline(ctx: CanvasRenderingContext2D, pts: ArrayLike<number>, color: string, width = 1.5, dash?: number[]) {
  if (pts.length < 4) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash ?? []);
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** CSS rgb() string → [r,g,b] 0..255 */
export function parseRgb(c: string): [number, number, number] {
  const m = c.match(/\d+(\.\d+)?/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [255, 255, 255];
}
