/**
 * Bright-star mini catalogue, J2000.0 coordinates (ICRS), V magnitude and B−V colour.
 * Source: Yale Bright Star Catalogue 5th ed. (Hoffleit & Warren 1991) / SIMBAD.
 * Precession from J2000 to the display date is neglected (≤ 0.4° in 2026) - see model cards.
 */
import { sexagesimal } from '../units/convert';

export interface Star {
  name: string;
  /** Right ascension [deg]. */
  ra: number;
  /** Declination [deg]. */
  dec: number;
  mag: number;
  bv: number;
}

type Raw = [string, number, number, number, number, number, number, number, number, boolean?];
// name, RA h m s, Dec d m s, Vmag, B−V, negative-dec flag (for −00°)
const RAW: Raw[] = [
  ['Sirius', 6, 45, 8.92, -16, 42, 58.0, -1.46, 0.0],
  ['Canopus', 6, 23, 57.11, -52, 41, 44.4, -0.74, 0.15],
  ['Rigil Kentaurus', 14, 39, 36.49, -60, 50, 2.4, -0.27, 0.71],
  ['Arcturus', 14, 15, 39.67, 19, 10, 56.7, -0.05, 1.23],
  ['Vega', 18, 36, 56.34, 38, 47, 1.3, 0.03, 0.0],
  ['Capella', 5, 16, 41.36, 45, 59, 52.8, 0.08, 0.8],
  ['Rigel', 5, 14, 32.27, -8, 12, 5.9, 0.13, -0.03],
  ['Procyon', 7, 39, 18.12, 5, 13, 30.0, 0.34, 0.42],
  ['Achernar', 1, 37, 42.85, -57, 14, 12.3, 0.46, -0.16],
  ['Betelgeuse', 5, 55, 10.31, 7, 24, 25.4, 0.5, 1.85],
  ['Hadar', 14, 3, 49.41, -60, 22, 22.9, 0.61, -0.23],
  ['Altair', 19, 50, 47.0, 8, 52, 6.0, 0.76, 0.22],
  ['Acrux', 12, 26, 35.9, -63, 5, 56.7, 0.76, -0.24],
  ['Aldebaran', 4, 35, 55.24, 16, 30, 33.5, 0.86, 1.54],
  ['Antares', 16, 29, 24.46, -26, 25, 55.2, 0.96, 1.83],
  ['Spica', 13, 25, 11.58, -11, 9, 40.8, 0.97, -0.23],
  ['Pollux', 7, 45, 18.95, 28, 1, 34.3, 1.14, 1.0],
  ['Fomalhaut', 22, 57, 39.05, -29, 37, 20.1, 1.16, 0.09],
  ['Deneb', 20, 41, 25.92, 45, 16, 49.2, 1.25, 0.09],
  ['Mimosa', 12, 47, 43.27, -59, 41, 19.5, 1.25, -0.23],
  ['Regulus', 10, 8, 22.31, 11, 58, 2.0, 1.4, -0.11],
  ['Adhara', 6, 58, 37.55, -28, 58, 19.5, 1.5, -0.21],
  ['Castor', 7, 34, 35.86, 31, 53, 17.8, 1.58, 0.03],
  ['Shaula', 17, 33, 36.52, -37, 6, 13.8, 1.62, -0.22],
  ['Gacrux', 12, 31, 9.96, -57, 6, 47.6, 1.64, 1.6],
  ['Bellatrix', 5, 25, 7.86, 6, 20, 58.9, 1.64, -0.22],
  ['Elnath', 5, 26, 17.51, 28, 36, 26.8, 1.65, -0.13],
  ['Miaplacidus', 9, 13, 11.98, -69, 43, 1.9, 1.67, 0.07],
  ['Alnilam', 5, 36, 12.81, -1, 12, 6.9, 1.69, -0.18],
  ['Alnitak', 5, 40, 45.53, -1, 56, 33.3, 1.77, -0.21],
  ['Alioth', 12, 54, 1.75, 55, 57, 35.4, 1.77, -0.02],
  ['Dubhe', 11, 3, 43.67, 61, 45, 3.7, 1.79, 1.07],
  ['Mirfak', 3, 24, 19.37, 49, 51, 40.2, 1.79, 0.48],
  ['Sargas', 17, 37, 19.13, -42, 59, 52.2, 1.86, 0.4],
  ['Kaus Australis', 18, 24, 10.32, -34, 23, 4.6, 1.85, -0.03],
  ['Alkaid', 13, 47, 32.44, 49, 18, 47.8, 1.86, -0.19],
  ['Polaris', 2, 31, 49.09, 89, 15, 50.8, 1.98, 0.6],
  ['Alphard', 9, 27, 35.24, -8, 39, 31.0, 1.98, 1.44],
  ['Hamal', 2, 7, 10.41, 23, 27, 44.7, 2.0, 1.15],
  ['Nunki', 18, 55, 15.93, -26, 17, 48.2, 2.05, -0.13],
  ['Kochab', 14, 50, 42.33, 74, 9, 19.8, 2.08, 1.47],
  ['Saiph', 5, 47, 45.39, -9, 40, 10.6, 2.09, -0.17],
  ['Algol', 3, 8, 10.13, 40, 57, 20.3, 2.12, -0.05],
  ['Denebola', 11, 49, 3.58, 14, 34, 19.4, 2.13, 0.09],
  ['Mintaka', 5, 32, 0.4, 0, 17, 56.7, 2.23, -0.22, true],
  ['Sadr', 20, 22, 13.7, 40, 15, 24.0, 2.23, 0.67],
  ['Mizar', 13, 23, 55.54, 54, 55, 31.3, 2.23, 0.02],
  ['Schedar', 0, 40, 30.44, 56, 32, 14.4, 2.24, 1.17],
  ['Caph', 0, 9, 10.69, 59, 8, 59.2, 2.28, 0.34],
  ['Dschubba', 16, 0, 20.01, -22, 37, 18.1, 2.29, -0.12],
  ['Merak', 11, 1, 50.48, 56, 22, 56.7, 2.37, -0.02],
  ['Phecda', 11, 53, 49.85, 53, 41, 41.1, 2.44, 0.04],
  ['Navi', 0, 56, 42.53, 60, 43, 0.3, 2.47, -0.15],
  ['Gienah Cygni', 20, 46, 12.68, 33, 58, 12.9, 2.48, 1.03],
  ['Ruchbah', 1, 25, 48.95, 60, 14, 7.0, 2.68, 0.13],
  ['Imai', 12, 15, 8.72, -58, 44, 56.1, 2.79, -0.19],
  ['Fawaris', 19, 44, 58.48, 45, 7, 50.9, 2.87, -0.03],
  ['Albireo', 19, 30, 43.29, 27, 57, 34.8, 3.05, 1.09],
  ['Megrez', 12, 15, 25.56, 57, 1, 57.4, 3.31, 0.08],
  ['Segin', 1, 54, 23.73, 63, 40, 12.4, 3.37, -0.15],
];

