/**
 * Sound vs light (developed from lss-lab's "Sound and light waves", github.com/MinhMPA/lss-lab).
 *  Ideal-gas sound speed v = √(γ R T / M) (e.g. Kinsler et al., Fundamentals of Acoustics, 4th ed., §5.6), R exact (SI 2019).
 *  Liquids and solids use measured values (sources inline). Light in a medium travels at c/n.
 */
import { C } from '../units/constants';

export const R_GAS = 8.314462618;

export interface Gas { id: string; gamma: number; molarMass: number; n: number; source: string }
/** γ: diatomic 7/5 (air, effectively), monatomic 5/3. n: refractive index at 589 nm, 0 °C, 1 atm (approximate). */
export const GASES: Gas[] = [
  { id: 'air', gamma: 1.4, molarMass: 0.0289647, n: 1.000293, source: 'dry air, M = 28.9647 g/mol (US Standard Atmosphere 1976)' },
  { id: 'helium', gamma: 5 / 3, molarMass: 0.004002602, n: 1.000035, source: 'He, monatomic' },
  { id: 'argon', gamma: 5 / 3, molarMass: 0.039948, n: 1.000281, source: 'Ar, monatomic' },
];
export const soundSpeedGas = (g: Gas, T: number) => Math.sqrt((g.gamma * R_GAS * T) / g.molarMass);

export interface Condensed { id: string; v: number; n: number | null; source: string }
/** n = null: opaque to visible light. */
export const CONDENSED: Condensed[] = [
  { id: 'water', v: 1482.3, n: 1.333, source: 'pure water at 20 °C (Del Grosso & Mader 1972, JASA 52, 1442); n at 589 nm' },
  { id: 'steel', v: 5790, n: null, source: 'type 347 stainless steel, plane longitudinal wave in bulk (CRC Handbook of Chemistry and Physics, 65th ed.)' },
];

export const lightSpeedIn = (n: number) => C / n;
/** Distance to a lightning strike from the flash-to-thunder delay (light time neglected; error ~ v/c). */
export const thunderDistance = (delay: number, v: number) => (delay * v) / (1 - v / C);
