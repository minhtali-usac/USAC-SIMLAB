import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSettings } from '../store/settings';

/** requestAnimationFrame loop delivering real elapsed seconds (clamped to avoid jumps after tab switch). */
export function useAnimationFrame(cb: (dt: number, now: number) => void, active = true) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      ref.current(dt, now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

export interface CanvasSize { w: number; h: number; dpr: number }

/**
 * Canvas sized to its parent with devicePixelRatio. `draw` receives a 2D context already
 * scaled to CSS pixels. Redraws on resize and whenever `deps` change; call the returned
 * `redraw` from animation loops.
 */
export function useCanvas2D(draw: (ctx: CanvasRenderingContext2D, size: CanvasSize) => void, deps: unknown[] = []) {
  // callback ref (also readable as .current) so canvases mounted later - e.g. inside a panel tab - get observed
  const [el, setEl] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useMemo(() => {
    const r = ((node: HTMLCanvasElement | null) => { r.current = node; setEl(node); }) as ((node: HTMLCanvasElement | null) => void) & { current: HTMLCanvasElement | null };
    r.current = null;
    return r;
  }, []);
  const sizeRef = useRef<CanvasSize>({ w: 0, h: 0, dpr: 1 });
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const quality = useSettings((s) => s.quality);

  const redraw = useRef(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const { w, h, dpr } = sizeRef.current;
    if (w === 0 || h === 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawRef.current(ctx, sizeRef.current);
  }).current;

  useLayoutEffect(() => {
    const c = el;
    if (!c || !c.parentElement) return;
    const ro = new ResizeObserver(() => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, quality === 'saver' ? 1.25 : 2);
      sizeRef.current = { w: r.width, h: r.height, dpr };
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      redraw();
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [el, redraw, quality]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { redraw(); }, deps);

  // redraw once the shared sky backdrop image has loaded
  useEffect(() => {
    window.addEventListener('usac-bg-ready', redraw);
    return () => window.removeEventListener('usac-bg-ready', redraw);
  }, [redraw]);

  return { canvasRef, redraw, size: sizeRef };
}

/** Theme palette resolved from CSS custom properties (for canvas drawing). */
export function usePalette() {
  const theme = useSettings((s) => s.theme);
  const [pal, setPal] = useState(() => readPalette());
  useEffect(() => { setPal(readPalette()); }, [theme]);
  return pal;
}

export function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    bg: v('--canvas-bg'), grid: v('--canvas-grid'), axis: v('--canvas-axis'), text: v('--canvas-text'),
    textDim: v('--text-dim'), textFaint: v('--text-faint'), fg: v('--text'),
    accent: v('--accent'), accent2: v('--accent-2'), teal: v('--teal'),
    sun: v('--sun'), ecliptic: v('--ecliptic'), equator: v('--equator'), horizon: v('--horizon'), meridian: v('--meridian'),
    moon: v('--moon'), danger: v('--danger'), ok: v('--ok'), warn: v('--warn'), gr: v('--gr'), sr: v('--sr'), newton: v('--newton'),
    light: document.documentElement.dataset.theme === 'light',
  };
}
export type Palette = ReturnType<typeof readPalette>;

/** Keyboard shortcuts for the simulator page. */
export function useKeys(map: Record<string, () => void>) {
  const ref = useRef(map);
  ref.current = map;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key === ' ' ? 'Space' : e.key.toLowerCase();
      const fn = ref.current[k];
      if (fn) { e.preventDefault(); fn(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function usePrefersReducedMotion() {
  const [r, setR] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return r;
}

/** Pointer drag helper on a canvas: reports CSS-pixel coordinates. */
export function usePointer(
  ref: React.RefObject<HTMLElement>,
  handlers: { down?: (x: number, y: number, e: PointerEvent) => void; move?: (x: number, y: number, dragging: boolean, e: PointerEvent) => void; up?: (x: number, y: number, e: PointerEvent) => void; wheel?: (dy: number, x: number, y: number) => void },
) {
  const h = useRef(handlers);
  h.current = handlers;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dragging = false;
    const pos = (e: PointerEvent | WheelEvent) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const down = (e: PointerEvent) => { dragging = true; el.setPointerCapture(e.pointerId); const [x, y] = pos(e); h.current.down?.(x, y, e); };
    const move = (e: PointerEvent) => { const [x, y] = pos(e); h.current.move?.(x, y, dragging, e); };
    const up = (e: PointerEvent) => { if (!dragging) return; dragging = false; const [x, y] = pos(e); h.current.up?.(x, y, e); };
    const wheel = (e: WheelEvent) => { if (!h.current.wheel) return; e.preventDefault(); const [x, y] = pos(e); h.current.wheel(e.deltaY, x, y); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [ref]);
}
