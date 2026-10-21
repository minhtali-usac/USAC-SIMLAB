import { describe, it, expect } from 'vitest';
import { GASES, soundSpeedGas, CONDENSED, lightSpeedIn, thunderDistance, C } from '../src';

describe('F2 sound and light speeds', () => {
  const air = GASES.find((g) => g.id === 'air')!, he = GASES.find((g) => g.id === 'helium')!, ar = GASES.find((g) => g.id === 'argon')!;
  it('air at 20 °C ≈ 343.2 m/s and at 0 °C ≈ 331.3 m/s (textbook values)', () => {
    expect(soundSpeedGas(air, 293.15)).toBeCloseTo(343.2, 0);
    expect(soundSpeedGas(air, 273.15)).toBeCloseTo(331.3, 0);
  });
  it('v ∝ √(T/M): helium ≈ 2.9× air, argon ≈ 0.94× air at the same T', () => {
    expect(soundSpeedGas(he, 293.15) / soundSpeedGas(air, 293.15)).toBeCloseTo(Math.sqrt((5 / 3 / 1.4) * (0.0289647 / 0.004002602)), 10);
    expect(soundSpeedGas(he, 293.15)).toBeGreaterThan(1000);
    expect(soundSpeedGas(ar, 293.15)).toBeCloseTo(319, 0);
  });
  it('water ~4.3×, steel ~16.9× faster than air; light in water = c/1.333', () => {
    const w = CONDENSED.find((m) => m.id === 'water')!, s = CONDENSED.find((m) => m.id === 'steel')!;
    expect(w.v / soundSpeedGas(air, 293.15)).toBeCloseTo(4.32, 1);
    expect(s.v / soundSpeedGas(air, 293.15)).toBeCloseTo(16.87, 1);
    expect(lightSpeedIn(1.333)).toBeCloseTo(C / 1.333, 6);
  });
  it('thunder 3 s after the flash ⇒ ≈ 1.03 km (the “3 seconds per km” rule)', () => {
    expect(thunderDistance(3, soundSpeedGas(air, 293.15))).toBeCloseTo(1029.6, 0);
  });
});
