/**
 * Plane electromagnetic waves in vacuum (developed from lss-lab's "EM field and wave", github.com/MinhMPA/lss-lab).
 *  E(z, t) = (E₀ₓ cos φ, E₀ᵧ cos(φ + δ), 0),  φ = kz − ωt,  k = 2π/λ,  ω = 2πf,  c = λf;
 *  B = (1/c) ẑ × E  (Griffiths, Introduction to Electrodynamics, 4th ed., §9.2);
 *  time-averaged intensity I = ½ c ε₀ (E₀ₓ² + E₀ᵧ²);  photon energy E = h f.
 * Constants: c, h, e exact (SI 2019); μ₀ = 1.25663706212 × 10⁻⁶ N A⁻² (CODATA 2018), ε₀ = 1/(μ₀c²).
 */
import { C, H_PLANCK } from '../units/constants';

export const MU0 = 1.25663706212e-6;
export const EPS0 = 1 / (MU0 * C * C);
export const E_CHARGE = 1.602176634e-19;

export type Polarisation = 'linear' | 'circularL' | 'circularR' | 'elliptical';

/** Jones amplitudes (E₀ₓ, E₀ᵧ, δ) for amplitude E0, linear angle ψ [rad] or ellipticity ratio r = E₀ᵧ/E₀ₓ. */
export function jones(pol: Polarisation, E0: number, psi = 0, ratio = 0.5): { ex: number; ey: number; delta: number } {
  if (pol === 'linear') return { ex: E0 * Math.cos(psi), ey: E0 * Math.sin(psi), delta: 0 };
  // circular: equal amplitudes, ±90° phase. Handedness convention: seen by the receiver (looking toward the source),
  // left-circular rotates counter-clockwise (IEEE convention is the opposite - stated in the Model Card).
  const a = E0 / Math.SQRT2;
  if (pol === 'circularL') return { ex: a, ey: a, delta: Math.PI / 2 };
  if (pol === 'circularR') return { ex: a, ey: a, delta: -Math.PI / 2 };
  const n = Math.hypot(1, ratio);
  return { ex: E0 / n, ey: (E0 * ratio) / n, delta: Math.PI / 2 };
}

/** E and B vectors at phase φ = kz − ωt. */
export function fields(j: { ex: number; ey: number; delta: number }, phi: number) {
  const Ex = j.ex * Math.cos(phi), Ey = j.ey * Math.cos(phi + j.delta);
  // B = (1/c) ẑ × E = (−E_y, E_x, 0)/c
  return { E: [Ex, Ey, 0] as const, B: [-Ey / C, Ex / C, 0] as const };
}

export const frequencyOf = (lambda: number) => C / lambda;
export const photonEnergyJ = (lambda: number) => (H_PLANCK * C) / lambda;
export const photonEnergyEv = (lambda: number) => photonEnergyJ(lambda) / E_CHARGE;
/** Time-averaged intensity [W/m²] for Jones amplitudes. */
export const intensity = (ex: number, ey: number) => 0.5 * C * EPS0 * (ex * ex + ey * ey);
/** Peak field amplitude for a given intensity (linear polarisation). */
export const amplitudeForIntensity = (I: number) => Math.sqrt((2 * I) / (C * EPS0));

export type Band = 'gamma' | 'xray' | 'uv' | 'visible' | 'ir' | 'microwave' | 'radio';
/**
 * Conventional band edges [m] (approximate; boundaries differ between sources, e.g. ISO 21348):
 * γ < 10 pm < X < 10 nm < UV < 380 nm < visible < 750 nm < IR < 1 mm < microwave < 1 m < radio.
 */
export const BAND_EDGES: [Band, number][] = [['gamma', 1e-11], ['xray', 1e-8], ['uv', 3.8e-7], ['visible', 7.5e-7], ['ir', 1e-3], ['microwave', 1], ['radio', Infinity]];
export const bandOf = (lambda: number): Band => BAND_EDGES.find(([, edge]) => lambda < edge)![0];

/** Approximate sRGB colour of a visible wavelength (Bruton 1996 piecewise fit, display only); null outside 380–750 nm. */
export function wavelengthToRgb(lambdaM: number): [number, number, number] | null {
  const w = lambdaM * 1e9;
  if (w < 380 || w > 750) return null;
  let r = 0, g = 0, b = 0;
  if (w < 440) { r = -(w - 440) / 60; b = 1; } else if (w < 490) { g = (w - 440) / 50; b = 1; } else if (w < 510) { g = 1; b = -(w - 510) / 20; }
  else if (w < 580) { r = (w - 510) / 70; g = 1; } else if (w < 645) { r = 1; g = -(w - 645) / 65; } else r = 1;
  const f = w < 420 ? 0.3 + (0.7 * (w - 380)) / 40 : w > 700 ? 0.3 + (0.7 * (750 - w)) / 50 : 1;
  const gam = (v: number) => Math.round(255 * Math.pow(v * f, 0.8));
  return [gam(r), gam(g), gam(b)];
}

/** Example sources with exact or measured wavelengths [m]. */
export const EM_EXAMPLES: { id: string; lambda: number; source: string }[] = [
  { id: 'fm', lambda: C / 100e6, source: 'FM broadcast, 100 MHz' },
  { id: 'hi21', lambda: C / 1420.405751768e6, source: 'Hydrogen hyperfine line, 1420.405751768 MHz' },
  { id: 'wifi', lambda: C / 2.45e9, source: 'Wi-Fi / microwave oven, 2.45 GHz ISM band' },
  { id: 'cmbpeak', lambda: C / 160.23e9, source: 'CMB spectral peak in frequency, 160.23 GHz (Fixsen 2009)' },
  { id: 'halpha', lambda: 656.28e-9, source: 'Hα (air), 656.28 nm' },
  { id: 'green', lambda: 532e-9, source: 'Green laser pointer, 532 nm (frequency-doubled Nd:YAG)' },
  { id: 'cuka', lambda: 0.154056e-9, source: 'Cu Kα₁ X-ray, 0.154056 nm' },
  { id: 'annih', lambda: 2.42631e-12, source: 'Electron–positron annihilation γ, 511 keV (= h/(mₑc))' },
];
