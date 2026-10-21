/**
 * Colour maps for density fields - inferno (stops sampled from matplotlib, CC0) and a hand-made
 * "cosmic" navy → violet → amber → white ramp (display only) - and a helper that turns a G×G scalar field into a canvas image.
 */
type Stop = [number, number, number];
const INFERNO: Stop[] = [[0, 0, 4], [27, 12, 65], [74, 12, 107], [120, 28, 109], [165, 44, 96], [207, 68, 70], [237, 105, 37], [251, 155, 6], [247, 209, 61], [252, 255, 164]];
const COSMIC: Stop[] = [[3, 4, 12], [14, 18, 48], [36, 32, 96], [82, 46, 140], [150, 62, 150], [214, 92, 120], [247, 146, 86], [255, 205, 130], [255, 244, 214], [255, 255, 255]];

function lut(stops: Stop[]): Uint8ClampedArray {
  const out = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = (i / 255) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(t)), u = t - k;
    for (let c = 0; c < 3; c++) out[3 * i + c] = stops[k][c] + (stops[k + 1][c] - stops[k][c]) * u;
  }
  return out;
}
export const LUTS = { inferno: lut(INFERNO), cosmic: lut(COSMIC) };
export type ColorMap = keyof typeof LUTS;

/** CSS colour at t ∈ [0, 1] (legends). */
export function cmapCss(map: ColorMap, t: number): string {
  const L = LUTS[map], i = 3 * Math.round(Math.max(0, Math.min(1, t)) * 255);
  return `rgb(${L[i]},${L[i + 1]},${L[i + 2]})`;
}

const scratch = new Map<number, HTMLCanvasElement>();
/**
 * Render field f (row-major, G×G, y down) through log10 into [lo, hi] onto ctx at (x, y, size×size), bilinear upscaled.
 */
export function drawLogField(ctx: CanvasRenderingContext2D, f: ArrayLike<number>, G: number, x: number, y: number, size: number, lo: number, hi: number, map: ColorMap = 'cosmic') {
  let c = scratch.get(G);
  if (!c) { c = document.createElement('canvas'); c.width = G; c.height = G; scratch.set(G, c); }
  const g = c.getContext('2d')!, img = g.createImageData(G, G), L = LUTS[map];
  for (let k = 0; k < G * G; k++) {
    const t = (Math.log10(Math.max(1e-6, f[k])) - lo) / (hi - lo);
    const i = 3 * Math.round(Math.max(0, Math.min(1, t)) * 255);
    img.data[4 * k] = L[i]; img.data[4 * k + 1] = L[i + 1]; img.data[4 * k + 2] = L[i + 2]; img.data[4 * k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c, x, y, size, size);
  ctx.restore();
}
