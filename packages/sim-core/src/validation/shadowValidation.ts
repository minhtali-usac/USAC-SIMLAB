/**
 * D3 check: the GPU ray tracer integrates u'' = −u + 3u² (M = 1) with fixed-step RK4 in φ, in float32,
 * starting from a static camera at r0. This is a line-by-line CPU port of that loop (disk off) used to
 * measure where the rendered shadow edge falls compared with the analytic edge
 *   sin α_sh = 3√3 √(1 − 2/r0) / r0   (Synge 1966).
 */
import { SHADOW_B_M } from '../relativity-gr/schwarzschild';

export type RayFate = 'captured' | 'escaped' | 'truncated';

/** Fate of one camera ray at angle α from the inward radial direction (sinA, cosA > 0 = inward). */
export function shaderRayFate(r0: number, sinA: number, cosA: number, h: number, maxSteps: number, f32 = true): RayFate {
  const F = f32 ? Math.fround : (x: number) => x;
  let u = F(1 / r0);
  let du = F(F(u * F(Math.sqrt(F(1 - 2 * u)))) * F(cosA / sinA));
  const hh = F(h);
  for (let i = 0; i < maxSteps; i++) {
    const k1u = du, k1v = F(-u + F(3 * F(u * u)));
    const u2 = F(u + F(0.5 * hh * k1u)), v2 = F(du + F(0.5 * hh * k1v));
    const k2u = v2, k2v = F(-u2 + F(3 * F(u2 * u2)));
    const u3 = F(u + F(0.5 * hh * k2u)), v3 = F(du + F(0.5 * hh * k2v));
    const k3u = v3, k3v = F(-u3 + F(3 * F(u3 * u3)));
    const u4 = F(u + F(hh * k3u)), v4 = F(du + F(hh * k3v));
    const k4u = v4, k4v = F(-u4 + F(3 * F(u4 * u4)));
    const un = F(u + F(F(hh / 6) * F(k1u + 2 * k2u + 2 * k3u + k4u)));
    const dun = F(du + F(F(hh / 6) * F(k1v + 2 * k2v + 2 * k3v + k4v)));
    if (un >= 0.5) return 'captured';
    if (un <= 0) return 'escaped';
    u = un; du = dun;
  }
  return 'truncated';
}

/** Analytic angular radius of the shadow [rad] for a static observer at r0. */
export const shadowAngle = (r0: number) => Math.asin((SHADOW_B_M * Math.sqrt(1 - 2 / r0)) / r0);

/**
 * Rendered shadow edge: the smallest angle α at which a ray escapes (bisection on the capture/escape
 * boundary; 'truncated' rays render black, so they count as shadow, as on the GPU).
 */
export function renderedShadowAngle(r0: number, h: number, maxSteps: number, f32 = true): number {
  const isShadow = (a: number) => shaderRayFate(r0, Math.sin(a), Math.cos(a), h, maxSteps, f32) !== 'escaped';
  const a0 = shadowAngle(r0);
  let lo = a0 * 0.8, hi = a0 * 1.2;
  if (!isShadow(lo) || isShadow(hi)) return NaN;
  for (let k = 0; k < 50; k++) { const m = 0.5 * (lo + hi); if (isShadow(m)) lo = m; else hi = m; }
  return 0.5 * (lo + hi);
}

/** Relative shadow-edge error of the shader for the two quality presets (high: h 0.012, 1100 steps; saver: 0.02, 650). */
export function validateShadowEdge(radii = [8, 15, 30, 60, 120]) {
  return radii.map((r0) => {
    const exact = shadowAngle(r0);
    const high = renderedShadowAngle(r0, 0.012, 1100);
    const saver = renderedShadowAngle(r0, 0.02, 650);
    return { r0, exactDeg: (exact * 180) / Math.PI, highRelErr: high / exact - 1, saverRelErr: saver / exact - 1 };
  });
}
