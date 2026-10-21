/**
 * Textured "3D" globes for 2D canvases: orthographic projection of an equirectangular map with
 * axial tilt, rotation and Lambert lighting from a given direction. Textures: Solar System Scope
 * (CC BY 4.0, based on NASA imagery) in public/tex - see CREDITS.md. Visual only (fidelity C).
 */
export type GlobeTex = 'sun' | 'mercury' | 'venus_atmosphere' | 'earth_daymap' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

export const PLANET_TEX: Record<string, GlobeTex> = {
  sun: 'sun', mercury: 'mercury', venus: 'venus_atmosphere', earth: 'earth_daymap', moon: 'moon', mars: 'mars',
  jupiter: 'jupiter', saturn: 'saturn', uranus: 'uranus', neptune: 'neptune',
};

interface Pixels { w: number; h: number; data: Uint8ClampedArray }
const pixels = new Map<string, Pixels | 'loading' | 'error'>();
const listeners = new Set<() => void>();
/** Called once a texture finishes loading (canvases that are not animated can redraw). */
export const onGlobeTextureLoaded = (f: () => void) => { listeners.add(f); return () => listeners.delete(f); };

function texPixels(name: GlobeTex): Pixels | null {
  const st = pixels.get(name);
  if (st && st !== 'loading' && st !== 'error') return st;
  if (!st) {
    pixels.set(name, 'loading');
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // downsample to ≤ 1024 px wide: plenty for on-screen globes, 4× less memory
      const w = Math.min(1024, img.naturalWidth), h = Math.round((w * img.naturalHeight) / img.naturalWidth);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(img, 0, 0, w, h);
      pixels.set(name, { w, h, data: g.getImageData(0, 0, w, h).data });
      listeners.forEach((f) => f());
    };
    img.onerror = () => pixels.set(name, 'error');
    img.src = `${import.meta.env.BASE_URL}tex/${name}.jpg`;
  }
  return null;
}

export interface GlobeOpts {
  /** Rotation about the spin axis [rad] (longitude facing the viewer = −rotation). */
  rotation?: number;
  /** Tilt of the spin axis in the picture plane [rad], positive = clockwise. */
  tilt?: number;
  /** Direction to the light source in screen coordinates (x right, y up, z toward viewer); null = fully lit. */
  light?: [number, number, number] | null;
  ambient?: number;
  /** Self-luminous body (Sun): limb darkening instead of Lambert shading. */
  emissive?: boolean;
}

const cache = new Map<string, HTMLCanvasElement>();
const MAX_CACHE = 96;