export const BRIGHT_STARS: Star[] = RAW.map(([name, h, m, s, d, dm, ds, mag, bv, neg]) => ({
  name,
  ra: sexagesimal(h, m, s) * 15,
  dec: sexagesimal(d, dm, ds, neg ?? false),
  mag,
  bv,
}));

/** Asterism / constellation stick figures (pairs of star names). */
export const CONSTELLATION_LINES: { name: string; pairs: [string, string][] }[] = [
  { name: 'Orion', pairs: [['Betelgeuse', 'Bellatrix'], ['Bellatrix', 'Mintaka'], ['Mintaka', 'Alnilam'], ['Alnilam', 'Alnitak'], ['Alnitak', 'Saiph'], ['Saiph', 'Rigel'], ['Rigel', 'Mintaka'], ['Betelgeuse', 'Alnitak']] },
  { name: 'Ursa Major', pairs: [['Dubhe', 'Merak'], ['Merak', 'Phecda'], ['Phecda', 'Megrez'], ['Megrez', 'Dubhe'], ['Megrez', 'Alioth'], ['Alioth', 'Mizar'], ['Mizar', 'Alkaid']] },
  { name: 'Cassiopeia', pairs: [['Caph', 'Schedar'], ['Schedar', 'Navi'], ['Navi', 'Ruchbah'], ['Ruchbah', 'Segin']] },
  { name: 'Crux', pairs: [['Acrux', 'Gacrux'], ['Mimosa', 'Imai']] },
  { name: 'Cygnus', pairs: [['Deneb', 'Sadr'], ['Sadr', 'Albireo'], ['Gienah Cygni', 'Sadr'], ['Sadr', 'Fawaris']] },
  { name: 'Summer Triangle', pairs: [['Vega', 'Deneb'], ['Deneb', 'Altair'], ['Altair', 'Vega']] },
  { name: 'Scorpius', pairs: [['Dschubba', 'Antares'], ['Antares', 'Shaula'], ['Shaula', 'Sargas']] },
];

/** Approximate RGB of a star from its B−V index (Ballesteros 2012 temperature, then blackbody). */
export function bvToTemperature(bv: number): number {
  return 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
}
