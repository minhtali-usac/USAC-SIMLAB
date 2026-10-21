import { describe, it, expect } from 'vitest';
import { EPS0, MU0, jones, fields, intensity, amplitudeForIntensity, photonEnergyEv, frequencyOf, bandOf, wavelengthToRgb, EM_EXAMPLES, C } from '../src';

describe('F1 electromagnetic plane waves', () => {
  it('c = 1/√(μ₀ε₀) and ε₀ ≈ 8.8541878 × 10⁻¹² F/m', () => {
    expect(1 / Math.sqrt(MU0 * EPS0)).toBeCloseTo(C, 3);
    expect(EPS0 / 8.8541878128e-12).toBeCloseTo(1, 9);
  });
  it('E ⟂ B ⟂ ẑ and |B| = |E|/c at every phase, for every polarisation', () => {
    for (const p of ['linear', 'circularL', 'circularR', 'elliptical'] as const) {
      const j = jones(p, 10, 0.4, 0.5);
      for (let k = 0; k < 16; k++) {
        const { E, B } = fields(j, (k / 16) * 2 * Math.PI);
        expect(E[0] * B[0] + E[1] * B[1]).toBeCloseTo(0, 15);
        expect(Math.hypot(...B) * C).toBeCloseTo(Math.hypot(...E), 10);
      }
    }
  });
  it('circular polarisation has constant |E|; total intensity independent of polarisation', () => {
    const j = jones('circularL', 10);
    for (let k = 0; k < 8; k++) expect(Math.hypot(...fields(j, k).E)).toBeCloseTo(10 / Math.SQRT2, 12);
    const I1 = intensity(jones('linear', 10).ex, jones('linear', 10).ey), I2 = intensity(j.ex, j.ey);
    expect(I2).toBeCloseTo(I1, 12);
  });
  it('sunlight 1361 W/m² ↔ E₀ ≈ 1013 V/m; 532 nm photon ≈ 2.33 eV; 21 cm line ≈ 21.106 cm; 511 keV', () => {
    expect(amplitudeForIntensity(1361)).toBeCloseTo(1012.6, 0);
    expect(photonEnergyEv(532e-9)).toBeCloseTo(2.3305, 3);
    expect(EM_EXAMPLES.find((e) => e.id === 'hi21')!.lambda * 100).toBeCloseTo(21.106, 3);
    expect(photonEnergyEv(EM_EXAMPLES.find((e) => e.id === 'annih')!.lambda) / 1e3).toBeCloseTo(511.0, 0);
    expect(frequencyOf(C)).toBe(1);
  });
  it('band edges and visible colours', () => {
    expect(bandOf(500e-9)).toBe('visible'); expect(bandOf(1e-12)).toBe('gamma'); expect(bandOf(3)).toBe('radio'); expect(bandOf(0.12)).toBe('microwave');
    expect(wavelengthToRgb(1e-6)).toBeNull();
    const red = wavelengthToRgb(650e-9)!; expect(red[0]).toBeGreaterThan(200); expect(red[2]).toBe(0);
  });
});