function render(px: Pixels, R: number, o: Required<Omit<GlobeOpts, 'light'>> & { light: [number, number, number] | null }): HTMLCanvasElement {
  const size = 2 * R;
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  const ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
  let lx = 0, ly = 0, lz = 1;
  if (o.light) { const n = Math.hypot(...o.light) || 1; [lx, ly, lz] = [o.light[0] / n, o.light[1] / n, o.light[2] / n]; }
  for (let j = 0; j < size; j++) {
    const sy = -((j + 0.5 - R) / R);
    for (let i = 0; i < size; i++) {
      const sx = (i + 0.5 - R) / R;
      const rr = sx * sx + sy * sy;
      if (rr > 1) continue;
      const sz = Math.sqrt(1 - rr);
      // undo the picture-plane tilt to get body-frame coordinates (y = spin axis)
      const bx = ct * sx - st * sy, by = st * sx + ct * sy;
      const lat = Math.asin(Math.max(-1, Math.min(1, by)));
      const lon = Math.atan2(bx, sz) + o.rotation;
      const u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1, v = 0.5 - lat / Math.PI;
      const ti = (Math.min(px.h - 1, Math.floor(v * px.h)) * px.w + Math.min(px.w - 1, Math.floor(u * px.w))) * 4;
      let shade: number;
      if (o.emissive) shade = 0.45 + 0.55 * Math.sqrt(sz);
      else if (o.light) shade = o.ambient + (1 - o.ambient) * Math.max(0, sx * lx + sy * ly + sz * lz);
      else shade = 0.35 + 0.65 * Math.sqrt(sz);
      const k = (j * size + i) * 4;
      img.data[k] = px.data[ti] * shade;
      img.data[k + 1] = px.data[ti + 1] * shade;
      img.data[k + 2] = px.data[ti + 2] * shade;
      // anti-aliased rim
      const edge = (1 - Math.sqrt(rr)) * R;
      img.data[k + 3] = edge < 1 ? Math.max(0, edge) * 255 : 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

/**
 * Draw a textured globe of CSS radius r at (x, y). Returns false until the texture is loaded,
 * so callers can draw a plain disk as a fallback.
 */
export function drawGlobe(ctx: CanvasRenderingContext2D, tex: GlobeTex, x: number, y: number, r: number, opts: GlobeOpts = {}): boolean {
  const px = texPixels(tex);
  if (!px || r <= 0.5) return false;
  const scale = Math.abs(ctx.getTransform().a) || 1;
  const R = Math.max(2, Math.min(512, Math.round(r * scale)));
  const o = { rotation: opts.rotation ?? 0, tilt: opts.tilt ?? 0, light: opts.light ?? null, ambient: opts.ambient ?? 0.07, emissive: opts.emissive ?? false };
  const q = (a: number, s: number) => Math.round(a / s);
  const key = [tex, R, q(((o.rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), 0.02), q(o.tilt, 0.02), o.light ? o.light.map((a) => q(a / (Math.hypot(...o.light!) || 1), 0.05)).join(',') : 'n', o.emissive ? 1 : 0, q(o.ambient, 0.01)].join('|');
  let c = cache.get(key);
  if (!c) {
    c = render(px, R, o);
    cache.set(key, c);
    if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value as string);
  }
  ctx.drawImage(c, x - r, y - r, 2 * r, 2 * r);
  return true;
}

/**
 * General textured sphere: each pixel's outward normal n (screen frame: x right, y up, z toward the viewer)
 * is mapped to body-fixed coordinates b = M·n (row-major 3×3); latitude = asin b_z, east longitude = atan2(b_y, b_x).
 * `sun` is the unit vector toward the Sun in the screen frame (Lambert shading). Not cached - callers pass a
 * fresh matrix each frame; cost ∝ r² (≈1–5 k pixels for on-screen bodies).
 */
export function drawGlobeMatrix(ctx: CanvasRenderingContext2D, tex: GlobeTex, x: number, y: number, r: number, M: number[], sun: [number, number, number], ambient = 0.06): boolean {
  const px = texPixels(tex);
  if (!px || r <= 0.5) return false;
  const scale = Math.abs(ctx.getTransform().a) || 1;
  const R = Math.max(2, Math.min(400, Math.round(r * scale)));
  const size = 2 * R;
  const c = scratch(size);
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  for (let j = 0; j < size; j++) {
    const sy = -((j + 0.5 - R) / R);
    for (let i = 0; i < size; i++) {
      const sx = (i + 0.5 - R) / R;
      const rr = sx * sx + sy * sy;
      if (rr > 1) continue;
      const sz = Math.sqrt(1 - rr);
      const bx = M[0] * sx + M[1] * sy + M[2] * sz, by = M[3] * sx + M[4] * sy + M[5] * sz, bz = M[6] * sx + M[7] * sy + M[8] * sz;
      const lat = Math.asin(Math.max(-1, Math.min(1, bz))), lon = Math.atan2(by, bx);
      const u = 0.5 + lon / (2 * Math.PI), v = 0.5 - lat / Math.PI;
      const ti = (Math.min(px.h - 1, Math.floor(v * px.h)) * px.w + Math.min(px.w - 1, Math.floor(u * px.w))) * 4;
      const lit = sx * sun[0] + sy * sun[1] + sz * sun[2];
      // soft terminator (twilight band ≈ 6°) instead of a hard edge
      const shade = ambient + (1 - ambient) * Math.min(1, Math.max(0, (lit + 0.05) / 1.05));
      const k = (j * size + i) * 4;
      img.data[k] = px.data[ti] * shade; img.data[k + 1] = px.data[ti + 1] * shade; img.data[k + 2] = px.data[ti + 2] * shade;
      const edge = (1 - Math.sqrt(rr)) * R;
      img.data[k + 3] = edge < 1 ? Math.max(0, edge) * 255 : 255;
    }
  }
  g.putImageData(img, 0, 0);
  ctx.drawImage(c, 0, 0, size, size, x - r, y - r, 2 * r, 2 * r);
  return true;
}

const scratchPool = new Map<number, HTMLCanvasElement>();
function scratch(size: number): HTMLCanvasElement {
  let c = scratchPool.get(size);
  if (!c) { c = document.createElement('canvas'); c.width = size; c.height = size; scratchPool.set(size, c); if (scratchPool.size > 12) scratchPool.delete(scratchPool.keys().next().value as number); }
  return c;
}

/** 3×3 row-major helpers for drawGlobeMatrix. */
export const rotZ = (a: number) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];
export const rotX = (a: number) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
export const matMul = (A: number[], B: number[]) => [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => A[3 * r] * B[c] + A[3 * r + 1] * B[3 + c] + A[3 * r + 2] * B[6 + c]));
